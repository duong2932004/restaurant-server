const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  getProductsByCategory,
} = require("../controllers/productController");
const { protect, admin } = require("../middleware/authMiddleware");

//public
router.get("/", getProducts);
router.get("/top", getTopProducts);
router.get("/:id", getProductById);
router.get("/category/:id", getProductsByCategory);

//protected
router.post("/", protect, admin, createProduct);
router.put("/", protect, admin, updateProduct);
router.delete("/", protect, admin, deleteProduct);

module.exports = router;
