const express = require("express");
const apiRoutes = require("./routes/api");
const path = require("path");

const app = express();

app.use(express.json());
app.use("/api", apiRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use((err, req, res, next) => {
  if (err) {
    return res.status(400).json({
      status: "error",
      message: err.message || "Upload error",
      data: null,
    });
  }
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({ message: "Server berjalan" });
});


app.listen(3000, () => {
  console.log("Server berjalan pada localhost:3000");
});


