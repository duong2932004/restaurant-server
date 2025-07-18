const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        variant_name: {
          type: String,
          trim: true,
        },
        quantity: {
          type: Number,
          required: [true, "Product quantity is required"],
          min: [1, "Product quantity cannot be less than 1"],
        },
        price: {
          type: Number,
          required: [true, "Product price is required"],
          min: [0, "Price cannot be negative"],
        },
      },
    ],
    total_price: {
      type: Number,
      required: [true, "Total price is required"],
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Cart", cartSchema);
