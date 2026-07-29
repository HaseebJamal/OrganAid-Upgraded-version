import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function normalizeAllowedRoles({
  role,
  allowedRoles,
}) {
  const roles = Array.isArray(
    allowedRoles
  )
    ? allowedRoles
    : [];

  if (role) {
    roles.push(role);
  }

  return [
    ...new Set(
      roles
        .map(normalizeRole)
        .filter(Boolean)
    ),
  ];
}

export default function RoleRoute({
  role,
  allowedRoles = [],
  redirectTo = "/unauthorized",
}) {
  const { user, loading } =
    useAuth();

  const location =
    useLocation();

  if (loading) {
    return <RoleRouteLoader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname:
              location.pathname,
            search:
              location.search,
            hash:
              location.hash,
          },
        }}
      />
    );
  }

  const userRole =
    normalizeRole(
      user.role
    );

  const normalizedAllowedRoles =
    normalizeAllowedRoles({
      role,
      allowedRoles,
    });

  /*
   * No role restriction means any
   * authenticated user may continue.
   */
  if (
    normalizedAllowedRoles.length ===
    0
  ) {
    return <Outlet />;
  }

  const isAllowed =
    normalizedAllowedRoles.includes(
      userRole
    );

  if (!isAllowed) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{
          from: {
            pathname:
              location.pathname,
            search:
              location.search,
            hash:
              location.hash,
          },
          currentRole:
            userRole,
          allowedRoles:
            normalizedAllowedRoles,
        }}
      />
    );
  }

  return <Outlet />;
}

function RoleRouteLoader() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Checking account access"
    >
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div
          className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-red-600"
          aria-hidden="true"
        />

        <p className="mt-6 font-semibold text-slate-900">
          Checking access
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Please wait while
          OrganAid verifies your
          role and account
          permissions.
        </p>

        <span className="sr-only">
          Your authentication and
          role permissions are
          being checked.
        </span>
      </div>
    </main>
  );
}