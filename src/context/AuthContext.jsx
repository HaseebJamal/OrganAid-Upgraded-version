import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getMe,
  loginUser,
  registerUser,
} from "../services/authService";

const AuthContext = createContext(null);

function normalizeUser(response) {
  return (
    response?.user ||
    response?.data?.user ||
    response?.data ||
    null
  );
}

function getStoredToken() {
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function removeStoredToken() {
  try {
    localStorage.removeItem("token");
  } catch {
    // Local storage may be unavailable in restricted browsers.
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const loadUser = useCallback(async () => {
    const token = getStoredToken();

    if (!token) {
      setUser(null);
      return null;
    }

    try {
      setAuthError("");

      const response = await getMe();
      const authenticatedUser = normalizeUser(response);

      if (!authenticatedUser) {
        throw new Error(
          "Authenticated user information was not returned."
        );
      }

      setUser(authenticatedUser);

      return authenticatedUser;
    } catch (error) {
      removeStoredToken();
      setUser(null);

      setAuthError(
        error?.response?.data?.message ||
          error?.message ||
          "Your session has expired. Please sign in again."
      );

      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuthentication() {
      try {
        const token = getStoredToken();

        if (!token) {
          if (isMounted) {
            setUser(null);
          }

          return;
        }

        await loadUser();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initializeAuthentication();

    return () => {
      isMounted = false;
    };
  }, [loadUser]);

  const login = useCallback(
    async (payload) => {
      setAuthError("");

      const response = await loginUser(payload);

      const authenticatedUser =
        normalizeUser(response) || (await loadUser());

      if (authenticatedUser) {
        setUser(authenticatedUser);
      }

      return response;
    },
    [loadUser]
  );

  const register = useCallback(
    async (payload) => {
      setAuthError("");

      const response = await registerUser(payload);

      const authenticatedUser =
        normalizeUser(response) || (await loadUser());

      if (authenticatedUser) {
        setUser(authenticatedUser);
      }

      return response;
    },
    [loadUser]
  );

  const logout = useCallback(async () => {
    removeStoredToken();
    setUser(null);
    setAuthError("");
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError("");
  }, []);

  const isAuthenticated = Boolean(user);

  const hasRole = useCallback(
    (...roles) => {
      const currentRole = String(user?.role || "").toLowerCase();

      return roles
        .flat()
        .map((role) => String(role).toLowerCase())
        .includes(currentRole);
    },
    [user?.role]
  );

  const contextValue = useMemo(
    () => ({
      user,
      loading,
      authError,
      isAuthenticated,

      login,
      register,
      logout,

      refreshUser: loadUser,
      refreshAuth: loadUser,

      setUser,
      hasRole,
      clearAuthError,
    }),
    [
      user,
      loading,
      authError,
      isAuthenticated,
      login,
      register,
      logout,
      loadUser,
      hasRole,
      clearAuthError,
    ]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
}