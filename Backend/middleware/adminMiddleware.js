module.exports = function requireAdmin(req, res, next) {
  // token harus ngisi role. Kalau belum, cek bagian catatan di bawah.
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ status: "error", message: "Akses admin diperlukan", data: null });
  }
  next();
};
