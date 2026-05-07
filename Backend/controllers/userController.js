const db = require("../config/database");

// GET all users
const getAllUsers = (req, res) => {
  db.query("SELECT id, name, email FROM users", (err, results) => {
    if (err) {
      console.error("DB error on getAllUsers:", err);

      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }

    res.json({
      success: true,
      message: "Berhasil mengambil data users",
      total: results.length,
      data: results,
    });
  });
};

// POST create user
const createUser = (req, res) => {
  const { name, email, password } = req.body;

  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, password], (err, result) => {
    if (err) {
      console.error("DB error on createUser:", err);

      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }

    res.status(201).json({
      success: true,
      message: "User berhasil ditambahkan",
      user: {
        id: result.insertId,
        name: name,
        email: email,
      },
    });
  });
};

// PUT update user
const updateUser = (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;

  const sql = "UPDATE users SET name=?, email=? WHERE id=?";

  db.query(sql, [name, email, id], (err, result) => {
    if (err) {
      console.error("DB error on updateUser:", err);

      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    res.json({
      success: true,
      message: "User berhasil diupdate",
      user: {
        id: id,
        name: name,
        email: email,
      },
    });
  });
};

// DELETE user
const deleteUser = (req, res) => {
  const { id } = req.params;

  // ambil data user dulu
  const getUserSql = "SELECT id, name, email FROM users WHERE id=?";

  db.query(getUserSql, [id], (err, userResult) => {
    if (err) {
      console.error("DB error on get user:", err);

      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }

    if (userResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = userResult[0];

    // hapus user
    const deleteSql = "DELETE FROM users WHERE id=?";

    db.query(deleteSql, [id], (err, result) => {
      if (err) {
        console.error("DB error on deleteUser:", err);

        return res.status(500).json({
          success: false,
          message: "Terjadi kesalahan pada server",
        });
      }

      res.json({
        success: true,
        message: "User berhasil dihapus",
        deletedUser: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });
  });
};

module.exports = { getAllUsers, createUser, updateUser, deleteUser };