const OrderModel = require("../models/orderModel");
const db = require("../config/database");

// ADMIN: GET /api/orders (nested, grouped by order)
const getAllOrders = (req, res) => {
  OrderModel.getAll((err, rows) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan pada server",
        data: null,
      });
    }
    // Group flat rows into nested orders
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.id)) {
        map.set(r.id, {
          id: r.id,
          status: r.status,
          total_amount: r.total_amount,
          shipping_address: r.shipping_address,
          payment_proof: r.payment_proof,
          payment_method: r.payment_method,
          bank_name: r.bank_name,
          created_at: r.created_at,
          user_name: r.user_name || null,
          user_email: r.user_email || null,
          items: [],
        });
      }
      if (r.item_id) {
        map.get(r.id).items.push({
          image_url: r.image_url,
          product_name: r.product_name,
          quantity: r.quantity,
          price_at_purchase: r.price_at_purchase,
          subtotal: Number(r.price_at_purchase) * Number(r.quantity),
        });
      }
    }

    const orders = Array.from(map.values());

    return res.json({
      status: "success",
      message: "Fetched Orders Successfully",
      data: orders,
    });
  });
};

// USER: GET /api/my-orders (flat rows)
const getMyOrders = (req, res) => {
  const userId = req.user.id;
  OrderModel.getMine(userId, (err, rows) => {
    if (err) {
      console.error("Error fetching user orders:", err);
      return res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan pada server",
        data: null,
      });
    }
    return res.json({
      status: "success",
      message: "Fetched User Orders Successfully",
      data: rows,
    });
  });
};

// USER: GET /api/my-orders/nested
const getMyOrdersNested = (req, res) => {
  const userId = req.user.id;
  OrderModel.getMineNested(userId, (err, rows) => {
    if (err) {
      console.error("Error fetching user orders:", err);
      return res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan pada server",
        data: null,
      });
    }
    const map = new Map();
    for (const r of rows) {
      if (!map.has(r.id)) {
        map.set(r.id, {
          id: r.id,
          status: r.status,
          total_amount: r.total_amount,
          shipping_address: r.shipping_address,
          payment_proof: r.payment_proof,
          payment_method: r.payment_method,
          bank_name: r.bank_name,
          created_at: r.created_at,
          items: [],
        });
      }
      if (r.order_item_id) {
        map.get(r.id).items.push({
          product_name: r.product_name,
          image_url: r.product_image,
          quantity: r.quantity,
          price_at_purchase: r.price_at_purchase,
          subtotal: Number(r.price_at_purchase) * Number(r.quantity),
        });
      }
    }

    const orders = Array.from(map.values());

    return res.json({
      status: "success",
      message: "Fetched Orders Successfully",
      data: orders,
    });
  });
};

// USER: PUT /api/orders/:id/cancel — cancel own pending/paid order
const cancelMyOrder = (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  db.query("SELECT status, user_id FROM orders WHERE id = ?", [orderId], (err, rows) => {
    if (err) {
      console.error("Error checking order:", err);
      return res.status(500).json({ status: "error", message: "Gagal membatalkan pesanan", data: null });
    }
    if (!rows.length) {
      return res.status(404).json({ status: "error", message: "Pesanan tidak ditemukan", data: null });
    }
    const order = rows[0];
    if (order.user_id !== userId) {
      return res.status(403).json({ status: "error", message: "Tidak punya akses", data: null });
    }
    if (order.status !== "pending" && order.status !== "paid") {
      return res.status(400).json({ status: "error", message: "Pesanan hanya bisa dibatalkan sebelum diproses", data: null });
    }
    db.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [orderId], (err2) => {
      if (err2) {
        console.error("Error cancelling order:", err2);
        return res.status(500).json({ status: "error", message: "Gagal membatalkan pesanan", data: null });
      }
      return res.json({ status: "success", message: "Pesanan berhasil dibatalkan", data: null });
    });
  });
};

// USER: POST /api/orders
const createOrder = (req, res) => {
  const userId = req.user.id;
  let { items, shipping_address, address, payment_method, bank_name } = req.body || {};
  shipping_address = shipping_address || address;

  if (!shipping_address || String(shipping_address).trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "Alamat pengiriman wajib diisi",
      data: null,
    });
  }

  // If no items provided, use cart items
  const useCart = !items || !Array.isArray(items) || items.length === 0;

  if (useCart) {
    const cartSql = "SELECT ci.product_id, ci.quantity FROM cart_items ci WHERE ci.user_id = ?";
    db.query(cartSql, [userId], (errCart, cartRows) => {
      if (errCart) {
        console.error("DB error fetching cart:", errCart);
        return res.status(500).json({ status: "error", message: "Gagal mengambil keranjang", data: null });
      }
      if (!cartRows || cartRows.length === 0) {
        return res.status(400).json({ status: "error", message: "Keranjang kosong", data: null });
      }
      checkoutWithItems(userId, cartRows, shipping_address, payment_method, bank_name, res);
    });
  } else {
    checkoutWithItems(userId, items, shipping_address, payment_method, bank_name, res);
  }
};

const checkoutWithItems = (userId, items, shipping_address, payment_method, bank_name, res) => {
  // Normalize items
  const normalized = [];
  for (const it of items) {
    const pid = parseInt(it.product_id, 10);
    const qty = parseInt(it.quantity, 10);
    if (!Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({ status: "error", message: "product_id tidak valid", data: null });
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ status: "error", message: "quantity tidak valid", data: null });
    }
    normalized.push({ product_id: pid, quantity: qty });
  }

  // Merge duplicates
  const mergedMap = new Map();
  for (const it of normalized) {
    mergedMap.set(it.product_id, (mergedMap.get(it.product_id) || 0) + it.quantity);
  }
  const mergedItems = Array.from(mergedMap.entries()).map(([product_id, quantity]) => ({ product_id, quantity }));
  const productIds = mergedItems.map((x) => x.product_id);

  db.getConnection((errConn, conn) => {
    if (errConn) {
      console.error("DB connection error:", errConn);
      return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    const rollback = (httpStatus, message, data) => {
      conn.rollback(() => {
        conn.release();
        return res.status(httpStatus).json({ status: "error", message, data: data || null });
      });
    };

    conn.beginTransaction((errTx) => {
      if (errTx) {
        conn.release();
        console.error("beginTransaction error:", errTx);
        return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
      }

      // Lock products for update
      OrderModel.getProductsForUpdate(conn, productIds, (errP, products) => {
        if (errP) {
          console.error("getProductsForUpdate error:", errP);
          return rollback(500, "Terjadi kesalahan pada server");
        }

        const productMap = new Map(products.map((p) => [Number(p.id), p]));

        // Validate all products exist
        const missing = productIds.filter((id) => !productMap.has(Number(id)));
        if (missing.length > 0) {
          return rollback(400, "Produk tidak ditemukan: " + missing.join(", "));
        }

        // Validate stock
        for (const it of mergedItems) {
          const p = productMap.get(it.product_id);
          if (Number(p.stock) < Number(it.quantity)) {
            return rollback(400, "Stok tidak cukup untuk " + p.name + " (stok: " + p.stock + ", diminta: " + it.quantity + ")");
          }
        }

        // Compute prices from DB
        const computedItems = mergedItems.map((it) => ({
          product_id: it.product_id,
          quantity: it.quantity,
          price_at_purchase: Number(productMap.get(it.product_id).price),
        }));

        const totalAmount = computedItems.reduce((sum, it) => sum + it.price_at_purchase * it.quantity, 0);

        // Insert order header
        OrderModel.createOrder(conn, userId, totalAmount, shipping_address, payment_method, bank_name, (errO, resultO) => {
          if (errO) {
            console.error("createOrder error:", errO);
            return rollback(500, "Gagal membuat pesanan");
          }

          const orderId = resultO.insertId;

          // Insert order items
          OrderModel.insertOrderItems(conn, orderId, computedItems, (errI) => {
            if (errI) {
              console.error("insertOrderItems error:", errI);
              return rollback(500, "Gagal menyimpan item pesanan");
            }

            // Decrement stock
            OrderModel.decrementStocks(conn, mergedItems, (errS) => {
              if (errS) {
                console.error("decrementStocks error:", errS);
                return rollback(500, "Gagal mengurangi stok");
              }

              // Commit
              conn.commit((errC) => {
                if (errC) {
                  console.error("commit error:", errC);
                  return rollback(500, "Gagal menyimpan pesanan");
                }

                // Clear cart after successful checkout
                const clearCartSql = "DELETE FROM cart_items WHERE user_id = ?";
                conn.query(clearCartSql, [userId], () => {
                  conn.release();
                  return res.status(201).json({
                    status: "success",
                    message: "Pesanan berhasil dibuat",
                    data: {
                      order_id: orderId,
                      total_amount: totalAmount,
                      items: computedItems,
                    },
                  });
                });
              });
            });
          });
        });
      });
    });
  });
};

// ADMIN: PUT /api/orders/:id/status
const updateStatus = (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  // Allowed forward transitions only
  const flow = {
    pending:  ['confirmed', 'paid', 'cancelled'],
    paid:     ['confirmed', 'processing', 'cancelled'],
    confirmed:['processing', 'cancelled'],
    processing:['shipped', 'cancelled'],
    shipped:  ['delivered', 'cancelled'],
    delivered: ['completed'],
    completed: [],
    cancelled: []
  };

  // First get current status
  db.query("SELECT status FROM orders WHERE id = ?", [orderId], (errQ, rows) => {
    if (errQ) {
      console.error("Error fetching order:", errQ);
      return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    if (rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Order tidak ditemukan", data: null });
    }

    const current = rows[0].status;

    // Terminal states — cannot change
    if (current === 'completed' || current === 'cancelled') {
      return res.status(400).json({
        status: "error",
        message: "Order sudah " + (current === 'completed' ? 'selesai' : 'dibatalkan') + ", tidak bisa diubah",
        data: null
      });
    }

    // Check allowed transition
    const allowed = flow[current] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        status: "error",
        message: "Tidak bisa ubah dari '" + current + "' ke '" + status + "'. Yang diizinkan: " + allowed.join(", "),
        data: null
      });
    }

    // Valid — update
    db.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId], (errU, result) => {
      if (errU) {
        console.error("Error updating order status:", errU);
        return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
      }

      return res.json({
        status: "success",
        message: "Status order berhasil diperbarui",
        data: { order_id: Number(orderId), status }
      });
    });
  });
};

// ADMIN: DELETE /api/orders/:id
const destroy = (req, res) => {
  const orderId = req.params.id;

  // First, get order items to restore stock
  const getItemsSql = "SELECT product_id, quantity FROM order_items WHERE order_id = ?";
  db.query(getItemsSql, [orderId], (errItems, items) => {
    if (errItems) {
      console.error("Error fetching order items:", errItems);
      return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    if (!items || items.length === 0) {
      // No items, just delete order
      const deleteOrderSql = "DELETE FROM orders WHERE id = ?";
      db.query(deleteOrderSql, [orderId], (errOrder, result) => {
        if (errOrder) {
          console.error("Error deleting order:", errOrder);
          return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ status: "error", message: "Order tidak ditemukan", data: null });
        }
        return res.json({ status: "success", message: "Order berhasil dihapus" });
      });
      return;
    }

    // Restore stock for each item
    let stockRestored = 0;
    for (const item of items) {
      const restoreSql = "UPDATE products SET stock = stock + ? WHERE id = ?";
      db.query(restoreSql, [item.quantity, item.product_id], (errRestore) => {
        if (errRestore) {
          console.error("Error restoring stock:", errRestore);
        }
        stockRestored++;
        if (stockRestored === items.length) {
          // All stock restored, now delete order items and order
          const deleteItemsSql = "DELETE FROM order_items WHERE order_id = ?";
          db.query(deleteItemsSql, [orderId], (errDelItems) => {
            if (errDelItems) {
              console.error("Error deleting order items:", errDelItems);
              return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
            }
            const deleteOrderSql = "DELETE FROM orders WHERE id = ?";
            db.query(deleteOrderSql, [orderId], (errOrder, result) => {
              if (errOrder) {
                console.error("Error deleting order:", errOrder);
                return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
              }
              if (result.affectedRows === 0) {
                return res.status(404).json({ status: "error", message: "Order tidak ditemukan", data: null });
              }
              return res.json({ status: "success", message: "Order berhasil dihapus, stok dikembalikan" });
            });
          });
        }
      });
    }
  });
};

// USER: PUT /api/orders/:id/payment-proof
const uploadPaymentProof = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const orderId = req.params.id;

  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "File bukti pembayaran harus diunggah",
      data: null,
    });
  }

  const paymentProofPath = "/uploads/payment_proofs/" + req.file.filename;

  // Check order belongs to user (or admin)
  const checkSql = userRole === "admin"
    ? "SELECT id FROM orders WHERE id = ?"
    : "SELECT id FROM orders WHERE id = ? AND user_id = ?";
  const checkParams = userRole === "admin" ? [orderId] : [orderId, userId];

  db.query(checkSql, checkParams, (errCheck, checkResults) => {
    if (errCheck) {
      console.error("Error checking order:", errCheck);
      return res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan pada server",
        data: null,
      });
    }

    if (checkResults.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order tidak ditemukan atau bukan milik Anda",
        data: null,
      });
    }

    const updateSql = "UPDATE orders SET payment_proof = ?, status = 'paid' WHERE id = ?";
    db.query(updateSql, [paymentProofPath, orderId], (errUpdate) => {
      if (errUpdate) {
        console.error("Error updating payment proof:", errUpdate);
        return res.status(500).json({
          status: "error",
          message: "Terjadi kesalahan pada server",
          data: null,
        });
      }

      return res.json({
        status: "success",
        message: "Bukti pembayaran berhasil diunggah",
        data: { order_id: Number(orderId), payment_proof: paymentProofPath },
      });
    });
  });
};

module.exports = {
  getAllOrders,
  getMyOrders,
  getMyOrdersNested,
  cancelMyOrder,
  createOrder,
  updateOrderStatus: updateStatus,
  deleteOrder: destroy,
  uploadPaymentProof,
};
