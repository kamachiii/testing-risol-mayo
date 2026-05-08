const db = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "hakim_secret";

// LOGIN
const login = (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email=?";
  
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("DB error on login:", err);
      return res.status(500).json({
        success: false,
        message: "Terjadi kesalahan pada server",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const user = results[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Password salah",
      });
    }

    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({
      success: true,
      message: "Login berhasil",
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  });
};

// REGISTER
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

    db.query(sql, [name, email, hashedPassword], (err, result) => {
      if (err) {
        console.error("DB error on register:", err);

        return res.status(500).json({
          success: false,
          message: "Terjadi kesalahan pada server",
        });
      }

      res.status(201).json({
        success: true,
        message: "Register berhasil",
        user: {
          id: result.insertId,
          name: name,
          email: email,
        },
      });
    });

  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};

// LOGOUT
const logout = (req, res) => {
  res.json({
    success: true,
    message: "Logout berhasil",
  });
};

module.exports = { login, register, logout };