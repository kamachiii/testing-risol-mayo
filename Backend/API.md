# Risol Mayo Backend API

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require a JWT token obtained from `/api/login`.

Include the token in the `Authorization` header:

```
Authorization: Bearer <token>
```

---

## Endpoints

### Auth

| Method | Path          | Auth | Description       |
|--------|---------------|------|-------------------|
| POST   | /register     | No   | Register new user |
| POST   | /login        | No   | Login, get token  |
| POST   | /logout       | Yes  | Logout            |

### Products

| Method | Path             | Auth | Description         |
|--------|------------------|------|---------------------|
| GET    | /products        | Yes  | List all products   |
| POST   | /products        | Yes  | Create product      |
| PUT    | /products/:id    | Yes  | Update product      |
| DELETE | /products/:id    | Yes  | Delete product      |

### Users

| Method | Path         | Auth | Description      |
|--------|--------------|------|------------------|
| GET    | /users       | Yes  | List all users   |
| POST   | /users       | Yes  | Create user      |
| PUT    | /users/:id   | Yes  | Update user      |
| DELETE | /users/:id   | Yes  | Delete user      |

### Cart

All cart endpoints require authentication. Each user can only access and modify their own cart items.

| Method | Path                  | Auth | Description                     |
|--------|-----------------------|------|---------------------------------|
| GET    | /cart                 | Yes  | Get current user's cart         |
| POST   | /cart/items           | Yes  | Add item to cart                |
| PATCH  | /cart/items/:id       | Yes  | Update quantity of a cart item  |
| DELETE | /cart/items/:id       | Yes  | Remove item from cart           |

#### GET /cart

Returns all cart items belonging to the authenticated user, with a computed `grand_total`.

**Response:**
```json
{
  "status": "success",
  "message": "Created Data successfully",
  "data": {
    "items": [
      {
        "cart_item_id": 1,
        "product_id": 3,
        "product_name": "Risol Mayo Keju",
        "unit_price": 5000,
        "quantity": 2,
        "subtotal": 10000
      }
    ],
    "grand_total": 10000
  }
}
```

#### POST /cart/items

Add a product to the cart. If the product already exists in the cart (requires unique key on `(user_id, product_id)`), the quantity is incremented instead of inserting a duplicate row.

**Request body:**
```json
{
  "product_id": 3,
  "quantity": 2
}
```

- `product_id` — required
- `quantity` — required, must be a positive integer

**Response:** `201 Created`
```json
{ "status": "success", "message": "Produk berhasil ditambahkan" }
```

#### PATCH /cart/items/:id

Update the quantity of a specific cart item. Only the owner of the item can update it.

**Request body:**
```json
{ "quantity": 5 }
```

- `quantity` — required, must be a positive integer

**Response:** `200 OK`
```json
{ "status": "success", "message": "Jumlah berhasil diperbarui" }
```

Returns `404` if the item does not exist or does not belong to the authenticated user.

#### DELETE /cart/items/:id

Remove an item from the cart. Only the owner of the item can delete it.

**Response:** `200 OK`
```json
{ "status": "success", "message": "Item dihapus dari keranjang" }
```

Returns `404` if the item does not exist or does not belong to the authenticated user.

---

## Database Schema

### `cart_items` table

```sql
CREATE TABLE cart_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  product_id INT NOT NULL,
  quantity   INT NOT NULL DEFAULT 1,
  UNIQUE KEY uq_user_product (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

> **Important:** The `UNIQUE KEY (user_id, product_id)` is required for the
> `POST /cart/items` endpoint to correctly increment quantity on duplicate
> additions instead of inserting a new row. Without it, adding the same product
> twice will create two separate rows.
