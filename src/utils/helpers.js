import {
  STORAGE_KEYS,
  USER_ROLES,
} from "./constants";

/* ==========================================
   Environment Helpers
========================================== */

function isBrowser() {
  return (
    typeof window !== "undefined" &&
    typeof window.localStorage !== "undefined"
  );
}

/* ==========================================
   Storage Helpers
========================================== */

export function getStorageItem(key) {
  if (!isBrowser()) {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorageItem(key, value) {
  if (!isBrowser()) {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);

    return true;
  } catch {
    return false;
  }
}

export function removeStorageItem(key) {
  if (!isBrowser()) {
    return false;
  }

  try {
    window.localStorage.removeItem(key);

    return true;
  } catch {
    return false;
  }
}

/* ==========================================
   Authentication Storage
========================================== */

export function getToken() {
  return getStorageItem(STORAGE_KEYS.TOKEN);
}

export function setToken(token) {
  if (!token) {
    removeToken();
    return false;
  }

  return setStorageItem(
    STORAGE_KEYS.TOKEN,
    String(token)
  );
}

export function removeToken() {
  return removeStorageItem(
    STORAGE_KEYS.TOKEN
  );
}

export function getUser() {
  const storedUser = getStorageItem(
    STORAGE_KEYS.USER
  );

  if (!storedUser) {
    return null;
  }

  try {
    const user = JSON.parse(storedUser);

    if (
      !user ||
      typeof user !== "object" ||
      Array.isArray(user)
    ) {
      removeStorageItem(STORAGE_KEYS.USER);
      return null;
    }

    return user;
  } catch {
    removeStorageItem(STORAGE_KEYS.USER);

    return null;
  }
}

export function setUser(user) {
  if (!user || typeof user !== "object") {
    removeUser();
    return false;
  }

  try {
    return setStorageItem(
      STORAGE_KEYS.USER,
      JSON.stringify(user)
    );
  } catch {
    return false;
  }
}

export function removeUser() {
  return removeStorageItem(
    STORAGE_KEYS.USER
  );
}

export function clearAuthStorage() {
  removeToken();
  removeUser();
}

export function persistAuthSession(data = {}) {
  if (data.token) {
    setToken(data.token);
  }

  if (data.user) {
    setUser(data.user);
  }

  return data;
}

export function isLoggedIn() {
  return Boolean(getToken());
}

/* ==========================================
   Role Helpers
========================================== */

export function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

export function getUserRole(user = getUser()) {
  return user?.role
    ? normalizeRole(user.role)
    : null;
}

export function hasRole(
  user,
  ...allowedRoles
) {
  const userRole = getUserRole(user);

  if (!userRole) {
    return false;
  }

  const normalizedRoles = allowedRoles
    .flat()
    .filter(Boolean)
    .map(normalizeRole);

  return normalizedRoles.includes(userRole);
}

export function isAdmin(user) {
  return hasRole(
    user,
    USER_ROLES.ADMIN,
    USER_ROLES.SUPER_ADMIN
  );
}

export function isDonor(user) {
  return hasRole(
    user,
    USER_ROLES.DONOR
  );
}

export function isRecipient(user) {
  return hasRole(
    user,
    USER_ROLES.RECIPIENT
  );
}

export function isHospital(user) {
  return hasRole(
    user,
    USER_ROLES.HOSPITAL
  );
}

/* ==========================================
   String Helpers
========================================== */

export function capitalize(value) {
  const text = String(value || "").trim();

  if (!text) {
    return "";
  }

  return (
    text.charAt(0).toUpperCase() +
    text.slice(1)
  );
}

export function formatLabel(
  value,
  fallback = ""
) {
  const text = String(value || "")
    .trim()
    .replace(/[_-]+/g, " ");

  if (!text) {
    return fallback;
  }

  return text.replace(/\b\w/g, (letter) =>
    letter.toUpperCase()
  );
}

export function getInitials(
  name,
  fallback = "OA"
) {
  const initials = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return initials || fallback;
}

/* ==========================================
   Date Helpers
========================================== */

export function isValidDate(value) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

export function formatDate(
  value,
  options = {}
) {
  if (!isValidDate(value)) {
    return options.fallback || "—";
  }

  const {
    locale = "en-GB",
    ...dateOptions
  } = options;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...dateOptions,
  }).format(new Date(value));
}

export function formatDateTime(
  value,
  options = {}
) {
  if (!isValidDate(value)) {
    return options.fallback || "—";
  }

  const {
    locale = "en-GB",
    ...dateOptions
  } = options;

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...dateOptions,
  }).format(new Date(value));
}

export function toDateInputValue(value) {
  if (!isValidDate(value)) {
    return "";
  }

  const date = new Date(value);

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ==========================================
   Error Helpers
========================================== */

export function getErrorMessage(
  error,
  fallback = "Something went wrong."
) {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return (
    error?.data?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}
