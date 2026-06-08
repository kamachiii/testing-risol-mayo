const db = require("../config/database");
const bcrypt = require("bcryptjs");

// GET all users
const getAllUsers = (req, res) => {
  const sql = "SELECT id, name, email, role, created_at FROM users ORDER BY id DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB error on getAllUsers:", err);
      return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }
    res.json({ status: "success", message: "Berhasil mengambil data user", data: results });
  });
};

// CREATE user
const createUser = (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ status: "error", message: "Nama, email, dan password wajib diisi", data: null });
  }

  const checkSql = "SELECT id FROM users WHERE email = ?";
  db.query(checkSql, [email], async (err, existing) => {
    if (err) {
      console.error("DB error on check email:", err);
      return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }
    if (existing.length > 0) {
      return res.status(400).json({ status: "error", message: "Email sudah terdaftar", data: null });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const insertSql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
      db.query(insertSql, [name, email, hashedPassword, role || "customer"], (err2, result) => {
        if (err2) {
          console.error("DB error on createUser:", err2);
          return res.status(500).json({ status: "error", message: "Gagal membuat user", data: null });
        }
        res.status(201).json({
          status: "success",
          message: "User berhasil dibuat",
          data: { id: result.insertId, name, email, role: role || "customer" },
        });
      });
    } catch (e) {
      return res.status(500).json({ status: "error", message: "Gagal hash password", data: null });
    }
  });
};

// UPDATE user
const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const getUserSql = "SELECT id FROM users WHERE id=?";
  db.query(getUserSql, [id], (err, userResult) => {
    if (err) {
      console.error("DB error on get user:", err);
      return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ status: "error", message: "User tidak ditemukan", data: null });
    }

    const updateSql = "UPDATE users SET name=?, email=?, role=? WHERE id=?";
    db.query(updateSql, [name, email, role || "customer", id], (err2) => {
      if (err2) {
        console.error("DB error on updateUser:", err2);
        return res.status(500).json({ status: "error", message: "Gagal update user", data: null });
      }
      res.json({ status: "success", message: "User berhasil diupdate", data: null });
    });
  });
};

// DELETE user
const deleteUser = (req, res) => {
  const { id } = req.params;

  // Prevent self-deletion
  if (Number(id) === req.user.id) {
    return res.status(400).json({
      status: "error",
      message: "Tidak bisa menghapus akun sendiri",
      data: null,
    });
  }

  const getUserSql = "SELECT id, name, email, role FROM users WHERE id=?";
  db.query(getUserSql, [id], (err, userResult) => {
    if (err) {
      console.error("DB error on get user:", err);
      return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
    }
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ status: "error", message: "User tidak ditemukan", data: null });
    }

    const proceedDelete = () => {
      const deleteSql = "DELETE FROM users WHERE id=?";
      db.query(deleteSql, [id], (err2) => {
        if (err2) {
          console.error("DB error on deleteUser:", err2);
          return res.status(500).json({ status: "error", message: "Gagal menghapus user", data: null });
        }
        res.json({ status: "success", message: "User berhasil dihapus", data: null });
      });
    };

    // If target is admin, check not last admin
    if (userResult[0].role === "admin") {
      const countSql = "SELECT COUNT(*) as cnt FROM users WHERE role='admin'";
      db.query(countSql, (err2, countResult) => {
        if (!err2 && countResult[0].cnt <= 1) {
          return res.status(400).json({ status: "error", message: "Tidak bisa menghapus admin terakhir", data: null });
        }
        proceedDelete();
      });
    } else {
      proceedDelete();
    }
  });
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };
