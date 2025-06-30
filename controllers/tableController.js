const Table = require("../models/tableModel");
const asyncHandler = require("express-async-handler");

// @desc    Get all tables
// @route   GET /api/tables
// @access  Public
const getTables = asyncHandler(async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { number: { $regex: req.query.keyword, $options: "i" } },
            { status: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    const count = await Table.countDocuments({ ...keyword });
    const tables = await Table.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ number: 1 });

    res.json({
      tables,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Error fetching tables");
  }
});

// @desc    Get single table
// @route   GET /api/tables/:id
// @access  Public
const getTableById = asyncHandler(async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      res.status(404);
      throw new Error("Table not found");
    }

    res.json(table);
  } catch (error) {
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid table ID format");
    }
    res.status(500);
    throw new Error(error.message || "Error fetching table");
  }
});

// @desc    Create a table
// @route   POST /api/tables
// @access  Private/Admin
const createTable = asyncHandler(async (req, res) => {
  try {
    const { number, capacity, status } = req.body;

    if (!number || !capacity) {
      res.status(400);
      throw new Error("Please provide table number and capacity");
    }

    const existingTable = await Table.findOne({ number });
    if (existingTable) {
      res.status(400);
      throw new Error("Table number already exists");
    }

    const table = await Table.create({
      number,
      capacity,
      status: status || "available",
    });

    res.status(201).json(table);
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400);
      throw new Error("Invalid table data: " + error.message);
    }
    res.status(500);
    throw new Error(error.message || "Error creating table");
  }
});

// @desc    Update a table
// @route   PUT /api/tables/:id
// @access  Private/Admin
const updateTable = asyncHandler(async (req, res) => {
  try {
    const { number, capacity, status } = req.body;

    const table = await Table.findById(req.params.id);

    if (!table) {
      res.status(404);
      throw new Error("Table not found");
    }

    if (number && number !== table.number) {
      const existingTable = await Table.findOne({ number });
      if (existingTable) {
        res.status(400);
        throw new Error("Table number already exists");
      }
    }

    table.number = number || table.number;
    table.capacity = capacity || table.capacity;
    table.status = status || table.status;

    const updatedTable = await table.save();
    res.json(updatedTable);
  } catch (error) {
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid table ID format");
    }
    if (error.name === "ValidationError") {
      res.status(400);
      throw new Error("Invalid table data: " + error.message);
    }
    res.status(500);
    throw new Error(error.message || "Error updating table");
  }
});

// @desc    Delete a table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
const deleteTable = asyncHandler(async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);

    if (!table) {
      res.status(404);
      throw new Error("Table not found");
    }

    if (table.status === "occupied") {
      res.status(400);
      throw new Error("Cannot delete occupied table");
    }

    await table.deleteOne();
    res.json({ message: "Table removed successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid table ID format");
    }
    res.status(500);
    throw new Error(error.message || "Error deleting table");
  }
});

module.exports = {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
};
