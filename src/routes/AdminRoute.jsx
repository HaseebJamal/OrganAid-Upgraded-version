import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

const ADMIN_ROLES = new Set([
  "admin",
  "super_admin",
  "super-admin",
  "superadmin",
]);

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function getCurrentLocation(location) {
  return {
    pathname: location.pathname,
    search: location.search,
    hash: location.hash,
  };
}

export default function AdminRoute({
  children,
  loginPath = "/login",
  unauthorizedPath = "/unauthorized",
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AdminRouteLoader />;
  }

  if (!user) {
    return (
      <Navigate
        to={loginPath}
        replace
        state={{
          from: getCurrentLocation(location),
        }}
      />
    );
  }

  const userRole = normalizeRole(user.role);
  const hasAdminAccess = ADMIN_ROLES.has(userRole);

  if (!hasAdminAccess) {
    return (
      <Navigate
        to={unauthorizedPath}
        replace
        state={{
          from: getCurrentLocation(location),
          currentRole: userRole,
          requiredRoles: Array.from(ADMIN_ROLES),
        }}
      />
    );
  }

  return children ?? <Outlet />;
}

function AdminRouteLoader() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Checking administrator access"
    >
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div
          className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50"
          aria-hidden="true"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-100 border-t-red-600" />
        </div>

        <p className="mt-6 text-lg font-semibold text-slate-900">
          Checking administrator access
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Please wait while OrganAid verifies your account and administrator
          permissions.
        </p>

        <div
          className="mt-6 space-y-3"
          aria-hidden="true"
        >
          <div className="mx-auto h-3 w-full animate-pulse rounded-full bg-slate-100" />
          <div className="mx-auto h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
        </div>

        <span className="sr-only">
          Your authentication status and administrator role are being checked.
        </span>
      </div>
    </main>
  );
}