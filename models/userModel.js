const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      maxLength: [40, "Username cannot exceed 40 characters"],
    },
    email: {
      type: String,
      required: [true, "User email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxLength: [100, "Email cannot exceed 100 characters"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minLength: [6, "Password must have at least 6 characters"],
    },
    avatar: {
      type: String,
      default: "default-avatar.jpg",
    },
    role: {
      type: String,
      enum: ["user", "admin", "staff"],
      default: "user",
      required: [true, "User role is required"],
    },
    addresses: [
      {
        name: {
          type: String,
          required: [true, "Address name is required"],
        },
        address: {
          type: String,
          required: [true, "Address is required"],
        },
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],
    active_status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
