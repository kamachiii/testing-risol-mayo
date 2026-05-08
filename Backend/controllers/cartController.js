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
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
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
    return res.status(400).json({ message: "product_id harus berupa angka positif" });
  }
  if (quantity === undefined || quantity === null) {
    return res.status(400).json({ message: "quantity diperlukan" });
  }
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    return res
      .status(400)
      .json({ message: "quantity harus berupa angka positif" });
  }

  // If a UNIQUE key on (user_id, product_id) exists, ON DUPLICATE KEY UPDATE
  // will increment quantity. Without the unique key the row is simply inserted.
  // Note: VALUES() is deprecated in MySQL 8.0.20+; pass the qty again as a parameter.
  const sql = `
    INSERT INTO cart_items (user_id, product_id, quantity) 
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE quantity = quantity + ?
  `;

  db.query(sql, [userId, pid, qty, qty], (err, result) => {
    if (err) {
      console.error("DB error on addItem:", err);
      return res
        .status(500)
        .json({ message: "Gagal menambahkan ke keranjang" });
    }
    res
      .status(201)
      .json({ status: "success", message: "Produk berhasil ditambahkan" });
  });
};

// 3. PATCH: Update quantity item tertentu (hanya milik user sendiri)
const updateItem = (req, res) => {
  const userId = req.user.id;
  const { id } = req.params; // ID dari cart_item
  const { quantity } = req.body;

  // Input validation
  if (quantity === undefined || quantity === null) {
    return res.status(400).json({ message: "quantity diperlukan" });
  }
  const qty = parseInt(quantity, 10);
  if (isNaN(qty) || qty <= 0) {
    return res
      .status(400)
      .json({ message: "quantity harus berupa angka positif" });
  }

  const sql = "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?";
  db.query(sql, [qty, id, userId], (err, result) => {
    if (err) {
      console.error("DB error on updateItem:", err);
      return res.status(500).json({ message: "Gagal memperbarui jumlah" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item keranjang tidak ditemukan" });
    }
    res.json({ status: "success", message: "Jumlah berhasil diperbarui" });
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
      return res.status(500).json({ message: "Gagal menghapus item" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item keranjang tidak ditemukan" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan atau tidak diizinkan" });
    }
    res.json({ status: "success", message: "Item dihapus dari keranjang" });
  });
};

module.exports = { getCart, addItem, updateItem, deleteItem };
