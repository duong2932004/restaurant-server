const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      maxLength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    promotional_price: {
      type: Number,
      min: [0, "Promotional price cannot be negative"],
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Please select product category"],
    },
    image: [
      {
        url: {
          type: String,
          required: [true, "Please enter image URL"],
        },
        alt: {
          type: String,
          default: "",
        },
      },
    ],
    variants: [
      {
        name: {
          type: String,
          required: [true, "Please enter variant name"],
          trim: true,
        },
        price: {
          type: Number,
          required: [true, "Please enter variant price"],
          min: [0, "Price cannot be negative"],
        },
        promotional_price: {
          type: Number,
          min: [0, "Promotional price cannot be negative"],
          default: 0,
        },
        stock: {
          type: Number,
          min: [0, "Stock quantity cannot be negative"],
          default: 0,
        },
      },
    ],
    quantity: {
      type: Number,
      required: [true, "Please enter product quantity"],
      min: [0, "Product quantity cannot be negative"],
      default: 0,
    },
    sold: {
      type: Number,
      min: [0, "Sold quantity cannot be negative"],
      default: 0,
    },
    rating: {
      type: Number,
      min: [0, "Rating cannot be negative"],
      max: [5, "Rating cannot exceed 5"],
      default: 0,
    },
    active_status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);
