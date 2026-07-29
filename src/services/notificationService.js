import api from "./api";

/* ==========================================
   Helpers
========================================== */

const unwrapNotifications = (response) =>
  response?.notifications || [];

/* ==========================================
   Notifications
========================================== */

export const getUserNotifications =
  async () => {
    const data = await api.get(
      "/notifications/me"
    );

    return unwrapNotifications(data);
  };

export const markAllAsRead =
  async () => {
    return await api.put(
      "/notifications/read-all"
    );
  };

export const markAsRead = async (
  notificationId
) => {
  return await api.patch(
    `/notifications/${notificationId}/read`
  );
};

export const deleteNotification =
  async (notificationId) => {
    return await api.delete(
      `/notifications/${notificationId}`
    );
  };

const notificationService = {
  getUserNotifications,
  markAllAsRead,
  markAsRead,
  deleteNotification,
};

export default notificationService;