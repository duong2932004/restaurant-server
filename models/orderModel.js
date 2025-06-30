const { default: mongoose } = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    order_number: {
      type: String,
      required: [true, "Order number is required"],
      unique: true,
      trim: true,
      maxLength: [20, "Order number cannot exceed 20 characters"],
    },
    order_type: {
      type: String,
      enum: ["delivery", "dine_in"],
      required: [true, "Order type is required"],
    },
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
        item_total: {
          type: Number,
          default: 0,
        },
      },
    ],
    sub_total: {
      type: Number,
      required: [true, "Subtotal before tax is required"],
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    total_price: {
      type: Number,
      required: [true, "Total price is required"],
      default: 0,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "preparing",
        "shipping",
        "delivered",
        "completed",
        "cancelled",
      ],
      default: "pending",
      required: [true, "Order status is required"],
    },
    payment_method: {
      type: String,
      enum: ["cash", "bank_transfer", "credit_card"],
      required: [true, "Payment method is required"],
    },
    payment_status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    shipping_address: {
      type: String,
      required: function () {
        return this.order_type === "delivery";
      },
    },
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: function () {
        return this.order_type === "dine_in";
      },
    },
    note: {
      type: String,
      default: "",
    },
    voucher_applied: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voucher",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
