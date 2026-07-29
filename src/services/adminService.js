import api from "./api";

/* ==========================================
   Helpers
========================================== */

const buildQuery = (params = {}) => {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.append(key, value);
    }
  });

  return query.toString()
    ? `?${query.toString()}`
    : "";
};

const request = async (promise) => promise;

/* ==========================================
   Dashboard
========================================== */

export const getAdminStats = () =>
  request(api.get("/admin/stats"));

/* ==========================================
   User Management
========================================== */

export const getUsers = (params = {}) =>
  request(
    api.get(`/admin/users${buildQuery(params)}`)
  );

export const updateUserRole = (
  userId,
  role
) =>
  request(
    api.put(`/admin/users/${userId}/role`, {
      role,
    })
  );

export const setUserActive = (
  userId,
  active
) =>
  request(
    api.patch(
      `/admin/users/${userId}/status`,
      {
        active,
      }
    )
  );

export const deleteUser = (userId) =>
  request(
    api.delete(`/admin/users/${userId}`)
  );

/* ==========================================
   Approval Queue
========================================== */

export const getApprovals = () =>
  request(api.get("/admin/approvals"));

/* ==========================================
   Notifications
========================================== */

export const sendNotification = (
  payload
) =>
  request(
    api.post(
      "/admin/notifications",
      payload
    )
  );

/* ==========================================
   Admin Profile
========================================== */

export const updateAdminProfile = (
  payload
) =>
  request(
    api.put("/admin/profile", payload)
  );

/* ==========================================
   System Settings
========================================== */

export const getSystemSettings = () =>
  request(api.get("/admin/settings"));

export const updateSystemSettings = (
  payload
) =>
  request(
    api.put("/admin/settings", payload)
  );