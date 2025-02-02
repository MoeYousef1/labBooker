import { useEffect, useState, useCallback, useMemo } from "react";
import api from "../utils/axiosConfig";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data);
      console.log("Fetched notifications:", response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Optionally, set up polling or websockets for real-time updates.
  }, [fetchNotifications]);

  const clearAllNotifications = useCallback(async () => {
    try {
      await api.delete("/notifications/clear-all");
      setNotifications([]);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }, []);

  const markNotificationAsRead = useCallback(async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update the notification in state so it remains visible but is marked as read.
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === id ? { ...notif, isRead: true, readAt: new Date() } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const deleteNotification = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }, []);

  // Compute unread count (only notifications with isRead === false)
  const unreadCount = useMemo(() => {
    return notifications.filter((notif) => !notif.isRead).length;
  }, [notifications]);

  return {
    notifications,
    loading,
    fetchNotifications,
    clearAllNotifications,
    markNotificationAsRead,
    deleteNotification,
    unreadCount,
  };
};
