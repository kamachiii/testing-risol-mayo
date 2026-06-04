const express = require("express");
const router = express.Router();

const AuthController = require("../controllers/authController");
const ProductController = require("../controllers/productController");
const UserController = require("../controllers/userController");
const CartController = require("../controllers/cartController");
const OrderController = require("../controllers/orderController");
const verifyToken = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const uploadProduct = require("../middleware/upload");
const uploadPaymentProof = require("../middleware/uploadPaymentProof");
const db = require("../config/database");

// AUTH (public)
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", verifyToken, AuthController.logout);

// PRODUCTS
router.get("/products", ProductController.index);
router.get("/products/:id", ProductController.show);
router.post("/products", verifyToken, requireAdmin, uploadProduct.single("image"), ProductController.store);
router.put("/products/:id", verifyToken, requireAdmin, uploadProduct.single("image"), ProductController.update);
router.delete("/products/:id", verifyToken, requireAdmin, ProductController.destroy);

// CATEGORIES (public read)
router.get("/categories", (req, res) => {
  db.query("SELECT id, name FROM categories ORDER BY id", (err, rows) => {
    if (err) return res.status(500).json({ status: "error", message: "Gagal mengambil kategori", data: null });
    res.json({ status: "success", data: rows });
  });
});

// CATEGORIES (admin CRUD)
router.post("/categories", verifyToken, requireAdmin, (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ status: "error", message: "Nama kategori wajib diisi", data: null });
  }
  const checkSql = "SELECT id FROM categories WHERE name = ?";
  db.query(checkSql, [name.trim()], (err, existing) => {
    if (err) return res.status(500).json({ status: "error", message: "Server error", data: null });
    if (existing.length > 0) {
      return res.status(400).json({ status: "error", message: "Kategori sudah ada", data: null });
    }
    db.query("INSERT INTO categories (name) VALUES (?)", [name.trim()], (err2, result) => {
      if (err2) return res.status(500).json({ status: "error", message: "Gagal membuat kategori", data: null });
      res.json({ status: "success", message: "Kategori berhasil dibuat", data: { id: result.insertId, name: name.trim() } });
    });
  });
});

router.put("/categories/:id", verifyToken, requireAdmin, (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  if (!name || !name.trim()) {
    return res.status(400).json({ status: "error", message: "Nama kategori wajib diisi", data: null });
  }
  db.query("UPDATE categories SET name = ? WHERE id = ?", [name.trim(), id], (err, result) => {
    if (err) return res.status(500).json({ status: "error", message: "Gagal update kategori", data: null });
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "Kategori tidak ditemukan", data: null });
    }
    res.json({ status: "success", message: "Kategori berhasil diupdate" });
  });
});

router.delete("/categories/:id", verifyToken, requireAdmin, (req, res) => {
  const { id } = req.params;
  // Check if category has products
  db.query("SELECT COUNT(*) as cnt FROM products WHERE category_id = ?", [id], (err, rows) => {
    if (err) return res.status(500).json({ status: "error", message: "Server error", data: null });
    if (rows[0].cnt > 0) {
      return res.status(400).json({ status: "error", message: "Kategori masih digunakan oleh produk", data: null });
    }
    db.query("DELETE FROM categories WHERE id = ?", [id], (err2, result) => {
      if (err2) return res.status(500).json({ status: "error", message: "Gagal hapus kategori", data: null });
      if (result.affectedRows === 0) {
        return res.status(404).json({ status: "error", message: "Kategori tidak ditemukan", data: null });
      }
      res.json({ status: "success", message: "Kategori berhasil dihapus" });
    });
  });
});

// USERS
router.get("/users", verifyToken, requireAdmin, UserController.getAllUsers);
router.post("/users", verifyToken, requireAdmin, UserController.createUser);
router.put("/users/:id", verifyToken, requireAdmin, UserController.updateUser);
router.delete("/users/:id", verifyToken, requireAdmin, UserController.deleteUser);

// CART (protected)
router.get("/cart", verifyToken, CartController.getCart);
router.post("/cart/items", verifyToken, CartController.addItem);
router.patch("/cart/items/:id", verifyToken, CartController.updateItem);
router.put("/cart/items/:id", verifyToken, CartController.updateItem);
router.delete("/cart/items/:id", verifyToken, CartController.deleteItem);

// ORDERS (protected)
router.get("/my-orders", verifyToken, OrderController.getMyOrders);
router.get("/my-orders/nested", verifyToken, OrderController.getMyOrdersNested);
router.post("/orders", verifyToken, OrderController.createOrder);
router.post("/orders/:id/payment-proof", verifyToken, uploadPaymentProof.single("payment_proof"), OrderController.uploadPaymentProof);

// ORDERS (admin)
router.get("/orders", verifyToken, requireAdmin, OrderController.getAllOrders);
router.put("/orders/:id/cancel", verifyToken, OrderController.cancelMyOrder);
router.put("/orders/:id/status", verifyToken, requireAdmin, OrderController.updateOrderStatus);
router.delete("/orders/:id", verifyToken, requireAdmin, OrderController.deleteOrder);

module.exports = router;
