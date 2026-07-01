const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) { console.error("FATAL: JWT_SECRET not set in .env"); process.exit(1); }

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=?";

  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("DB error on login:", err);
      return res.status(500).json({
        status: "error",
        message: "Terjadi kesalahan pada server",
        data: null,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Email atau password salah",
        data: null,
      });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        status: "error",
        message: "Email atau password salah",
        data: null,
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      status: "success",
      message: "Login berhasil",
      data: {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      },
    });
  });
};

// REGISTER
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      status: "error",
      message: "Nama, email, dan password wajib diisi",
      data: null,
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      status: "error",
      message: "Password minimal 6 karakter",
      data: null,
    });
  }

  try {
    // Check duplicate email
    const checkSql = "SELECT id FROM users WHERE email = ?";
    const existing = await new Promise((resolve, reject) => {
      db.query(checkSql, [email], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });

    if (existing.length > 0) {
      return res.status(409).json({
        status: "error",
        message: "Email sudah terdaftar",
        data: null,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("DB error on register:", err);
        return res.status(500).json({
          status: "error",
          message: "Terjadi kesalahan pada server",
          data: null,
        });
      }

      res.status(201).json({
        status: "success",
        message: "Register berhasil",
        data: {
          user: { id: result.insertId, name, email },
        },
      });
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan pada server",
      data: null,
    });
  }
};

// LOGOUT
const logout = (req, res) => {
  res.json({
    status: "success",
    message: "Logout berhasil",
    data: null,
  });
};

module.exports = { login, register, logout };
