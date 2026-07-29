import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Bell,
  ChevronDown,
  FileHeart,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import notificationService from "../../services/notificationService";

/* =====================================================
   Role configuration
===================================================== */

const roleConfig = {
  donor: {
    label: "Donor",
    home: "/donor/dashboard",
    description: "Manage your donor profile and availability",
    navigation: [
      {
        id: "overview",
        label: "Overview",
        description: "Dashboard summary",
        icon: LayoutDashboard,
        section: null,
      },
      {
        id: "profile",
        label: "My profile",
        description: "Donation and medical details",
        icon: UserRound,
        section: "profile",
      },
      {
        id: "medical-records",
        label: "Medical records",
        description: "Reports and documents",
        icon: FileHeart,
        section: "medical-records",
      },
      {
        id: "notifications",
        label: "Notifications",
        description: "Updates and alerts",
        icon: Bell,
        section: "notifications",
      },
    ],
  },

  recipient: {
    label: "Recipient",
    home: "/recipient/dashboard",
    description: "Track requests and medical coordination",
    navigation: [
      {
        id: "overview",
        label: "Overview",
        description: "Dashboard summary",
        icon: LayoutDashboard,
        section: null,
      },
      {
        id: "profile",
        label: "My profile",
        description: "Medical and contact details",
        icon: UserRound,
        section: "profile",
      },
      {
        id: "notifications",
        label: "Notifications",
        description: "Updates and alerts",
        icon: Bell,
        section: "notifications",
      },
    ],
  },

  hospital: {
    label: "Hospital",
    home: "/hospital/dashboard",
    description: "Coordinate donors, recipients, and care teams",
    navigation: [
      {
        id: "overview",
        label: "Overview",
        description: "Hospital workspace summary",
        icon: LayoutDashboard,
        section: null,
      },
      {
        id: "profile",
        label: "Hospital profile",
        description: "Registration and contact details",
        icon: UserRound,
        section: "profile",
      },
    ],
  },
};

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function getRoleConfiguration(role) {
  return (
    roleConfig[normalizeRole(role)] || {
      label: "Member",
      home: "/",
      description: "Manage your OrganAid account",
      navigation: [
        {
          id: "overview",
          label: "Overview",
          description: "Account summary",
          icon: LayoutDashboard,
          section: null,
        },
      ],
    }
  );
}

/* =====================================================
   Response helpers
===================================================== */

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

function getInitials(name, fallback = "OA") {
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

function getFirstName(name, fallback = "Member") {
  return (
    String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean)[0] || fallback
  );
}

/* =====================================================
   Main dashboard shell
===================================================== */

export default function DashboardShell({
  title = "Dashboard",
  subtitle = "",
  children,
}) {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const profileMenuRef = useRef(null);
  const profileButtonRef = useRef(null);
  const mobileCloseButtonRef = useRef(null);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] =
    useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [isLoadingNotifications, setIsLoadingNotifications] =
    useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const role = useMemo(
    () => getRoleConfiguration(user?.role),
    [user?.role]
  );

  const firstName = useMemo(
    () => getFirstName(user?.fullName),
    [user?.fullName]
  );

  const initials = useMemo(
    () => getInitials(user?.fullName),
    [user?.fullName]
  );

  const activeSection = useMemo(() => {
    return location.hash.replace("#", "") || "overview";
  }, [location.hash]);

  const notificationHref = useMemo(() => {
    const notificationItem = role.navigation.find(
      (item) => item.id === "notifications"
    );

    if (!notificationItem) {
      return role.home;
    }

    return `${role.home}#${notificationItem.section}`;
  }, [role]);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      try {
        setIsLoadingNotifications(true);

        const response =
          await notificationService.getUserNotifications();

        if (!isMounted) return;

        const notifications =
          normalizeNotifications(response);

        setUnreadCount(
          notifications.filter(
            (notification) =>
              !notification.isRead
          ).length
        );
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

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key !== "Escape") return;

      if (isProfileOpen) {
        setIsProfileOpen(false);
        profileButtonRef.current?.focus();
      }

      if (isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    isProfileOpen,
    isMobileSidebarOpen,
  ]);

  useEffect(() => {
    setIsProfileOpen(false);
    setIsMobileSidebarOpen(false);
  }, [
    location.pathname,
    location.hash,
  ]);

  useEffect(() => {
    if (!isMobileSidebarOpen) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      mobileCloseButtonRef.current?.focus();
    }, 150);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow =
        previousOverflow;
    };
  }, [isMobileSidebarOpen]);

  async function handleSignOut() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("Unable to sign out:", error);
    } finally {
      setIsProfileOpen(false);
      setIsMobileSidebarOpen(false);
      setIsLoggingOut(false);

      navigate("/login", {
        replace: true,
      });
    }
  }

  function openMobileSidebar() {
    setIsProfileOpen(false);
    setIsMobileSidebarOpen(true);
  }

  function closeMobileSidebar() {
    setIsMobileSidebarOpen(false);
  }

  function toggleProfileMenu() {
    setIsProfileOpen((current) => !current);
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <DesktopSidebar
        role={role}
        activeSection={activeSection}
      />

      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        role={role}
        activeSection={activeSection}
        close={closeMobileSidebar}
        closeButtonRef={mobileCloseButtonRef}
      />

      <div className="lg:pl-72">
        <DashboardHeader
          user={user}
          role={role}
          firstName={firstName}
          initials={initials}
          isProfileOpen={isProfileOpen}
          isLoggingOut={isLoggingOut}
          isLoadingNotifications={
            isLoadingNotifications
          }
          unreadCount={unreadCount}
          notificationHref={notificationHref}
          notificationLabel={notificationLabel}
          profileMenuRef={profileMenuRef}
          profileButtonRef={profileButtonRef}
          openMobileSidebar={
            openMobileSidebar
          }
          toggleProfileMenu={
            toggleProfileMenu
          }
          onSignOut={handleSignOut}
        />

        <main
          id="main-dashboard-content"
          className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-8 lg:px-8"
        >
          <PageHeading
            role={role}
            title={title}
            subtitle={subtitle}
          />

          {children}
        </main>
      </div>
    </div>
  );
}

/* =====================================================
   Header
===================================================== */

function DashboardHeader({
  user,
  role,
  firstName,
  initials,
  isProfileOpen,
  isLoggingOut,
  isLoadingNotifications,
  unreadCount,
  notificationHref,
  notificationLabel,
  profileMenuRef,
  profileButtonRef,
  openMobileSidebar,
  toggleProfileMenu,
  onSignOut,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={openMobileSidebar}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 lg:hidden"
            aria-label="Open dashboard navigation"
            aria-expanded={false}
            aria-controls="mobile-dashboard-sidebar"
          >
            <Menu
              className="h-5 w-5"
              aria-hidden="true"
            />
          </button>

          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl font-extrabold tracking-[0.14em] text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 lg:hidden"
            aria-label="OrganAid homepage"
          >
            <HeartPulse
              className="h-6 w-6 text-red-600"
              aria-hidden="true"
            />

            <span className="hidden sm:inline">
              ORGANAID
            </span>
          </Link>

          <div className="hidden min-w-0 lg:block">
            <p className="truncate text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              {role.label} workspace
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
              Welcome back, {firstName}
            </p>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <a
            href={notificationHref}
            className="relative grid h-11 w-11 place-items-center rounded-xl border border-transparent text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
            aria-label={notificationLabel}
            title={notificationLabel}
          >
            <Bell
              className="h-5 w-5"
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
          </a>

          <div
            className="relative"
            ref={profileMenuRef}
          >
            <button
              ref={profileButtonRef}
              type="button"
              onClick={toggleProfileMenu}
              className="flex items-center gap-2 rounded-xl border border-transparent p-1.5 text-left transition hover:border-slate-200 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
              aria-controls="member-profile-menu"
            >
              <span className="hidden min-w-0 text-right md:block">
                <span className="block max-w-48 truncate text-sm font-semibold text-slate-900">
                  {user?.fullName ||
                    "OrganAid Member"}
                </span>

                <span className="block max-w-48 truncate text-xs text-slate-500">
                  {role.label}
                </span>
              </span>

              <UserAvatar
                user={user}
                initials={initials}
              />

              <ChevronDown
                className={[
                  "hidden h-4 w-4 text-slate-400 transition-transform duration-200 sm:block",
                  isProfileOpen
                    ? "rotate-180"
                    : "",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>

            {isProfileOpen && (
              <ProfileMenu
                user={user}
                role={role}
                isLoggingOut={
                  isLoggingOut
                }
                onSignOut={onSignOut}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

/* =====================================================
   Desktop sidebar
===================================================== */

function DesktopSidebar({
  role,
  activeSection,
}) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-slate-200/80 bg-white lg:flex">
      <SidebarContent
        role={role}
        activeSection={activeSection}
      />
    </aside>
  );
}

/* =====================================================
   Mobile sidebar
===================================================== */

function MobileSidebar({
  isOpen,
  role,
  activeSection,
  close,
  closeButtonRef,
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
        onClick={close}
        className={[
          "absolute inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300",
          isOpen
            ? "opacity-100"
            : "opacity-0",
        ].join(" ")}
        aria-label="Close dashboard navigation"
        tabIndex={isOpen ? 0 : -1}
      />

      <aside
        id="mobile-dashboard-sidebar"
        className={[
          "relative flex h-full w-[min(18rem,88vw)] flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out",
          isOpen
            ? "translate-x-0"
            : "-translate-x-full",
        ].join(" ")}
        aria-label={`${role.label} dashboard navigation`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={close}
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-xl text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
          aria-label="Close dashboard navigation"
          tabIndex={isOpen ? 0 : -1}
        >
          <X
            className="h-5 w-5"
            aria-hidden="true"
          />
        </button>

        <SidebarContent
          role={role}
          activeSection={activeSection}
          onNavigate={close}
        />
      </aside>
    </div>
  );
}

/* =====================================================
   Sidebar content
===================================================== */

function SidebarContent({
  role,
  activeSection,
  onNavigate,
}) {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-5 py-6">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-2xl px-2 py-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
        aria-label="OrganAid homepage"
      >
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-200">
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
            {role.description}
          </span>
        </span>
      </Link>

      <p className="mt-10 px-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        Workspace
      </p>

      <nav
        className="mt-3 space-y-1.5"
        aria-label={`${role.label} dashboard navigation`}
      >
        {role.navigation.map((item) => (
          <DashboardNavigationItem
            key={item.id}
            item={item}
            home={role.home}
            isActive={
              activeSection === item.id
            }
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="mt-auto pt-8">
        <div className="rounded-2xl bg-slate-950 p-4 text-white shadow-lg">
          <p className="text-sm font-semibold text-white">
            Keep your information current
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-300">
            Accurate profile and medical information
            helps authorized care teams coordinate
            safely and efficiently.
          </p>

          <a
            href={`${role.home}#profile`}
            onClick={onNavigate}
            className="mt-4 inline-flex rounded-md text-xs font-semibold text-red-300 transition hover:text-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            Review my profile
          </a>
        </div>
      </div>
    </div>
  );
}

/* =====================================================
   Navigation item
===================================================== */

function DashboardNavigationItem({
  item,
  home,
  isActive,
  onNavigate,
}) {
  const {
    label,
    description,
    icon: Icon,
    section,
  } = item;

  const baseClasses =
    "group flex items-center gap-3 rounded-2xl px-3 py-3 transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100";

  const activeClasses =
    "bg-red-50 text-red-700";

  const inactiveClasses =
    "text-slate-600 hover:bg-slate-50 hover:text-slate-950";

  const content = (
    <>
      <span
        className={[
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl transition",
          isActive
            ? "bg-red-100 text-red-600"
            : "bg-slate-100 text-slate-500 group-hover:bg-red-50 group-hover:text-red-600",
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
  );

  if (!section) {
    return (
      <NavLink
        to={home}
        end
        onClick={onNavigate}
        className={({ isActive: routeIsActive }) =>
          [
            baseClasses,
            routeIsActive &&
            !window.location.hash
              ? activeClasses
              : inactiveClasses,
          ].join(" ")
        }
      >
        {content}
      </NavLink>
    );
  }

  return (
    <a
      href={`${home}#${section}`}
      onClick={onNavigate}
      className={[
        baseClasses,
        isActive
          ? activeClasses
          : inactiveClasses,
      ].join(" ")}
      aria-current={
        isActive ? "location" : undefined
      }
    >
      {content}
    </a>
  );
}

/* =====================================================
   Page heading
===================================================== */

function PageHeading({
  role,
  title,
  subtitle,
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <nav
          className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-400"
          aria-label="Breadcrumb"
        >
          <span>{role.label}</span>

          <span aria-hidden="true">/</span>

          <span
            className="text-red-600"
            aria-current="page"
          >
            {title}
          </span>
        </nav>

        <p className="text-sm font-semibold text-red-600">
          OrganAid portal
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            {subtitle}
          </p>
        )}
      </div>

      <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-500 shadow-sm sm:flex">
        <ShieldCheck
          className="h-4 w-4 text-emerald-600"
          aria-hidden="true"
        />

        Secure workspace
      </div>
    </div>
  );
}

/* =====================================================
   User avatar
===================================================== */

function UserAvatar({
  user,
  initials,
}) {
  const imageUrl =
    user?.profileImage || user?.avatar;

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={`${
          user?.fullName || "User"
        } profile`}
        className="h-10 w-10 shrink-0 rounded-full border-2 border-white object-cover shadow-sm ring-1 ring-slate-200"
        onError={(event) => {
          event.currentTarget.style.display =
            "none";
        }}
      />
    );
  }

  return (
    <span
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-sm font-bold text-white shadow-sm ring-2 ring-red-100"
      aria-label={`${
        user?.fullName || "User"
      } initials`}
    >
      {initials}
    </span>
  );
}

/* =====================================================
   Profile dropdown
===================================================== */

function ProfileMenu({
  user,
  role,
  isLoggingOut,
  onSignOut,
}) {
  const profileNavigation =
    role.navigation.find(
      (item) => item.id === "profile"
    );

  const notificationNavigation =
    role.navigation.find(
      (item) => item.id === "notifications"
    );

  return (
    <div
      id="member-profile-menu"
      role="menu"
      aria-label="Member account menu"
      className="absolute right-0 mt-3 w-[min(19rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
    >
      <div className="rounded-xl bg-slate-50 px-3 py-3">
        <p className="truncate text-sm font-bold text-slate-900">
          {user?.fullName ||
            "OrganAid Member"}
        </p>

        <p className="mt-1 truncate text-xs text-slate-500">
          {user?.email ||
            "No email available"}
        </p>

        <span className="mt-2 inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700">
          {role.label}
        </span>
      </div>

      <div className="my-2 border-t border-slate-100" />

      {profileNavigation && (
        <ProfileMenuLink
          href={`${role.home}#${profileNavigation.section}`}
          icon={UserRound}
          label="My profile"
        />
      )}

      {notificationNavigation && (
        <ProfileMenuLink
          href={`${role.home}#${notificationNavigation.section}`}
          icon={Bell}
          label="Notifications"
        />
      )}

      <div className="my-2 border-t border-slate-100" />

      <button
        type="button"
        onClick={onSignOut}
        disabled={isLoggingOut}
        role="menuitem"
        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-red-50">
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

function ProfileMenuLink({
  href,
  icon: Icon,
  label,
}) {
  return (
    <a
      href={href}
      role="menuitem"
      className="group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-500 transition group-hover:bg-red-50 group-hover:text-red-600">
        <Icon
          className="h-4 w-4"
          aria-hidden="true"
        />
      </span>

      {label}
    </a>
  );
}
