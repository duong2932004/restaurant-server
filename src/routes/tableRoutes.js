const express = require("express");
const router = express.Router();
const {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");
const { protect, admin } = require("../middleware/authMiddleware");

router.route("/").get(getTables).post(protect, admin, createTable);

router
  .route("/:id")
  .get(getTableById)
  .put(protect, admin, updateTable)
  .delete(protect, admin, deleteTable);

module.exports = router;
