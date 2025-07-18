const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

const getProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};

    const category = req.query.category ? { category: req.query.category } : {};

    const count = await Product.countDocuments({ ...keyword, ...category });
    const products = await Product.find({ ...keyword, ...category })
      .populate("category", "name")
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

const getProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category",
      "name"
    );

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

const createProduct = asyncHandler(async (req, res) => {
  try {
    const { name, price, description, image, category, quantity, variants } =
      req.body;

    const product = new Product({
      name,
      price,
      description,
      image,
      category,
      quantity,
      variants: variants || [],
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      image,
      category,
      quantity,
      variants,
      promotional_price,
      active_status,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.price = price || product.price;
      product.description = description || product.description;
      product.image = image || product.image;
      product.category = category || product.category;
      product.quantity = quantity || product.quantity;
      product.variants = variants || product.variants;
      product.promotional_price =
        promotional_price || product.promotional_price;
      product.active_status =
        active_status !== undefined ? active_status : product.active_status;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

const deleteProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne();
      res.json({ message: "Product removed" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

const getTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(5);
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.id }).populate(
      "category",
      "name"
    );

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Server error: " + err.message });
  }
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getTopProducts,
  getProductsByCategory,
};
