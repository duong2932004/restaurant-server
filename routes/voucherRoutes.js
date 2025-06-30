const express = require("express");
const router = express.Router();
const {
  getVouchers,
  getVoucherById,
  createVoucher,
  updateVoucher,
  deleteVoucher,
} = require("../controllers/voucherController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getVouchers).post(protect, admin, createVoucher);

router
  .route("/:id")
  .get(getVoucherById)
  .put(protect, admin, updateVoucher)
  .delete(protect, admin, deleteVoucher);

module.exports = router;
