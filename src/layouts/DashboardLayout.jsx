import { useMemo } from "react";
import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import DashboardShell from "../components/mycomponents/DashboardShell";
import { useAuth } from "../context/AuthContext";

const dashboardContent = {
  donor: {
    title: "Donor dashboard",
    subtitle:
      "Manage your donor profile, availability, medical records, and important updates from one secure workspace.",
    dashboardPath: "/donor/dashboard",
  },

  recipient: {
    title: "Recipient dashboard",
    subtitle:
      "Keep your care profile current, review request activity, and follow important medical coordination updates.",
    dashboardPath: "/recipient/dashboard",
  },

  hospital: {
    title: "Hospital dashboard",
    subtitle:
      "Review verification tasks, coordinate donor and recipient cases, and keep hospital information up to date.",
    dashboardPath: "/hospital/dashboard",
  },
};

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function getDashboardConfiguration(role) {
  return dashboardContent[normalizeRole(role)] || null;
}

function getPageContent(pathname, configuration) {
  const path = pathname.toLowerCase();

  if (path.includes("/profile")) {
    return {
      title: "Profile",
      subtitle:
        "Review and update your account, contact, and medical information.",
    };
  }

  if (
    path.includes("/reports") ||
    path.includes("/medical-records")
  ) {
    return {
      title: "Medical records",
      subtitle:
        "Review uploaded reports, medical documents, and verification information.",
    };
  }

  if (path.includes("/notifications")) {
    return {
      title: "Notifications",
      subtitle:
        "Review important updates, alerts, and care coordination activity.",
    };
  }

  if (path.includes("/requests")) {
    return {
      title: "Requests",
      subtitle:
        "Review request details, progress, and related coordination activity.",
    };
  }

  if (path.includes("/history")) {
    return {
      title: "Activity history",
      subtitle:
        "Review previous actions, updates, and account activity.",
    };
  }

  if (path.includes("/settings")) {
    return {
      title: "Settings",
      subtitle:
        "Manage account preferences, security, and notification options.",
    };
  }

  return {
    title: configuration.title,
    subtitle: configuration.subtitle,
  };
}

export default function DashboardLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();

  const role = normalizeRole(user?.role);

  const configuration = useMemo(
    () => getDashboardConfiguration(role),
    [role]
  );

  const pageContent = useMemo(() => {
    if (!configuration) return null;

    return getPageContent(
      location.pathname,
      configuration
    );
  }, [
    configuration,
    location.pathname,
  ]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
            hash: location.hash,
          },
        }}
      />
    );
  }

  if (!configuration || !pageContent) {
    return (
      <Navigate
        to="/unauthorized"
        replace
      />
    );
  }

  return (
    <DashboardShell
      title={pageContent.title}
      subtitle={pageContent.subtitle}
    >
      <Outlet />
    </DashboardShell>
  );
}

function DashboardLayoutSkeleton() {
  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <span className="sr-only">
        Loading your dashboard.
      </span>

      <aside
        className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-6 lg:block"
        aria-hidden="true"
      >
        <div className="flex animate-pulse items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-200" />

          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-28 rounded bg-slate-200" />
            <div className="h-3 w-36 rounded bg-slate-100" />
          </div>
        </div>

        <div className="mt-12 space-y-3">
          {Array.from({
            length: 4,
          }).map((_, index) => (
            <div
              key={`sidebar-skeleton-${index}`}
              className="flex animate-pulse items-center gap-3 rounded-2xl bg-slate-50 p-3"
            >
              <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />

              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3.5 w-24 rounded bg-slate-200" />
                <div className="h-2.5 w-32 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-6 left-5 right-5 h-40 animate-pulse rounded-2xl bg-slate-900" />
      </aside>

      <div className="min-h-screen lg:pl-72">
        <header
          className="sticky top-0 h-[72px] border-b border-slate-200 bg-white"
          aria-hidden="true"
        >
          <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200 lg:hidden" />

              <div className="space-y-2">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-40 animate-pulse rounded bg-slate-100" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />
              <div className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8">
          <div
            className="animate-pulse space-y-3"
            aria-hidden="true"
          >
            <div className="h-3 w-40 rounded bg-slate-200" />
            <div className="h-4 w-28 rounded bg-red-100" />
            <div className="h-9 w-64 rounded bg-slate-200" />
            <div className="h-4 w-full max-w-xl rounded bg-slate-100" />
          </div>

          <div
            className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
            aria-hidden="true"
          >
            {Array.from({
              length: 4,
            }).map((_, index) => (
              <div
                key={`card-skeleton-${index}`}
                className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white p-5"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="mt-5 h-4 w-24 rounded bg-slate-200" />
                <div className="mt-3 h-7 w-16 rounded bg-slate-200" />
              </div>
            ))}
          </div>

          <div
            className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]"
            aria-hidden="true"
          >
            <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
            <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
        </main>
      </div>
    </div>
  );
}