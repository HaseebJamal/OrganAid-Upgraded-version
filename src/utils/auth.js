/* ==========================================
   Authentication Utilities
========================================== */

export const getToken = () => {
  return localStorage.getItem("token");
};

export const getUser = () => {
  try {
    const user = localStorage.getItem("user");

    return user ? JSON.parse(user) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

export const isAuthenticated = () => {
  return Boolean(getToken());
};

export const getUserRole = () => {
  const user = getUser();

  return user?.role ?? null;
};

export const hasRole = (...roles) => {
  const role = getUserRole();

  if (!role) return false;

  return roles
    .map((item) => item.toLowerCase())
    .includes(role.toLowerCase());
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};