const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { authenticate } = require("../middleware/auth");
const { verifyBusinessOwner } = require("../middleware/businessAccess");

router.use(authenticate);

// Get all notifications for a business (requires business ownership)
router.get("/business/:businessId", verifyBusinessOwner, notificationController.getBusinessNotifications);

// Mark notification as read
router.put("/:notificationId/read", notificationController.markNotificationAsRead);

// Mark all notifications as read for a business
router.put("/business/:businessId/read-all", verifyBusinessOwner, notificationController.markAllNotificationsAsRead);

module.exports = router;
