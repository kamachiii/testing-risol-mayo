const OrderModel = require("../models/orderModel");
const db = require("../config/database");

// ADMIN: GET /api/orders
const getAllOrders = (req, res) => {
  OrderModel.getAll((err, results) => {
    if (err) {
      console.error("DB error on getAllOrders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    return res.json({
      status: "success",
      message: "Fetched All Orders Successfully",
      data: results,
    });
  });
};

// USER: GET /api/my-orders (flatten versi lama)
const getMyOrders = (req, res) => {
  const userId = req.user.id;

  OrderModel.getMine(userId, (err, results) => {
    if (err) {
      console.error("DB error on getMyOrders:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    return res.json({
      status: "success",
      message: "Fetched Orders Successfully",
      data: results,
    });
  });
};

// USER: GET /api/my-orders/nested (rapi, grouped)
const getMyOrdersNested = (req, res) => {
  const userId = req.user.id;

  OrderModel.getMineNested(userId, (err, rows) => {
    if (err) {
      console.error("DB error on getMyOrdersNested:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    const map = new Map();

    for (const r of rows) {
      if (!map.has(r.order_id)) {
        map.set(r.order_id, {
          id: r.order_id,
          status: r.status,
          total_amount: Number(r.total_amount),
          shipping_address: r.shipping_address,
          created_at: r.created_at,
          items: [],
        });
      }

      if (r.order_item_id) {
        map.get(r.order_id).items.push({
          id: r.order_item_id,
          product_id: r.product_id,
          product_name: r.product_name,
          quantity: r.quantity,
          price_at_purchase: Number(r.price_at_purchase),
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

// USER: POST /api/orders
const createOrder = (req, res) => {
  const userId = req.user.id;
  const { items, shipping_address } = req.body || {};

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ status: "error", message: "Order tidak boleh kosong", data: null });
  }

  if (!shipping_address || String(shipping_address).trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "Alamat pengiriman wajib diisi",
      data: null,
    });
  }

  // Validasi & normalisasi items
  const normalized = [];
  for (const it of items) {
    const product_id = parseInt(it.product_id, 10);
    const quantity = parseInt(it.quantity, 10);

    if (!Number.isInteger(product_id) || product_id <= 0) {
      return res
        .status(400)
        .json({ status: "error", message: "product_id tidak valid", data: null });
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ status: "error", message: "quantity tidak valid", data: null });
    }

    normalized.push({ product_id, quantity });
  }

  // Merge kalau product_id sama
  const mergedMap = new Map();
  for (const it of normalized) {
    mergedMap.set(it.product_id, (mergedMap.get(it.product_id) || 0) + it.quantity);
  }
  const mergedItems = Array.from(mergedMap.entries()).map(([product_id, quantity]) => ({
    product_id,
    quantity,
  }));

  const productIds = mergedItems.map((x) => x.product_id);

  const rollback = (httpStatus, message, data = null, logErr = null) => {
    if (logErr) console.error(logErr);
    db.rollback(() => {
      return res.status(httpStatus).json({ status: "error", message, data });
    });
  };

  db.beginTransaction((errTx) => {
    if (errTx) {
      console.error("DB error on beginTransaction:", errTx);
      return res
        .status(500)
        .json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    // 1) lock products
    OrderModel.getProductsForUpdate(db, productIds, (errP, products) => {
      if (errP) return rollback(500, "Terjadi kesalahan pada server", null, errP);

      const productMap = new Map(products.map((p) => [Number(p.id), p]));

      // 2) validasi semua produk ada
      const missing = productIds.filter((id) => !productMap.has(Number(id)));
      if (missing.length > 0) {
        return rollback(400, `Produk tidak ditemukan: ${missing.join(", ")}`);
      }

      // 3) validasi stok cukup
      for (const it of mergedItems) {
        const p = productMap.get(it.product_id);
        if (Number(p.stock) < Number(it.quantity)) {
          return rollback(
            400,
            `Stok tidak cukup untuk produk ${p.name} (id=${p.id}). Stok: ${p.stock}, minta: ${it.quantity}`
          );
        }
      }

      // 4) computedItems (price dari DB)
      const computedItems = mergedItems.map((it) => {
        const p = productMap.get(it.product_id);
        return {
          product_id: it.product_id,
          quantity: it.quantity,
          price_at_purchase: Number(p.price),
        };
      });

      const totalAmount = computedItems.reduce(
        (sum, it) => sum + it.price_at_purchase * it.quantity,
        0
      );

      // 5) insert order header
      OrderModel.createOrder(db, userId, totalAmount, shipping_address, (errO, resultO) => {
        if (errO) return rollback(500, "Terjadi kesalahan pada server", null, errO);

        const orderId = resultO.insertId;

        // 6) insert items
        OrderModel.insertOrderItems(db, orderId, computedItems, (errI) => {
          if (errI) return rollback(500, "Terjadi kesalahan pada server", null, errI);

          // 7) decrement stock
          OrderModel.decrementStocks(db, mergedItems, (errS) => {
            if (errS) return rollback(500, "Terjadi kesalahan pada server", null, errS);

            // 8) commit
            db.commit((errC) => {
              if (errC) return rollback(500, "Terjadi kesalahan pada server", null, errC);

              return res.status(201).json({
                status: "success",
                message: "Created Order Successfully",
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
};

const uploadPaymentProof = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role; // admin/customer
  const orderId = req.params.id;

  // multer akan taruh file di req.file
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "File payment_proof wajib diupload",
      data: null,
    });
  }

  OrderModel.getById(orderId, (err, results) => {
    if (err) {
      console.error("DB error on getById:", err);
      return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    if (results.length === 0) {
      return res.status(404).json({ status: "error", message: "Order tidak ditemukan", data: null });
    }

    const order = results[0];

    // authorization: customer hanya boleh upload untuk order sendiri
    if (userRole !== "admin" && Number(order.user_id) !== Number(userId)) {
      return res.status(403).json({ status: "error", message: "Tidak boleh upload bukti bayar untuk order ini", data: null });
    }

    const filePath = `/uploads/payment_proofs/${req.file.filename}`;

    OrderModel.updatePaymentProof(orderId, filePath, (err2) => {
      if (err2) {
        console.error("DB error on updatePaymentProof:", err2);
        return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
      }

      return res.json({
        status: "success",
        message: "Uploaded Payment Proof Successfully",
        data: {
          order_id: Number(orderId),
          payment_proof: filePath,
          payment_proof_url: `http://localhost:3000${filePath}`,
        },
      });
    });
  });
};

// ADMIN: PUT /api/orders/:id/status
const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatus = ["pending", "paid", "shipped"];
  if (!validStatus.includes(status)) {
    return res
      .status(400)
      .json({ status: "error", message: "Status tidak valid", data: null });
  }

  OrderModel.updateStatus(id, status, (err, result) => {
    if (err) {
      console.error("DB error on updateOrderStatus:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Order tidak ditemukan", data: null });
    }

    return res.json({
      status: "success",
      message: "Updated Order Status Successfully",
      data: { order_id: Number(id), status },
    });
  });
};

// ADMIN: DELETE /api/orders/:id
const deleteOrder = (req, res) => {
  const { id } = req.params;

  OrderModel.delete(id, (err, result) => {
    if (err) {
      console.error("DB error on deleteOrder:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Order tidak ditemukan", data: null });
    }

    return res.json({
      status: "success",
      message: "Deleted Order Successfully",
      data: { order_id: Number(id) },
    });
  });
};

module.exports = {
  getAllOrders,
  getMyOrders,
  getMyOrdersNested,
  createOrder,
  uploadPaymentProof,
  updateOrderStatus,
  deleteOrder,
};
