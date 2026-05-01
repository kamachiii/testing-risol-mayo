const Product = require("../models/Products");
const validateFile = require("../utils/validator");

class ProductController {

  // GET ALL
  index(req, res) {
    Product.getAll((err, results) => {
      if (err) {
        console.error("DB error on getAll:", err);
        return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
      }
      res.json({ status: "success", message: "Berhasil ambil data", data: results });
    });
  }

  // GET BY ID
  show(req, res) {
    const { id } = req.params;
    Product.getById(id, (err, results) => {
      if (err) {
        console.error("DB error on getById:", err);
        return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server", data: null });
      }
      if (!results || results.length === 0) {
        return res.status(404).json({ status: "error", message: "Produk tidak ditemukan", data: null });
      }
      res.json({ status: "success", message: "Detail Produk", data: results[0] });
    });
  }

  // CREATE
  store(req, res) {
    const data = req.body;

    const fileError = validateFile(req.file);
    if (fileError) {
      return res.status(400).json({ status: "error", message: fileError, data: null });
    }
    data.image_url = req.file ? `/uploads/products/${req.file.filename}` : null;

    Product.create(data, (err) => {
      if (err) {
        console.error("DB error on create:", err);
        return res.status(500).json({ status: "error", message: "Data gagal ditambahkan", data: null });
      }
      res.json({ status: "success", message: "Data berhasil ditambah", data: data });
    });
  }

  // UPDATE
  update(req, res) {
    const { id } = req.params;
    const data = req.body;

    if (req.file) {
      const fileError = validateFile(req.file);
      if (fileError) {
        return res.status(400).json({ status: "error", message: fileError, data: null });
      }
      data.image_url = `/uploads/products/${req.file.filename}`;
    }
    // if no file uploaded, image_url remains undefined → Products.update will not overwrite it

    Product.update(id, data, (err) => {
      if (err) {
        console.error("DB error on update:", err);
        return res.status(500).json({ status: "error", message: "Gagal mengubah data", data: null });
      }
      res.json({ status: "success", message: "Data berhasil diubah", data: null });
    });
  }

  // DELETE
  destroy(req, res) {
    const { id } = req.params;

    Product.delete(id, (err) => {
      if (err) {
        console.error("DB error on delete:", err);
        return res.status(500).json({ status: "error", message: "Gagal menghapus data", data: null });
      }
      res.json({ status: "success", message: "Data berhasil dihapus", data: null });
    });
  }

}

module.exports = new ProductController();

