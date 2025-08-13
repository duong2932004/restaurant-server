const User = require("../models/userModel");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const getUsers = asyncHandler(async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.pageNumber) || 1;

    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { email: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    const count = await User.countDocuments({ ...keyword });
    const users = await User.find({ ...keyword })
      .select("-password")
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      users,
      page,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    res.status(500);
    throw new Error(error.message || "Error fetching users");
  }
});

const getUserById = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user);
  } catch (error) {
    if (error.name === "CastError") {
      res.status(404);
      throw new Error("Invalid user ID format");
    }
    res.status(500);
    throw new Error(error.message || "Error fetching user");
  }
});

const createUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Please provide name, email and password");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400);
      throw new Error("User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  } catch (error) {
    if (error.name === "ValidationError") {
      res.status(400);
      throw new Error("Invalid user data: " + error.message);
    }
    res.status(500);
    throw new Error(error.message || "Error creating user");
  }
});

const updateUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400);
        throw new Error("Email already exists");
      }
    }

    user.name = name || user.name;
    user.email = email || user.email;
    if (password) {
      user.password = password;
    }
    user.role = role || user.role;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    if (error.name === "CastError") {
      res.status(404);
      throw new Error("Invalid user ID format");
    }
    if (error.name === "ValidationError") {
      res.status(400);
      throw new Error("Invalid user data: " + error.message);
    }
    res.status(500);
    throw new Error(error.message || "Error updating user");
  }
});

const deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    await user.deleteOne();
    res.json({ message: "User removed successfully" });
  } catch (error) {
    if (error.name === "CastError") {
      res.status(404);
      throw new Error("Invalid user ID format");
    }
    res.status(500);
    throw new Error(error.message || "Error deleting user");
  }
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide name, email and password" });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = await User.create({
    name,
    email,
    password,
    role: role || "user",
  });

  if (newUser) {
    const { password, ...userWithoutPassword } = newUser.toObject();
    return res.status(201).json(userWithoutPassword);
  } else {
    return res.status(500).json({ message: "Error creating user" });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  const user = await User.findOne({ email });
  console.log(user);

  if (!user || !(await user.matchPassword(password))) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  const { password: pwd, ...userWithoutPassword } = user.toObject();
  res.json(userWithoutPassword);
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (req.user) {
    return res.json(req.user);
  }
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(401).json({ message: "No access token" });
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET || "your-secret-key"
    );
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    return res.status(401).json({ message: "Invalid access token" });
  }
});

const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key"
    );
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const newAccessToken = generateAccessToken(user._id);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000,
    });

    const refreshTokenExp = jwt.decode(refreshToken).exp;
    const now = Math.floor(Date.now() / 1000);
    const timeLeft = refreshTokenExp - now;

    if (timeLeft < 24 * 60 * 60) {
      const newRefreshToken = generateRefreshToken(user._id);
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }

    const { password, ...userWithoutPassword } = user.toObject();
    res.json(userWithoutPassword);
  } catch (error) {
    console.error("🔍 Refresh Token Error:", error.message);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  register,
  login,
  getCurrentUser,
  refreshToken,
  logout,
};
