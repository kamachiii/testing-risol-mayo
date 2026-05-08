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

// AUTH (public)
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", verifyToken, AuthController.logout);

// PRODUCTS (protected)
router.get("/products", verifyToken, ProductController.index);
router.get("/products/:id", verifyToken, ProductController.show);
router.post("/products", verifyToken, uploadProduct.single("image"), ProductController.store);
router.put("/products/:id", verifyToken, uploadProduct.single("image"), ProductController.update);
router.delete("/products/:id", verifyToken, ProductController.destroy);

// USERS (protected)
router.get("/users", verifyToken, UserController.getAllUsers);
router.post("/users", verifyToken, UserController.createUser);
router.put("/users/:id", verifyToken, UserController.updateUser);
router.delete("/users/:id", verifyToken, UserController.deleteUser);

// CART (protected)
router.get("/cart", verifyToken, CartController.getCart);
router.post("/cart/items", verifyToken, CartController.addItem);
router.patch("/cart/items/:id", verifyToken, CartController.updateItem);
router.delete("/cart/items/:id", verifyToken, CartController.deleteItem);

// ORDERS (protected)
router.get("/my-orders", verifyToken, OrderController.getMyOrders);
router.get("/my-orders/nested", verifyToken, OrderController.getMyOrdersNested);
router.post("/orders", verifyToken, OrderController.createOrder);
router.post("/orders/:id/payment-proof", verifyToken, uploadPaymentProof.single("payment_proof"), OrderController.uploadPaymentProof);

// ORDERS (admin)
router.get("/orders", verifyToken, requireAdmin, OrderController.getAllOrders);
router.put("/orders/:id/status", verifyToken, requireAdmin, OrderController.updateOrderStatus);
router.delete("/orders/:id", verifyToken, requireAdmin, OrderController.deleteOrder);

module.exports = router;
