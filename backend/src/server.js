const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { initDatabase } = require("./config/database");
const authRoutes = require("./routes/auth");
const businessRoutes = require("./routes/businesses");
const customerRoutes = require("./routes/customers");
const paymentRoutes = require("./routes/payments");
const notificationRoutes = require("./routes/notifications");
const webhookRoutes = require("./routes/webhook");
const { initScheduledJobs } = require("./services/scheduledJobs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For Twilio webhook

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/webhook/whatsapp", webhookRoutes);

if (process.env.NODE_ENV === "development") {
  const devRoutes = require("./routes/dev");
  app.use("/api/dev", devRoutes);
  console.log("[dev] Dev routes enabled.");
}

// Test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server running" });
});

const PORT = process.env.PORT || 3000;

// Initialize database and start server
const startServer = async () => {
  await initDatabase();
  initScheduledJobs();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
