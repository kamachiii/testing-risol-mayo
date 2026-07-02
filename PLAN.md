# Belanja.in Bug Fix Plan — Full Audit

## Status: Phase 1 DONE, Phase 2-4 PENDING

---

## Phase 1: Critical (DONE ✅)
1. ✅ database.js createConnection → createPool
2. ✅ orderController model method names (getMine/getMineNested)
3. ✅ address ↔ shipping_address field compat
4. ✅ uploadPaymentProof path /uploads/payment → /uploads/payment_proofs
5. ✅ cart.subtotal computed added
6. ✅ Login/Register silent redirect → check result.success
7. ✅ Admin route requiresAdmin guard
8. ✅ destroy() stock restoration
9. ✅ Duplicate order (user 9) cancelled
10. ✅ Navbar logout button styling
11. ✅ OrderHistoryPage: upload payment proof UI
12. ✅ OrderHistoryPage: duplicate statusLabel + extra brace

---

## Phase 2: Functional Fixes (PENDING)

### 2.1 Backend — Auth
- [ ] JWT_SECRET hardcoded: authController="risol_secret", authMiddleware="hakim_secret" → unify to process.env.JWT_SECRET
- [ ] No email format validation in register
- [ ] No password strength validation in register

### 2.2 Backend — Checkout/Orders
- [ ] Checkout: add item-level stock check (currently bulk check misses race condition)
- [ ] Checkout: verify total_amount server-side (prevent price tampering)
- [ ] Checkout: cart fallback query missing userId → `WHERE user_id = ?`
- [ ] Checkout: prevent double-submit (idempotency)
- [ ] Orders: ENUM status doesn't match frontend labels → migration needed
- [ ] Orders: destroy() should use transaction for atomicity
- [ ] Orders: uploadPaymentProof only checks `req.file` not null → check file too
- [ ] Orders: orderId from params not parsed as integer

### 2.3 Backend — Cart
- [ ] addItem: ON DUPLICATE KEY doesn't check stock on increment
- [ ] updateItem: no stock validation
- [ ] Error responses inconsistent (missing status:"error" wrapper)

### 2.4 Backend — Products
- [ ] store/update: no input validation (name, price, stock required)
- [ ] search: LIKE `%%query%%` — double % redundant
- [ ] show: ID not parsed as integer
- [ ] Empty stock=0 products not filtered in getAll

### 2.5 Backend — Middleware
- [ ] upload.js: empty file filter (no type/size validation for products)

### 2.6 Frontend
- [ ] Hardcoded localhost:3000 for images → use env var
- [ ] CheckoutPage: send structured payment fields (delivery_type, phone, payment_method, bank_name)
- [ ] CheckoutPage: validate empty cart before submit
- [ ] cart.js: clearCart sequential deletes → Promise.all

---

## Phase 3: Data Integrity (PENDING)
- [ ] Migration: ALTER ENUM status to include correct values
- [ ] Unique constraint on order_items(order_id, product_id)

---

## Phase 4: Polish (PENDING)
- [ ] Response format consistency across all controllers
- [ ] CORS configuration for production
- [ ] Admin user management (create/edit/delete users)
- [ ] Empty stock warning in product listing
