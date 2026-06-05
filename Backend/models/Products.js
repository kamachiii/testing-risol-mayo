const db = require("../config/database");

class Products {
    static getAll({ search = '', page = 1, limit = 50, sort = 'newest', category_id } = {}, callback) {
            let sql = `
                SELECT p.*, c.name as category_name
                FROM products p
                LEFT JOIN categories c ON p.category_id = c.id
            `;
            const params = [];
            const conditions = [];
            if (search) {
                conditions.push(`(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`);
                const q = `%${search}%`;
                params.push(q, q, q);
            }
            if (category_id) {
                conditions.push(`p.category_id = ?`);
                params.push(Number(category_id));
            }
            if (conditions.length > 0) {
                sql += ` WHERE ${conditions.join(' AND ')}`;
            }
        // Sort
    const sortMap = {
      newest: 'p.id DESC',
      'price_asc': 'p.price ASC',
      'price_desc': 'p.price DESC',
      name_asc: 'p.name ASC',
      name_desc: 'p.name DESC',
    };
    sql += ` ORDER BY ${sortMap[sort] || 'p.id DESC'}`;
        if (limit) {
            const offset = (Math.max(1, page) - 1) * limit;
            sql += ` LIMIT ? OFFSET ?`;
            params.push(Number(limit), Number(offset));
        }
        db.query(sql, params, callback);
    }

    static countAll({ search = '', category_id } = {}, callback) {
            let sql = `SELECT COUNT(*) as total FROM products p LEFT JOIN categories c ON p.category_id = c.id`;
            const params = [];
            const conditions = [];
            if (search) {
                conditions.push(`(p.name LIKE ? OR p.description LIKE ? OR c.name LIKE ?)`);
                const q = `%${search}%`;
                params.push(q, q, q);
            }
            if (category_id) {
                conditions.push(`p.category_id = ?`);
                params.push(Number(category_id));
            }
            if (conditions.length > 0) {
                sql += ` WHERE ${conditions.join(' AND ')}`;
            }
        db.query(sql, params, callback);
    }

    static getById(id, callback) {
        const sql = `
            SELECT p.*, c.name as category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        `;
        db.query(sql, [id], callback);
    }

    static create(data, callback) {
        const sql = `
        INSERT INTO products (category_id, name, price, description, stock, image_url)
        VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.query(sql, [
            data.category_id,
            data.name,
            data.price,
            data.description,
            data.stock,
            data.image_url
        ], callback);
    }

    static update(id, data, callback) {
        if (data.image_url !== undefined && data.image_url !== null) {
            const sql = `UPDATE products SET category_id=?, name=?, price=?, description=?, stock=?, image_url=? WHERE id=?`;
            db.query(sql, [
                data.category_id,
                data.name,
                data.price,
                data.description,
                data.stock,
                data.image_url,
                id
            ], callback);
        } else {
            const sql = `UPDATE products SET category_id=?, name=?, price=?, description=?, stock=? WHERE id=?`;
            db.query(sql, [
                data.category_id,
                data.name,
                data.price,
                data.description,
                data.stock,
                id
            ], callback);
        }
    }

    static delete(id, callback) {
        const sql = `DELETE FROM products WHERE id=?`;
        db.query(sql, [id], callback);
    }
}

module.exports = Products;
