const mongoose = require("mongoose");

const tableSchema = mongoose.Schema(
  {
    number: {
      type: String,
      required: [true, "Table number is required"],
      trim: true,
      unique: true,
      maxLength: [40, "Table number cannot exceed 40 characters"],
    },
    area: {
      type: String,
      required: [true, "Area is required"],
      trim: true,
      maxLength: [40, "Area cannot exceed 40 characters"],
    },
    seats: {
      type: Number,
      required: [true, "Number of seats is required"],
      min: [1, "Number of seats must be greater than 0"],
    },
    status: {
      type: String,
      enum: ["empty", "busy", "reserved"],
      default: "empty",
      required: [true, "Table status is required"],
    },
    qr_code: {
      type: String,
      required: [true, "QR code is required"],
      trim: true,
      unique: true,
      maxLength: [40, "QR code cannot exceed 40 characters"],
    },
    current_order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Table", tableSchema);
