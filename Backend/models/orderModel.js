const db = require("../config/database");

const OrderModel = {
  // ADMIN: GET all orders
  getAll(cb) {
    const sql = `
      SELECT o.id, o.status, o.total_amount, o.shipping_address,
             o.payment_proof, o.created_at,
             u.name AS user_name, u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
    `;
    db.query(sql, cb);
  },

  // USER: GET my orders (flatten)
  getMine(userId, cb) {
    const sql = `
      SELECT o.id, o.status, o.total_amount, o.shipping_address, o.created_at,
             oi.quantity, oi.price_at_purchase,
             p.name AS product_name
      FROM orders o
      JOIN order_items oi ON o.id = oi.order_id
      JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `;
    db.query(sql, [userId], cb);
  },

  // USER: GET my orders (nested-ready rows)
  getMineNested(userId, cb) {
    const sql = `
      SELECT
        o.id AS order_id,
        o.status,
        o.total_amount,
        o.shipping_address,
        o.created_at,

        oi.id AS order_item_id,
        oi.product_id,
        oi.quantity,
        oi.price_at_purchase,

        p.name AS product_name
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC, oi.id ASC
    `;
    db.query(sql, [userId], cb);
  },

  getById(orderId, cb) {
    const sql = "SELECT * FROM orders WHERE id = ?";
    db.query(sql, [orderId], cb);
  },

getProductsForUpdate(conn, productIds, cb) {
    if (!productIds || productIds.length === 0) return cb(null, []);
    const sql = `
      SELECT id, name, price, stock
      FROM products
      WHERE id IN (?)
      FOR UPDATE
    `;
    conn.query(sql, [productIds], cb);
  },

  createOrder(conn, userId, totalAmount, shippingAddress, cb) {
    const sql =
      "INSERT INTO orders (user_id, total_amount, shipping_address) VALUES (?, ?, ?)";
    conn.query(sql, [userId, totalAmount, shippingAddress], cb);
  },

  insertOrderItems(conn, orderId, items, cb) {
    const sql =
      "INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES ?";
    const values = items.map((it) => [
      orderId,
      it.product_id,
      it.quantity,
      it.price_at_purchase,
    ]);
    conn.query(sql, [values], cb);
  },

  decrementStocks(conn, items, cb) {
    let i = 0;
    const next = () => {
      if (i >= items.length) return cb(null);

      const it = items[i++];
      const sql = "UPDATE products SET stock = stock - ? WHERE id = ?";
      conn.query(sql, [it.quantity, it.product_id], (err) => {
        if (err) return cb(err);
        next();
      });
    };
    next();
  },

  // ADMIN: PUT update status
  updateStatus(orderId, status, cb) {
    const sql = "UPDATE orders SET status = ? WHERE id = ?";
    db.query(sql, [status, orderId], cb);
  },

  updatePaymentProof(orderId, paymentProofPath, cb) {
    const sql = "UPDATE orders SET payment_proof = ? WHERE id = ?";
    db.query(sql, [paymentProofPath, orderId], cb);
  },

  // ADMIN: DELETE order
  delete(orderId, cb) {
    const sql = "DELETE FROM orders WHERE id = ?";
    db.query(sql, [orderId], cb);
  },
};

module.exports = OrderModel;
