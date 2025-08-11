const express = require("express");
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  register,
  getCurrentUser,
  refreshToken,
  logout,
  login,
} = require("../controllers/userController");
const {
  protect,
  admin,
  optionalAuth,
} = require("../middleware/authMiddleware");

// Public routes
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/refresh").post(refreshToken);

// Protected routes
router.route("/me").get(protect, getCurrentUser);
router.route("/logout").post(protect, logout);

// Admin routes
router
  .route("/")
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

module.exports = router;
