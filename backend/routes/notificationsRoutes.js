const express = require("express");
const router = express.Router();
const notificationsController = require("../controllers/notificationsController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/notifications – get notifications for the authenticated user
router.get("/", authMiddleware.requireAuth, notificationsController.getNotifications);

// PUT /api/notifications/:id/read – mark a specific notification as read
router.put("/:id/read", authMiddleware.requireAuth, notificationsController.markAsRead);

// PUT /api/notifications/read-all – mark all notifications as read
router.put("/read-all", authMiddleware.requireAuth, notificationsController.markAllAsRead);

// DELETE /api/notifications/clear-all – delete all notifications
router.delete("/clear-all", authMiddleware.requireAuth, notificationsController.deleteAllNotifications);

// DELETE /api/notifications/:id – delete a single notification
router.delete("/:id", authMiddleware.requireAuth, notificationsController.deleteNotification);

module.exports = router;
