const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET || "hakim_secret";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  // cek token ada atau tidak
  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "Token diperlukan",
    });
  }

  // support Bearer token
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    // token invalid / expired
    if (err) {
      return res.status(401).json({
        success: false,
        message: "Token tidak valid atau expired",
      });
    }

    // simpan data user dari token
    req.user = decoded;

    next();
  });
};

module.exports = verifyToken;