import { lazy, Suspense } from "react";
import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

/* =====================================================
   Layouts
===================================================== */

import PublicLayout from "../layouts/PublicLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AdminLayout from "../layouts/AdminLayout";

/* =====================================================
   Route Protection
===================================================== */

import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

/* =====================================================
   Public Pages
===================================================== */

const Home = lazy(() =>
  import("../pages/public/Home")
);

const About = lazy(() =>
  import("../pages/public/About")
);

const HowItWorks = lazy(() =>
  import("../pages/public/HowItWorks")
);

const Contact = lazy(() =>
  import("../pages/public/Contact")
);

const FAQ = lazy(() =>
  import("../pages/public/FAQ")
);

const Privacy = lazy(() =>
  import("../pages/public/Privacy")
);

const Terms = lazy(() =>
  import("../pages/public/Terms")
);

/* =====================================================
   Authentication Pages
===================================================== */

const Login = lazy(() =>
  import("../pages/auth/Login")
);

const Register = lazy(() =>
  import("../pages/auth/Register")
);

const ForgotPassword = lazy(() =>
  import("../pages/auth/ForgotPassword")
);

const AdminLogin = lazy(() =>
  import("../pages/auth/AdminLogin")
);

/* =====================================================
   Donor Pages
===================================================== */

const DonorDashboard = lazy(() =>
  import("../pages/donor/DonorDashboard")
);

/*
 * Add these imports when the pages exist.
 *
 * const DonorProfile = lazy(() =>
 *   import("../pages/donor/DonorProfile")
 * );
 *
 * const DonorReports = lazy(() =>
 *   import("../pages/donor/DonorReports")
 * );
 *
 * const DonorNotifications = lazy(() =>
 *   import("../pages/donor/DonorNotifications")
 * );
 */

/* =====================================================
   Recipient Pages
===================================================== */

const RecipientDashboard = lazy(() =>
  import("../pages/recipient/RecipientDashboard")
);

/*
 * Add these imports when the pages exist.
 *
 * const RecipientProfile = lazy(() =>
 *   import("../pages/recipient/RecipientProfile")
 * );
 *
 * const RecipientRequests = lazy(() =>
 *   import("../pages/recipient/RecipientRequests")
 * );
 *
 * const RecipientNotifications = lazy(() =>
 *   import("../pages/recipient/RecipientNotifications")
 * );
 */

/* =====================================================
   Hospital Pages
===================================================== */

const HospitalDashboard = lazy(() =>
  import("../pages/hospital/HospitalDashboard")
);

/*
 * Add these imports when the pages exist.
 *
 * const HospitalProfile = lazy(() =>
 *   import("../pages/hospital/HospitalProfile")
 * );
 *
 * const HospitalRequests = lazy(() =>
 *   import("../pages/hospital/HospitalRequests")
 * );
 *
 * const HospitalNotifications = lazy(() =>
 *   import("../pages/hospital/HospitalNotifications")
 * );
 */

/* =====================================================
   Admin Pages
===================================================== */

const AdminDashboard = lazy(() =>
  import("../pages/admin/AdminDashboard")
);

const UserManagement = lazy(() =>
  import("../components/admin/UserManagement")
);

const Requests = lazy(() =>
  import("../pages/admin/Requests")
);

const Notifications = lazy(() =>
  import("../pages/admin/Notifications")
);

/*
 * AccountPage.jsx exports Profile and Settings
 * as named exports.
 */

const Profile = lazy(() =>
  import("../pages/admin/AccountPage").then(
    (module) => ({
      default: module.Profile,
    })
  )
);

const Settings = lazy(() =>
  import("../pages/admin/AccountPage").then(
    (module) => ({
      default: module.Settings,
    })
  )
);

/* =====================================================
   System Pages
===================================================== */

const NotFound = lazy(() =>
  import("../pages/NotFound")
);

const Unauthorized = lazy(() =>
  import("../pages/Unauthorized")
);

/* =====================================================
   Full Page Loader
===================================================== */

function PageLoader() {
  return (
    <main
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading OrganAid"
    >
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div
          className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-red-600"
          aria-hidden="true"
        />

        <p className="mt-6 font-semibold text-slate-900">
          Loading OrganAid
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Please wait a moment...
        </p>
      </div>
    </main>
  );
}

/* =====================================================
   Application Routes
===================================================== */

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* =================================================
            Public Website
        ================================================== */}

        <Route element={<PublicLayout />}>
          <Route
            index
            element={<Home />}
          />

          <Route
            path="about"
            element={<About />}
          />

          <Route
            path="how-it-works"
            element={<HowItWorks />}
          />

          <Route
            path="contact"
            element={<Contact />}
          />

          <Route
            path="faq"
            element={<FAQ />}
          />

          <Route
            path="privacy"
            element={<Privacy />}
          />

          <Route
            path="terms"
            element={<Terms />}
          />
        </Route>

        {/* =================================================
            Authentication
        ================================================== */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        {/* Registration aliases */}

        <Route
          path="/signup"
          element={
            <Navigate
              to="/register"
              replace
            />
          }
        />

        <Route
          path="/sign-up"
          element={
            <Navigate
              to="/register"
              replace
            />
          }
        />

        {/* =================================================
            Donor Routes
        ================================================== */}

        <Route
          path="/donor"
          element={
            <ProtectedRoute role="donor">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Navigate
                to="dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<DonorDashboard />}
          />

          {/*
          Add these routes after creating the pages.

          <Route
            path="profile"
            element={<DonorProfile />}
          />

          <Route
            path="reports"
            element={<DonorReports />}
          />

          <Route
            path="notifications"
            element={<DonorNotifications />}
          />
          */}
        </Route>

        {/* =================================================
            Recipient Routes
        ================================================== */}

        <Route
          path="/recipient"
          element={
            <ProtectedRoute role="recipient">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Navigate
                to="dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<RecipientDashboard />}
          />

          {/*
          Add these routes after creating the pages.

          <Route
            path="profile"
            element={<RecipientProfile />}
          />

          <Route
            path="requests"
            element={<RecipientRequests />}
          />

          <Route
            path="notifications"
            element={<RecipientNotifications />}
          />
          */}
        </Route>

        {/* =================================================
            Hospital Routes
        ================================================== */}

        <Route
          path="/hospital"
          element={
            <ProtectedRoute role="hospital">
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <Navigate
                to="dashboard"
                replace
              />
            }
          />

          <Route
            path="dashboard"
            element={<HospitalDashboard />}
          />

          {/*
          Add these routes after creating the pages.

          <Route
            path="profile"
            element={<HospitalProfile />}
          />

          <Route
            path="requests"
            element={<HospitalRequests />}
          />

          <Route
            path="notifications"
            element={<HospitalNotifications />}
          />
          */}
        </Route>

        {/* =================================================
            Admin Routes
        ================================================== */}

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<AdminLayout />}
          >
            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="users"
              element={<UserManagement />}
            />

            <Route
              path="requests"
              element={<Requests />}
            />

            <Route
              path="notifications"
              element={<Notifications />}
            />

            <Route
              path="profile"
              element={<Profile />}
            />

            <Route
              path="settings"
              element={<Settings />}
            />
          </Route>
        </Route>

        {/* =================================================
            Legacy Admin URL Redirects
        ================================================== */}

        <Route
          path="/dashboard"
          element={
            <Navigate
              to="/admin/dashboard"
              replace
            />
          }
        />

        <Route
          path="/users"
          element={
            <Navigate
              to="/admin/users"
              replace
            />
          }
        />

        <Route
          path="/requests"
          element={
            <Navigate
              to="/admin/requests"
              replace
            />
          }
        />

        <Route
          path="/notifications"
          element={
            <Navigate
              to="/admin/notifications"
              replace
            />
          }
        />

        <Route
          path="/profile"
          element={
            <Navigate
              to="/admin/profile"
              replace
            />
          }
        />

        <Route
          path="/settings"
          element={
            <Navigate
              to="/admin/settings"
              replace
            />
          }
        />

        {/* =================================================
            System Pages
        ================================================== */}

        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </Suspense>
  );
}