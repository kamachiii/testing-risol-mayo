const db = require("../config/database");

// 1. GET: Melihat isi keranjang
const getCart = (req, res) => {
  const userId = req.user.id; // Diambil dari token JWT

  const sql = `
    SELECT 
      c.id AS cart_item_id,
      p.id AS product_id,
      p.name AS product_name,
      p.price AS unit_price,
      p.image_url,
      p.stock,
      c.quantity,
      (p.price * c.quantity) AS subtotal
    FROM 
      cart_items c
    JOIN 
      products p ON c.product_id = p.id
    WHERE 
      c.user_id = ?
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("DB error on getCart:", err);
      return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }

    const grandTotal = parseFloat(
      results
        .reduce((acc, item) => acc + parseFloat(item.subtotal), 0)
        .toFixed(2)
    );

    res.json({
      status: "success",
      data: {
        items: results,
        grand_total: grandTotal,
      },
    });
  });
};

// 2. POST: Tambah produk ke keranjang
const addItem = (req, res) => {
  const userId = req.user.id;
  const { product_id, quantity } = req.body;

  // Input validation
  const pid = parseInt(product_id, 10);
  if (!product_id || isNaN(pid) || pid <= 0) {
    return res.status(400).json({ status: "error", message: "product_id harus berupa angka positif", data: null });
  }
  if (quantity === undefined || quantity === null) {
      return res.status(400).json({ status: "error", message: "quantity diperlukan", data: null });
  }
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    return res
          .status(400)
          .json({ status: "error", message: "quantity harus berupa angka positif", data: null });
  }

  // Check product exists
  const checkProduct = "SELECT id, stock FROM products WHERE id = ?";
  db.query(checkProduct, [pid], (err, prodResults) => {
    if (err) {
      console.error("DB error checking product:", err);
      return res.status(500).json({ status: "error", message: "Gagal menambahkan ke keranjang", data: null });
    }
    if (prodResults.length === 0) {
      return res.status(404).json({ status: "error", message: "Produk tidak ditemukan", data: null });
    }
    // Check existing quantity in cart
    const existingSql = "SELECT COALESCE(quantity, 0) AS existing_qty FROM cart_items WHERE user_id = ? AND product_id = ?";
    db.query(existingSql, [userId, pid], (err2, existingRows) => {
      if (err2) {
        console.error("DB error checking existing cart:", err2);
        return res.status(500).json({ status: "error", message: "Gagal menambahkan ke keranjang", data: null });
      }
      const existingQty = existingRows.length > 0 ? existingRows[0].existing_qty : 0;
      const totalQty = existingQty + qty;
      if (totalQty > prodResults[0].stock) {
        return res.status(400).json({ status: "error", message: "Stok tidak cukup (stok: " + prodResults[0].stock + ", di keranjang: " + existingQty + ", diminta: " + qty + ")", data: null });
      }

      const sql = "INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?";
      db.query(sql, [userId, pid, qty, qty], (err, result) => {
        if (err) {
          console.error("DB error on addItem:", err);
          return res.status(500).json({ status: "error", message: "Gagal menambahkan ke keranjang", data: null });
        }
        res.status(201).json({ status: "success", message: "Produk berhasil ditambahkan", data: null });
      });
    });
  });
};

// 3. PATCH: Update quantity item tertentu (hanya milik user sendiri)
const updateItem = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // ID dari cart_item
  const { quantity } = req.body;

  // Input validation
  if (quantity === undefined || quantity === null) {
      return res.status(400).json({ status: "error", message: "quantity diperlukan", data: null });
  }
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    return res
          .status(400)
          .json({ status: "error", message: "quantity harus berupa angka positif", data: null });
  }

  // Check stock before update
  const checkSql = "SELECT ci.id, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.user_id = ?";
  db.query(checkSql, [id, userId], (errC, rows) => {
    if (errC) {
      return res.status(500).json({ status: "error", message: "Gagal memperbarui jumlah", data: null });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ status: "error", message: "Item keranjang tidak ditemukan", data: null });
    }
    if (qty > rows[0].stock) {
      return res.status(400).json({ status: "error", message: "Stok tidak cukup (stok: " + rows[0].stock + ")", data: null });
    }
    const sql = "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?";
    db.query(sql, [qty, id, userId], (err, result) => {
      if (err) {
        console.error("DB error on updateItem:", err);
        return res.status(500).json({ status: "error", message: "Gagal memperbarui jumlah", data: null });
      }
      res.json({ status: "success", message: "Jumlah berhasil diperbarui", data: null });
    });
  });
};

// 4. DELETE: Hapus item dari keranjang (hanya milik user sendiri)
const deleteItem = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const sql = "DELETE FROM cart_items WHERE id = ? AND user_id = ?";
  db.query(sql, [id, userId], (err, result) => {
    if (err) {
      console.error("DB error on deleteItem:", err);
      return res.status(500).json({ status: "error", message: "Gagal menghapus item", data: null });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "Item tidak ditemukan atau tidak diizinkan", data: null });
    }
    res.json({ status: "success", message: "Item dihapus dari keranjang", data: null });
  });
};

module.exports = { getCart, addItem, updateItem, deleteItem };
