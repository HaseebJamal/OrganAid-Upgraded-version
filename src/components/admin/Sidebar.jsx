import {
  BellRing,
  ClipboardCheck,
  HeartPulse,
  LayoutDashboard,
  Settings,
  UsersRound,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

export const adminNavigationItems = [
  {
    to: "/admin/dashboard",
    label: "Overview",
    description: "System summary",
    icon: LayoutDashboard,
  },
  {
    to: "/admin/users",
    label: "User management",
    description: "Manage platform users",
    icon: UsersRound,
  },
  {
    to: "/admin/requests",
    label: "Review queue",
    description: "Verify pending requests",
    icon: ClipboardCheck,
  },
  {
    to: "/admin/notifications",
    label: "Notifications",
    description: "Updates and alerts",
    icon: BellRing,
  },
  {
    to: "/admin/settings",
    label: "Settings",
    description: "Platform preferences",
    icon: Settings,
  },
];

/**
 * Shared admin sidebar.
 *
 * Desktop usage:
 * <Sidebar />
 *
 * Mobile usage:
 * <Sidebar mobile isOpen={isSidebarOpen} onClose={closeSidebar} />
 */
export default function Sidebar({
  mobile = false,
  isOpen = false,
  onClose,
}) {
  if (mobile) {
    return (
      <MobileSidebar
        isOpen={isOpen}
        onClose={onClose}
      />
    );
  }

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-slate-200/80 bg-white lg:flex"
      aria-label="Admin sidebar"
    >
      <SidebarContent />
    </aside>
  );
}

function MobileSidebar({
  isOpen,
  onClose,
}) {
  return (
    <div
      className={[
        "fixed inset-0 z-50 lg:hidden",
        isOpen
          ? "pointer-events-auto"
          : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        onClick={onClose}
        tabIndex={isOpen ? 0 : -1}
        className={[
          "absolute inset-0 bg-slate-950/45 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen
            ? "opacity-100"
            : "opacity-0",
        ].join(" ")}
        aria-label="Close admin navigation"
      />

      <aside
        id="admin-mobile-sidebar"
        className={[
          "relative flex h-full w-[min(18rem,88vw)] flex-col",
          "border-r border-slate-200 bg-white shadow-2xl",
          "transition-transform duration-300 ease-out",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
        aria-label="Admin mobile navigation"
      >
        <button
          type="button"
          onClick={onClose}
          tabIndex={isOpen ? 0 : -1}
          className={[
            "absolute right-4 top-4 z-10",
            "grid h-10 w-10 place-items-center rounded-xl",
            "text-slate-500 transition",
            "hover:bg-slate-100 hover:text-slate-900",
            "focus-visible:outline-none",
            "focus-visible:ring-4 focus-visible:ring-red-100",
          ].join(" ")}
          aria-label="Close admin navigation"
        >
          <X
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>

        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}

function SidebarContent({
  onNavigate,
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 py-6">
      <Brand onNavigate={onNavigate} />

      <div className="mt-10">
        <p className="px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>

        <nav
          className="mt-3 space-y-1.5"
          aria-label="Admin navigation"
        >
          {adminNavigationItems.map(
            (item) => (
              <SidebarLink
                key={item.to}
                {...item}
                onNavigate={onNavigate}
              />
            )
          )}
        </nav>
      </div>

      <div className="mt-auto space-y-4 pt-8">
        <SupportCard
          onNavigate={onNavigate}
        />

        <p className="px-2 text-center text-[11px] leading-5 text-slate-400">
          OrganAid administration portal
        </p>
      </div>
    </div>
  );
}

function Brand({
  onNavigate,
}) {
  return (
    <NavLink
      to="/admin/dashboard"
      onClick={onNavigate}
      className={[
        "group flex items-center gap-3 rounded-2xl px-2 py-1",
        "focus-visible:outline-none",
        "focus-visible:ring-4 focus-visible:ring-red-100",
      ].join(" ")}
      aria-label="Go to OrganAid admin dashboard"
    >
      <span
        className={[
          "grid h-12 w-12 shrink-0 place-items-center",
          "rounded-2xl",
          "bg-gradient-to-br from-red-500 to-red-700",
          "text-white shadow-lg shadow-red-200",
          "transition-transform duration-200",
          "group-hover:scale-105",
        ].join(" ")}
      >
        <HeartPulse
          className="h-6 w-6"
          aria-hidden="true"
        />
      </span>

      <span className="min-w-0">
        <strong className="block truncate text-lg font-extrabold tracking-[0.18em] text-slate-950">
          ORGANAID
        </strong>

        <span className="mt-0.5 block truncate text-xs font-medium text-slate-500">
          Administration portal
        </span>
      </span>
    </NavLink>
  );
}

function SidebarLink({
  to,
  label,
  description,
  icon: Icon,
  onNavigate,
}) {
  const isDashboard =
    to === "/admin/dashboard";

  return (
    <NavLink
      to={to}
      end={isDashboard}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          "group relative flex items-center gap-3 rounded-2xl px-3 py-3",
          "transition duration-200",
          "focus-visible:outline-none",
          "focus-visible:ring-4 focus-visible:ring-red-100",
          isActive
            ? "bg-red-50 text-red-700"
            : [
                "text-slate-600",
                "hover:bg-slate-50",
                "hover:text-slate-950",
              ].join(" "),
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              "grid h-10 w-10 shrink-0 place-items-center",
              "rounded-xl transition duration-200",
              isActive
                ? [
                    "bg-white text-red-600",
                    "shadow-sm ring-1 ring-red-100",
                  ].join(" ")
                : [
                    "bg-slate-100 text-slate-500",
                    "group-hover:bg-white",
                    "group-hover:text-red-600",
                    "group-hover:shadow-sm",
                  ].join(" "),
            ].join(" ")}
          >
            <Icon
              className="h-5 w-5"
              aria-hidden="true"
            />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">
              {label}
            </span>

            <span
              className={[
                "mt-0.5 block truncate text-[11px]",
                isActive
                  ? "text-red-500"
                  : "text-slate-400",
              ].join(" ")}
            >
              {description}
            </span>
          </span>

          {isActive && (
            <span
              className="h-2 w-2 shrink-0 rounded-full bg-red-600"
              aria-hidden="true"
            />
          )}
        </>
      )}
    </NavLink>
  );
}

function SupportCard({
  onNavigate,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-4 text-white shadow-lg">
      <div
        className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-500/20 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
            <BellRing
              className="h-4 w-4 text-red-300"
              aria-hidden="true"
            />
          </span>

          <p className="text-sm font-semibold text-white">
            Need attention?
          </p>
        </div>

        <p className="mt-3 text-xs leading-5 text-slate-300">
          Review platform alerts and pending
          coordination activity.
        </p>

        <NavLink
          to="/admin/notifications"
          onClick={onNavigate}
          className={[
            "mt-4 inline-flex rounded-md text-xs font-semibold",
            "text-red-300 transition hover:text-red-200",
            "focus-visible:outline-none",
            "focus-visible:ring-2 focus-visible:ring-red-300",
          ].join(" ")}
        >
          View notifications
        </NavLink>
      </div>
    </div>
  );
}