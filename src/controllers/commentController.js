const Comment = require("../models/commentModel");
const Product = require("../models/productModel");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

const createComment = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const alreadyCommented = await Comment.findOne({
      user: req.user._id,
      product: productId,
    });

    if (alreadyCommented) {
      return res.status(400).json({ message: "Product already commented" });
    }

    const newComment = await Comment.create({
      user: req.user._id,
      product: productId,
      rating,
      comment,
    });

    res.status(201).json(newComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getProductComments = async (req, res) => {
  try {
    const comments = await Comment.find({ product: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const { rating, comment: commentText } = req.body;

    comment.rating = rating || comment.rating;
    comment.comment = commentText || comment.comment;

    const updatedComment = await comment.save();
    res.json(updatedComment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await comment.deleteOne();
    res.json({ message: "Comment removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createComment,
  getProductComments,
  updateComment,
  deleteComment,
};
