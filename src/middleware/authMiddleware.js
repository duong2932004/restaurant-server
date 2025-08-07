const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.accessToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        res.status(401);
        throw new Error("User not found - token invalid");
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  } else {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

const admin = (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error("Not authorized, no user found");
  }

  if (req.user.role === "admin") {
    next();
  } else {
    res.status(403);
    throw new Error("Access denied - Admin role required");
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error("Not authorized, no user found");
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403);
      throw new Error(`Access denied - Required roles: ${roles.join(", ")}`);
    }
  };
};

const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = req.cookies.accessToken;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select("-password");

      if (user) {
        req.user = user;
      }
    } catch (error) {
      console.log("Optional auth failed:", error.message);
    }
  }

  next();
});

module.exports = {
  protect,
  admin,
  checkRole,
  optionalAuth,
};
