import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  HeartPulse,
  LogOut,
  Menu,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";
import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

const primaryLinks = [
  {
    path: "/",
    label: "Home",
    end: true,
  },
  {
    path: "/about",
    label: "About",
  },
  {
    path: "/how-it-works",
    label: "How It Works",
  },
  {
    path: "/faq",
    label: "FAQ",
  },
  {
    path: "/contact",
    label: "Contact",
  },
];

const roleRoutes = {
  donor: "/donor/dashboard",
  recipient: "/recipient/dashboard",
  hospital: "/hospital/dashboard",
  admin: "/admin/dashboard",
  super_admin: "/admin/dashboard",
};

function getRoleHome(role) {
  return roleRoutes[String(role || "").toLowerCase()] || "/";
}

export default function PublicNav() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const accountMenuRef = useRef(null);

  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] =
    useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const dashboardPath = useMemo(
    () => getRoleHome(user?.role),
    [user?.role]
  );

  const firstName = useMemo(() => {
    return user?.fullName?.trim().split(/\s+/)[0] || "Member";
  }, [user?.fullName]);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setIsAccountMenuOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsAccountMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileMenuOpen]);

  async function handleLogout() {
    if (isLoggingOut) return;

    try {
      setIsLoggingOut(true);
      await logout();

      setIsMobileMenuOpen(false);
      setIsAccountMenuOpen(false);

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header
      className={[
        "sticky top-0 z-50 border-b transition-all duration-300",
        isScrolled
          ? "border-slate-200/90 bg-white/95 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-white/85 backdrop-blur-lg",
      ].join(" ")}
    >
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Brand />

        <DesktopNavigation />

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <AuthenticatedActions
              user={user}
              firstName={firstName}
              dashboardPath={dashboardPath}
              isOpen={isAccountMenuOpen}
              setIsOpen={setIsAccountMenuOpen}
              isLoggingOut={isLoggingOut}
              onLogout={handleLogout}
              menuRef={accountMenuRef}
            />
          ) : (
            <GuestActions />
          )}
        </div>

        <button
          type="button"
          onClick={() =>
            setIsMobileMenuOpen((current) => !current)
          }
          className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 lg:hidden"
          aria-label={
            isMobileMenuOpen
              ? "Close navigation menu"
              : "Open navigation menu"
          }
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <MobileNavigation
        isOpen={isMobileMenuOpen}
        closeMenu={() => setIsMobileMenuOpen(false)}
        user={user}
        dashboardPath={dashboardPath}
        isLoggingOut={isLoggingOut}
        onLogout={handleLogout}
      />
    </header>
  );
}

function Brand() {
  return (
    <NavLink
      to="/"
      className="group flex shrink-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
      aria-label="OrganAid homepage"
    >
      <span className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 text-white shadow-md shadow-red-200 transition-transform duration-200 group-hover:scale-105">
        <HeartPulse className="h-5 w-5" aria-hidden="true" />

        <span
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500"
          aria-hidden="true"
        />
      </span>

      <span>
        <span className="block text-lg font-black tracking-[0.14em] text-slate-950 sm:text-xl">
          ORGANAID
        </span>

        <span className="hidden text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400 sm:block">
          Connecting lives
        </span>
      </span>
    </NavLink>
  );
}

function DesktopNavigation() {
  return (
    <nav
      className="hidden items-center gap-1 lg:flex"
      aria-label="Primary navigation"
    >
      {primaryLinks.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          end={link.end}
          className={({ isActive }) =>
            [
              "relative rounded-xl px-3.5 py-2.5 text-sm font-semibold transition duration-200",
              "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
              isActive
                ? "bg-red-50 text-red-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-950",
            ].join(" ")
          }
        >
          {({ isActive }) => (
            <>
              {link.label}

              <span
                className={[
                  "absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-red-600 transition-transform duration-200",
                  isActive ? "scale-x-100" : "scale-x-0",
                ].join(" ")}
                aria-hidden="true"
              />
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

function GuestActions() {
  return (
    <>
      <NavLink
        to="/login"
        className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
      >
        Log in
      </NavLink>

      <NavLink
        to="/register"
        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-sm shadow-red-200 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
      >
        Register now
      </NavLink>
    </>
  );
}

function AuthenticatedActions({
  user,
  firstName,
  dashboardPath,
  isOpen,
  setIsOpen,
  isLoggingOut,
  onLogout,
  menuRef,
}) {
  return (
    <>
      <NavLink
        to={dashboardPath}
        className="inline-flex min-h-10 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white shadow-sm shadow-red-200 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
      >
        Dashboard
      </NavLink>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
          aria-expanded={isOpen}
          aria-haspopup="menu"
          aria-controls="public-account-menu"
        >
          <UserRound
            className="h-4 w-4 text-slate-500"
            aria-hidden="true"
          />

          <span className="max-w-24 truncate">
            {firstName}
          </span>

          <ChevronDown
            className={[
              "h-4 w-4 text-slate-400 transition-transform",
              isOpen ? "rotate-180" : "",
            ].join(" ")}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            id="public-account-menu"
            role="menu"
            className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.16)]"
          >
            <div className="rounded-xl bg-slate-50 px-3 py-3">
              <p className="truncate text-sm font-bold text-slate-900">
                {user?.fullName || "OrganAid Member"}
              </p>

              <p className="mt-1 truncate text-xs text-slate-500">
                {user?.email || "Signed-in account"}
              </p>
            </div>

            <NavLink
              to={dashboardPath}
              role="menuitem"
              className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-100"
            >
              <ShieldCheck
                className="h-4 w-4 text-red-600"
                aria-hidden="true"
              />

              Open dashboard
            </NavLink>

            <button
              type="button"
              role="menuitem"
              onClick={onLogout}
              disabled={isLoggingOut}
              className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />

              {isLoggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function MobileNavigation({
  isOpen,
  closeMenu,
  user,
  dashboardPath,
  isLoggingOut,
  onLogout,
}) {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={closeMenu}
        className="fixed inset-0 top-16 z-40 bg-slate-950/35 backdrop-blur-sm"
        aria-label="Close navigation menu"
      />

      <div
        id="mobile-navigation"
        className="relative z-50 border-t border-slate-200 bg-white shadow-xl"
      >
        <div className="mx-auto max-h-[calc(100vh-4rem)] max-w-7xl overflow-y-auto px-4 py-5 sm:px-6">
          <nav
            className="space-y-1"
            aria-label="Mobile navigation"
          >
            {primaryLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                onClick={closeMenu}
                className={({ isActive }) =>
                  [
                    "flex min-h-11 items-center rounded-xl px-4 text-sm font-semibold transition",
                    "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
                    isActive
                      ? "bg-red-50 text-red-700"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="my-5 border-t border-slate-200" />

          {user ? (
            <div className="space-y-3">
              <NavLink
                to={dashboardPath}
                onClick={closeMenu}
                className="flex min-h-11 w-full items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
              >
                Open dashboard
              </NavLink>

              <button
                type="button"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />

                {isLoggingOut ? "Signing out..." : "Sign out"}
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <NavLink
                to="/login"
                onClick={closeMenu}
                className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
              >
                Log in
              </NavLink>

              <NavLink
                to="/register"
                onClick={closeMenu}
                className="flex min-h-11 items-center justify-center rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
              >
                Register now
              </NavLink>
            </div>
          )}

          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 border-t border-slate-100 pt-4">
            <NavLink
              to="/privacy"
              onClick={closeMenu}
              className="text-xs font-medium text-slate-500 transition hover:text-red-600"
            >
              Privacy Policy
            </NavLink>

            <NavLink
              to="/terms"
              onClick={closeMenu}
              className="text-xs font-medium text-slate-500 transition hover:text-red-600"
            >
              Terms of Service
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
}