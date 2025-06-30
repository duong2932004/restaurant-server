const express = require("express");
const router = express.Router();
const {
  createComment,
  getProductComments,
  updateComment,
  deleteComment,
} = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");

// Public routes
router.get("/product/:id", getProductComments);

// Protected routes
router.post("/", protect, createComment);
router.put("/:id", protect, updateComment);
router.delete("/:id", protect, deleteComment);

module.exports = router;
