import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";

function normalizeNotifications(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.notifications)) {
    return response.notifications;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.notifications)) {
    return response.data.notifications;
  }

  return [];
}

function getInitials(name) {
  const initials = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();

  return initials || "OA";
}

function getFirstName(name) {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)[0] || "Admin"
  );
}

function getRoleLabel(role) {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  const labels = {
    admin: "System Administrator",
    super_admin: "Super Administrator",
    donor: "Registered Donor",
    recipient: "Organ Recipient",
    hospital: "Hospital Representative",
  };

  return labels[normalizedRole] || "OrganAid Member";
}

export default function Navbar({
  onOpenSidebar,
  isSidebarOpen = false,
}) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const menuRef = useRef(null);
  const menuButtonRef = useRef(null);

  const [isProfileMenuOpen, setIsProfileMenuOpen] =
    useState(false);
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);
  const [unreadCount, setUnreadCount] =
    useState(0);
  const [
    isLoadingNotifications,
    setIsLoadingNotifications,
  ] = useState(true);

  const firstName = useMemo(
    () => getFirstName(user?.fullName),
    [user?.fullName]
  );

  const initials = useMemo(
    () => getInitials(user?.fullName),
    [user?.fullName]
  );

  const roleLabel = useMemo(
    () => getRoleLabel(user?.role),
    [user?.role]
  );

  useEffect(() => {
    let isMounted = true;

    async function loadUnreadNotifications() {
      try {
        setIsLoadingNotifications(true);

        const response =
          await notificationService.getUserNotifications();

        if (!isMounted) return;

        const notifications =
          normalizeNotifications(response);

        const count = notifications.filter(
          (notification) =>
            !notification.isRead
        ).length;

        setUnreadCount(count);
      } catch (error) {
        console.error(
          "Unable to load notifications:",
          error
        );

        if (isMounted) {
          setUnreadCount(0);
        }
      } finally {
        if (isMounted) {
          setIsLoadingNotifications(false);
        }
      }
    }

    loadUnreadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    }

    function handleEscapeKey(event) {
      if (
        event.key === "Escape" &&
        isProfileMenuOpen
      ) {
        setIsProfileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );
    document.addEventListener(
      "keydown",
      handleEscapeKey
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener(
        "keydown",
        handleEscapeKey
      );
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  async function handleSignOut() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error(
        "Unable to sign out:",
        error
      );
    } finally {
      setIsProfileMenuOpen(false);
      setIsLoggingOut(false);

      navigate("/login", {
        replace: true,
      });
    }
  }

  function toggleProfileMenu() {
    setIsProfileMenuOpen(
      (current) => !current
    );
  }

  const notificationLabel =
    isLoadingNotifications
      ? "Loading notifications"
      : unreadCount > 0
        ? `${unreadCount} unread notification${
            unreadCount === 1 ? "" : "s"
          }`
        : "No unread notifications";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenSidebar}
            className={[
              "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
              "border border-slate-200 text-slate-600",
              "transition hover:border-red-200 hover:bg-red-50 hover:text-red-600",
              "focus-visible:outline-none",
              "focus-visible:ring-4 focus-visible:ring-red-100",
              "lg:hidden",
            ].join(" ")}
            aria-label="Open admin navigation"
            aria-expanded={isSidebarOpen}
            aria-controls="admin-mobile-sidebar"
          >
            <Menu
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="hidden h-4 w-4 text-red-600 sm:block"
                aria-hidden="true"
              />

              <p className="truncate text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                Admin workspace
              </p>
            </div>

            <p className="mt-1 truncate text-sm font-semibold text-slate-800 sm:text-base">
              Welcome back, {firstName}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/admin/notifications"
            className={[
              "group relative grid h-11 w-11 place-items-center rounded-xl",
              "border border-transparent text-slate-500",
              "transition duration-200",
              "hover:border-slate-200 hover:bg-slate-50 hover:text-red-600",
              "focus-visible:outline-none",
              "focus-visible:ring-4 focus-visible:ring-red-100",
            ].join(" ")}
            aria-label={notificationLabel}
            title={notificationLabel}
          >
            <Bell
              className="h-5 w-5 transition-transform group-hover:-rotate-6"
              aria-hidden="true"
            />

            {!isLoadingNotifications &&
              unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}

            {isLoadingNotifications && (
              <span
                className="absolute right-2 top-2 h-2 w-2 animate-pulse rounded-full bg-slate-300"
                aria-hidden="true"
              />
            )}
          </Link>

          <div
            className="relative"
            ref={menuRef}
          >
            <button
              ref={menuButtonRef}
              type="button"
              onClick={toggleProfileMenu}
              className={[
                "flex items-center gap-2 rounded-xl",
                "border border-transparent p-1.5 text-left",
                "transition duration-200",
                "hover:border-slate-200 hover:bg-slate-50",
                "focus-visible:outline-none",
                "focus-visible:ring-4 focus-visible:ring-red-100",
              ].join(" ")}
              aria-expanded={isProfileMenuOpen}
              aria-haspopup="menu"
              aria-controls="admin-profile-menu"
            >
              <span className="hidden min-w-0 text-right md:block">
                <span className="block max-w-48 truncate text-sm font-semibold text-slate-900">
                  {user?.fullName ||
                    "OrganAid Admin"}
                </span>

                <span className="block max-w-48 truncate text-xs text-slate-500">
                  {roleLabel}
                </span>
              </span>

              <UserAvatar
                initials={initials}
                imageUrl={
                  user?.profileImage ||
                  user?.avatar
                }
                fullName={user?.fullName}
              />

              <ChevronDown
                className={[
                  "hidden h-4 w-4 text-slate-400 transition-transform duration-200 sm:block",
                  isProfileMenuOpen
                    ? "rotate-180"
                    : "",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>

            {isProfileMenuOpen && (
              <ProfileMenu
                user={user}
                initials={initials}
                roleLabel={roleLabel}
                isLoggingOut={
                  isLoggingOut
                }
                onSignOut={handleSignOut}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function ProfileMenu({
  user,
  initials,
  roleLabel,
  isLoggingOut,
  onSignOut,
}) {
  return (
    <div
      id="admin-profile-menu"
      role="menu"
      aria-label="Administrator account menu"
      className="absolute right-0 mt-3 w-[min(19rem,calc(100vw-2rem))] origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
    >
      <div className="rounded-xl bg-slate-50 px-3 py-3">
        <div className="flex items-center gap-3">
          <UserAvatar
            initials={initials}
            imageUrl={
              user?.profileImage ||
              user?.avatar
            }
            fullName={user?.fullName}
            size="large"
          />

          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900">
              {user?.fullName ||
                "OrganAid Admin"}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {user?.email ||
                "No email available"}
            </p>

            <span className="mt-2 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
              {roleLabel}
            </span>
          </div>
        </div>
      </div>

      <div className="my-2 border-t border-slate-100" />

      <MenuLink
        to="/admin/profile"
        icon={UserRound}
        label="My profile"
        description="View and update personal details"
      />

      <MenuLink
        to="/admin/settings"
        icon={Settings}
        label="Account settings"
        description="Security and preferences"
      />

      <div className="my-2 border-t border-slate-100" />

      <button
        type="button"
        onClick={onSignOut}
        disabled={isLoggingOut}
        role="menuitem"
        className={[
          "flex w-full items-center gap-3 rounded-xl px-3 py-3",
          "text-left text-sm font-semibold text-red-600",
          "transition hover:bg-red-50",
          "focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-red-100",
          "disabled:cursor-not-allowed disabled:opacity-60",
        ].join(" ")}
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-red-50">
          <LogOut
            className="h-4 w-4"
            aria-hidden="true"
          />
        </span>

        <span>
          <span className="block">
            {isLoggingOut
              ? "Signing out..."
              : "Sign out"}
          </span>

          <span className="mt-0.5 block text-xs font-normal text-red-400">
            End your current session
          </span>
        </span>
      </button>
    </div>
  );
}

function UserAvatar({
  initials,
  imageUrl,
  fullName,
  size = "default",
}) {
  const dimensions =
    size === "large"
      ? "h-12 w-12 text-base"
      : "h-10 w-10 text-sm";

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${fullName || "User"} profile`}
        className={`${dimensions} shrink-0 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200`}
      />
    );
  }

  return (
    <span
      className={[
        dimensions,
        "grid shrink-0 place-items-center rounded-full",
        "bg-gradient-to-br from-red-500 to-red-700",
        "font-bold text-white shadow-sm ring-2 ring-red-100",
      ].join(" ")}
      aria-label={`${fullName || "User"} initials`}
    >
      {initials}
    </span>
  );
}

function MenuLink({
  to,
  icon: Icon,
  label,
  description,
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      className={[
        "group flex items-center gap-3 rounded-xl px-3 py-3",
        "transition hover:bg-slate-50",
        "focus-visible:outline-none",
        "focus-visible:ring-2 focus-visible:ring-red-100",
      ].join(" ")}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-red-50 group-hover:text-red-600">
        <Icon
          className="h-4 w-4"
          aria-hidden="true"
        />
      </span>

      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-800">
          {label}
        </span>

        <span className="mt-0.5 block truncate text-xs text-slate-500">
          {description}
        </span>
      </span>
    </Link>
  );
}