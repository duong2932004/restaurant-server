const mongoose = require("mongoose");

const voucherSchema = mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Voucher code is required"],
      trim: true,
      unique: true,
      uppercase: true,
      maxLength: [40, "Voucher code cannot exceed 40 characters"],
    },
    name: {
      type: String,
      required: [true, "Voucher name is required"],
      trim: true,
      maxLength: [100, "Voucher name cannot exceed 100 characters"],
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "Discount type is required"],
    },
    discount_value: {
      type: Number,
      required: [true, "Discount value is required"],
      min: [0, "Discount value cannot be negative"],
      validate: {
        validator: function (value) {
          return !(this.discount_type === "percentage" && value > 100);
        },
        message: "Percentage discount cannot exceed 100%",
      },
    },
    min_order: {
      type: Number,
      required: [true, "Minimum order value is required"],
      min: [0, "Order value cannot be negative"],
    },
    max_discount: {
      type: Number,
      required: function () {
        return this.discount_type === "percentage";
      },
      min: [0, "Maximum discount value cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Voucher quantity is required"],
      min: [0, "Voucher quantity cannot be negative"],
    },
    used: {
      type: Number,
      default: 0,
      min: [0, "Used quantity cannot be negative"],
    },
    start_date: {
      type: Date,
      required: [true, "Start date is required"],
    },
    end_date: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.start_date;
        },
        message: "End date must be after start date",
      },
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

module.exports = mongoose.model("Voucher", voucherSchema);
