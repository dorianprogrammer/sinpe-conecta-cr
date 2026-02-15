const Notification = require("../models/Notification");

const getBusinessNotifications = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { unread_only } = req.query;

    const isReadFilter = unread_only === "true" ? false : null;
    const notifications = await Notification.findByBusinessId(businessId, isReadFilter);

    res.json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.markAsRead(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Mark notification read error:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { businessId } = req.params;

    const notifications = await Notification.markAllAsRead(businessId);

    res.json({
      message: "All notifications marked as read",
      count: notifications.length,
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
};

module.exports = {
  getBusinessNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
