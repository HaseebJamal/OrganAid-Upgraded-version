/* ==========================================
   Application Constants
========================================== */

/* ==========================
   APP
========================== */

export const APP_NAME = "OrganAid";
export const APP_VERSION = "1.0.0";

/* ==========================
   USER ROLES
========================== */

export const USER_ROLES = Object.freeze({
  ADMIN: "admin",
  DONOR: "donor",
  RECIPIENT: "recipient",
  HOSPITAL: "hospital",
});

/* ==========================
   STORAGE KEYS
========================== */

export const STORAGE_KEYS = Object.freeze({
  TOKEN: "token",
  USER: "user",
  THEME: "theme",
});

/* ==========================
   AUTH ENDPOINTS
========================== */

export const AUTH_ENDPOINTS = Object.freeze({
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ME: "/auth/me",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
});

/* ==========================
   ADMIN
========================== */

export const ADMIN_ENDPOINTS = Object.freeze({
  STATS: "/admin/stats",
  USERS: "/admin/users",
  PROFILE: "/admin/profile",
  SETTINGS: "/admin/settings",
  APPROVALS: "/admin/approvals",
  NOTIFICATIONS: "/admin/notifications",
});

/* ==========================
   DONOR
========================== */

export const DONOR_ENDPOINTS = Object.freeze({
  BASE: "/donors",
  ME: "/donors/me",
  AVAILABLE: "/donors/available",
  AVAILABILITY: "/donors/availability",
});

/* ==========================
   RECIPIENT
========================== */

export const RECIPIENT_ENDPOINTS = Object.freeze({
  BASE: "/recipients",
  ME: "/recipients/me",
  REQUESTS: "/recipients/requests",
});

/* ==========================
   HOSPITAL
========================== */

export const HOSPITAL_ENDPOINTS = Object.freeze({
  BASE: "/hospital",
  ME: "/hospital/me",
  QUEUE: "/hospital/queue",
  HISTORY: "/hospital/history",
  VERIFY: "/hospital/verify",
});

/* ==========================
   REPORTS
========================== */

export const REPORT_ENDPOINTS = Object.freeze({
  BASE: "/reports",
});

/* ==========================
   NOTIFICATIONS
========================== */

export const NOTIFICATION_ENDPOINTS = Object.freeze({
  BASE: "/notifications",
  ME: "/notifications/me",
  READ_ALL: "/notifications/read-all",
});

/* ==========================
   BLOOD GROUPS
========================== */

export const BLOOD_GROUPS = Object.freeze([
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
]);

/* ==========================
   ORGAN TYPES
========================== */

export const ORGAN_TYPES = Object.freeze([
  "Kidney",
  "Liver",
  "Heart",
  "Lung",
  "Pancreas",
  "Cornea",
  "Bone Marrow",
]);

/* ==========================
   REQUEST STATUS
========================== */

export const REQUEST_STATUS = Object.freeze({
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
  APPROVED: "approved",
  COMPLETED: "completed",
});

/* ==========================
   DONOR AVAILABILITY
========================== */

export const AVAILABILITY_STATUS = Object.freeze({
  AVAILABLE: "Available",
  UNAVAILABLE: "Unavailable",
});

/* ==========================
   URGENCY LEVELS
========================== */

export const URGENCY_LEVELS = Object.freeze([
  "Low",
  "Medium",
  "High",
  "Critical",
]);