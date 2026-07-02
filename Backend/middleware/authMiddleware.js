const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY) { console.error("FATAL: JWT_SECRET not set in env"); process.exit(1); }

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      status: "error",
      message: "Token diperlukan",
      data: null,
    });
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  jwt.verify(token, SECRET_KEY, { algorithms: ["HS256"] }, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        status: "error",
        message: "Token tidak valid atau expired",
        data: null,
      });
    }

    req.user = decoded;
    next();
  });
};

module.exports = verifyToken;
