const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDatabase } = require("./config/database");
const authRoutes = require("./routes/auth");
const businessRoutes = require("./routes/businesses");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server running" });
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
const startServer = async () => {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
