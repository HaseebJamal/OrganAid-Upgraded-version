// import React, { createContext, useContext, useEffect, useState } from "react";
// import * as authService from "../services/authService";

// /* =========================
//    AUTH CONTEXT
// ========================= */

// const AuthContext = createContext(null);

// /* =========================
//    PROVIDER
// ========================= */

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   /* =========================
//      LOAD USER ON START
//   ========================= */
//   useEffect(() => {
//   const loadUser = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       if (!token) {
//         setLoading(false);
//         return;
//       }

//       const user = await authService.getProfile();

//       setUser(user);
//       setRole(user?.role || null);
//     } catch (err) {
//       console.error(err);
//       localStorage.removeItem("token");
//     } finally {
//       setLoading(false);
//     }
//   };

//   loadUser();
// }, []);

//   /* =========================
//      LOGIN
//   ========================= */
//   const login = async (credentials) => {
//     const data = await authService.login(credentials);

//     if (data?.user) {
//       setUser(data.user);
//       setRole(data.user.role || null);
//     }

//     return data;
//   };

//   /* =========================
//      REGISTER
//   ========================= */
//   const register = async (payload) => {
//     const data = await authService.register(payload);

//     if (data?.user) {
//       setUser(data.user);
//       setRole(data.user.role || null);
//     }

//     return data;
//   };

//   /* =========================
//      LOGOUT
//   ========================= */
//   const logout = async () => {
//     try {
//       await authService.logout();
//     } finally {
//       setUser(null);
//       setRole(null);
//     }
//   };

//   /* =========================
//      REFRESH USER PROFILE
//   ========================= */
//   const refresh = async () => {
//     const data = await authService.getProfile();

//     if (data) {
//       setUser(data);
//       setRole(data.role || null);
//     }

//     return data;
//   };

//   /* =========================
//      CONTEXT VALUE
//   ========================= */

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         role,
//         loading,
//         login,
//         register,
//         logout,
//         refresh,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// /* =========================
//    CUSTOM HOOK
// ========================= */

// export const useAuth = () => {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used inside AuthProvider");
//   }

//   return context;
// };

// /* =========================
//    ROLE ROUTING HELPER
// ========================= */

// export const roleHome = (role) => {
//   switch (role) {
//     case "admin":
//       return "/admin/dashboard";

//     case "hospital":
//       return "/hospital/dashboard";

//     case "donor":
//       return "/donor/dashboard";

//     case "recipient":
//       return "/recipient/dashboard";

//     default:
//       return "/login";
//   }
// };