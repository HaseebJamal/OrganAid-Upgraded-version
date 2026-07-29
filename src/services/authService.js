import api from "./api";

/* ==========================================
   Save Authentication Session
========================================== */

function persistSession(data) {
  if (data?.token) {
    localStorage.setItem("token", data.token);
  }

  if (data?.user) {
    localStorage.setItem(
      "user",
      JSON.stringify(data.user)
    );
  }

  return data;
}

/* ==========================================
   Authentication
========================================== */

export const registerUser = async (
  payload
) => {
  const data = await api.post(
    "/auth/register",
    payload
  );

  return persistSession(data);
};

export const loginUser = async (
  payload
) => {
  const data = await api.post(
    "/auth/login",
    payload
  );

  return persistSession(data);
};

export const getMe = () =>
  api.get("/auth/me");

export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/* ==========================================
   Admin Authentication
========================================== */

export const adminLogin = async (
  email,
  password
) => {
  const data = await api.post(
    "/auth/admin/login",
    {
      email,
      password,
    }
  );

  persistSession(data);

  return data.user;
};

/*
 * Optional endpoint.
 * If your backend doesn't implement it,
 * simply return true.
 */
export const ensureAdminUser = async () => {
  try {
    return await api.post(
      "/auth/admin/ensure"
    );
  } catch {
    return true;
  }
};

/* ==========================================
   Forgot Password
========================================== */

export const forgotPassword = (
  email
) =>
  api.post(
    "/auth/forgot-password",
    {
      email,
    }
  );