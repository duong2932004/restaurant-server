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
const { protect, admin } = require("../middleware/authMiddleware");

router
  .route("/")
  .get(protect, admin, getUsers)
  .post(protect, admin, createUser);

router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.route("/register").post(register);
router.route("/me").get(getCurrentUser);
router.route("/refresh").post(refreshToken);
router.route("/logout").post(logout);
router.route("/login").post(login);

module.exports = router;
