const Notification = require("../models/Notification");

const notificationsController = {
  /**
   * Helper: Create a new notification for a user.
   * This can be called from any other controller.
   */
  createNotification: async (userId, message, type) => {
    try {
      const notification = new Notification({
        user: userId,
        message,
        type,
        isRead: false,
      });
      await notification.save();
      return notification;
    } catch (error) {
      throw new Error("Failed to create notification: " + error.message);
    }
  },

  /**
   * GET /notifications
   * Get all unread notifications for the currently authenticated user.
   */
  // controllers/notificationsController.js
  // controllers/notificationsController.js
  getNotifications: async (req, res) => {
    try {
      const userId = req.user._id;
      // Return all notifications (both read and unread)
      const notifications = await Notification.find({ user: userId }).sort({
        createdAt: -1,
      });
      return res.status(200).json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ message: "Failed to get notifications" });
    }
  },

  /**
   * PUT /notifications/:id/read
   * Mark a single notification as read.
   */
  markAsRead: async (req, res) => {
    try {
      const notificationId = req.params.id;
      // Update isRead and set readAt timestamp
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: req.user._id },
        { isRead: true, readAt: new Date() },
        { new: true },
      );
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      return res.status(200).json(notification);
    } catch (error) {
      console.error("Mark as read error:", error);
      return res
        .status(500)
        .json({ message: "Failed to mark notification as read" });
    }
  },

  /**
   * PUT /notifications/read-all
   * Mark all notifications for the user as read.
   */
  markAllAsRead: async (req, res) => {
    try {
      const userId = req.user._id;
      // Set isRead and readAt for all unread notifications
      await Notification.updateMany(
        { user: userId, isRead: false },
        { isRead: true, readAt: new Date() },
      );
      return res
        .status(200)
        .json({ message: "All notifications marked as read" });
    } catch (error) {
      console.error("Mark all as read error:", error);
      return res
        .status(500)
        .json({ message: "Failed to mark all notifications as read" });
    }
  },

  /**
   * DELETE /notifications/:id
   * Delete a single notification immediately.
   */
  deleteNotification: async (req, res) => {
    try {
      const notificationId = req.params.id;
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        user: req.user._id,
      });
      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }
      return res.status(200).json({ message: "Notification deleted." });
    } catch (error) {
      console.error("Delete notification error:", error);
      return res.status(500).json({ message: "Failed to delete notification" });
    }
  },

  /**
   * DELETE /notifications/clear-all
   * Delete all notifications for the authenticated user.
   */
  deleteAllNotifications: async (req, res) => {
    try {
      const userId = req.user._id;
      await Notification.deleteMany({ user: userId });
      return res.status(200).json({ message: "All notifications deleted." });
    } catch (error) {
      console.error("Delete all notifications error:", error);
      return res
        .status(500)
        .json({ message: "Failed to delete notifications" });
    }
  },
};

module.exports = notificationsController;
