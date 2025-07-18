const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    "items.product",
    "name price image"
  );

  if (!cart) {
    return res.json({ items: [] });
  }

  res.json(cart);
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || !quantity) {
    res.status(400);
    throw new Error("Please provide product ID and quantity");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [{ product: productId, quantity, price: product.price }],
      total_price: product.price * quantity,
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity, price: product.price });
    }

    cart.total_price = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }

  await cart.save();
  await cart.populate("items.product", "name price image");
  res.status(201).json(cart);
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;

  if (!quantity || quantity < 0) {
    res.status(400);
    throw new Error("Please provide a valid quantity");
  }

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const item = cart.items.find(
    (item) => item.product.toString() === req.params.productId
  );

  if (!item) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  if (quantity === 0) {
    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );
  } else {
    item.quantity = quantity;
  }

  cart.total_price = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();
  await cart.populate("items.product", "name price image");
  res.json(cart);
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  const itemExists = cart.items.some(
    (item) => item.product.toString() === req.params.productId
  );

  if (!itemExists) {
    res.status(404);
    throw new Error("Item not found in cart");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  cart.total_price = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  await cart.save();
  await cart.populate("items.product", "name price image");
  res.json(cart);
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    res.status(404);
    throw new Error("Cart not found");
  }

  cart.items = [];
  cart.total_price = 0;
  await cart.save();
  res.json({ message: "Cart cleared successfully" });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
