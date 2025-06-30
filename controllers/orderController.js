const Order = require("../models/orderModel");
const asyncHandler = require("express-async-handler");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  try {
    const { orderItems, table, paymentMethod, totalPrice, status } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }

    if (!table) {
      res.status(400);
      throw new Error("Table is required");
    }

    if (!paymentMethod) {
      res.status(400);
      throw new Error("Payment method is required");
    }

    const order = await Order.create({
      orderItems,
      table,
      paymentMethod,
      totalPrice,
      status: status || "pending",
      user: req.user._id,
    });

    res.status(201).json(order);
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400);
      throw new Error("Invalid order data: " + error.message);
    }
    res.status(500);
    throw new Error(error.message || "Error creating order");
  }
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name price");

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    // Check if the order belongs to the user or if user is admin
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      res.status(403);
      throw new Error("Not authorized to access this order");
    }

    res.json(order);
  } catch (error) {
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid order ID format");
    }
    res.status(500);
    throw new Error(error.message || "Error fetching order");
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Order.countDocuments({ user: req.user._id });
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.product", "name price")
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Error fetching user orders");
  }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { "user.name": { $regex: req.query.keyword, $options: "i" } },
            { status: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    const count = await Order.countDocuments({ ...keyword });
    const orders = await Order.find({ ...keyword })
      .populate("user", "id name")
      .populate("orderItems.product", "name price")
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Error fetching orders");
  }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      res.status(400);
      throw new Error("Status is required");
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    order.status = status;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
  } catch (error) {
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid order ID format");
    }
    if (error.name === "ValidationError") {
      res.status(400);
      throw new Error("Invalid status data: " + error.message);
    }
    res.status(500);
    throw new Error(error.message || "Error updating order status");
  }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    await order.deleteOne();
    res.json({ message: "Order removed successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      res.status(400);
      throw new Error("Invalid order ID format");
    }
    res.status(500);
    throw new Error(error.message || "Error deleting order");
  }
});

module.exports = {
  createOrder,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  deleteOrder,
};
