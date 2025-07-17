process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const connectDB = require("../config/db");

connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// cors
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(helmet());
app.use(morgan("dev"));

// routes
app.use("/api/users", require("../routes/userRoutes"));
app.use("/api/products", require("../routes/productRoutes"));
app.use("/api/orders", require("../routes/orderRoutes"));
app.use("/api/tables", require("../routes/tableRoutes"));
app.use("/api/vouchers", require("../routes/voucherRoutes"));
app.use("/api/cart", require("../routes/cartRoutes"));
app.use("/api/categories", require("../routes/categoryRoutes"));
app.use("/api/comments", require("../routes/commentRoutes"));

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send(`Server running ${PORT}`);
});

// 404 handler
app.use((req, res, next) => {
  res.status(404);
  next(new Error(`Not Found - ${req.originalUrl}`));
});

app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  server.close(() => process.exit(1));
});
