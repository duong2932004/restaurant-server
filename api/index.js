const express = require("express");
const app = express();

// Middlewares, routes, etc.
app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Vercel Serverless!" });
});

// Export handler cho Vercel
module.exports = app;
