import { useMemo, useState } from "react";
import {
  HeartPulse,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { toast } from "sonner";

import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/Alert";

import { useAuth } from "../../context/AuthContext";

const roleRoutes = {
  admin: "/admin/dashboard",
  super_admin: "/admin/dashboard",
  donor: "/donor/dashboard",
  recipient: "/recipient/dashboard",
  hospital: "/hospital/dashboard",
};

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function getDashboardPath(role) {
  return roleRoutes[normalizeRole(role)] || "/";
}

function normalizeUser(response) {
  return (
    response?.user ||
    response?.data?.user ||
    response?.data ||
    null
  );
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function Login() {
  const {
    user,
    loading,
    login,
    refreshUser,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestedPath = useMemo(() => {
    const path = location.state?.from?.pathname;

    return typeof path === "string" ? path : "";
  }, [location.state]);

  if (loading) {
    return <LoginSkeleton />;
  }

  if (user) {
    return (
      <Navigate
        to={getDashboardPath(user.role)}
        replace
      />
    );
  }

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));

    if (errors[key]) {
      setErrors((current) => ({
        ...current,
        [key]: "",
      }));
    }

    if (serverError) {
      setServerError("");
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 6) {
      nextErrors.password =
        "Password must contain at least 6 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError("");

      const response = await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      let authenticatedUser = normalizeUser(response);

      if (!authenticatedUser && refreshUser) {
        authenticatedUser = await refreshUser();
      }

      if (!authenticatedUser) {
        throw new Error(
          "Signed-in user information was not returned."
        );
      }

      const dashboardPath = getDashboardPath(
        authenticatedUser.role
      );

      const redirectPath =
        requestedPath &&
        requestedPath !== "/login" &&
        requestedPath !== "/register"
          ? requestedPath
          : dashboardPath;

      toast.success(
        `Welcome back${
          authenticatedUser.fullName
            ? `, ${
                authenticatedUser.fullName
                  .trim()
                  .split(/\s+/)[0]
              }`
            : ""
        }.`
      );

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to sign in with those credentials."
      );

      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFrame
      title="Welcome back"
      subtitle="Sign in to manage your OrganAid profile, requests, verification activity, and healthcare coordination."
    >
      {serverError && (
        <Alert
          variant="destructive"
          className="mb-6"
        >
          <AlertTitle>Sign-in failed</AlertTitle>

          <AlertDescription>
            {serverError}
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        noValidate
      >
        <FormField
          label="Email address"
          name="email"
          type="email"
          required
          value={form.email}
          error={errors.email}
          leftIcon={Mail}
          autoComplete="email"
          disabled={isSubmitting}
          placeholder="you@example.com"
          onChange={(event) =>
            updateField("email", event.target.value)
          }
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          required
          value={form.password}
          error={errors.password}
          leftIcon={LockKeyhole}
          showPasswordToggle
          autoComplete="current-password"
          disabled={isSubmitting}
          placeholder="Enter your password"
          labelAction={
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-red-600 transition hover:text-red-700"
            >
              Forgot password?
            </Link>
          }
          onChange={(event) =>
            updateField("password", event.target.value)
          }
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          leftIcon={ShieldCheck}
          loading={isSubmitting}
          loadingText="Signing in securely..."
        >
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        New to OrganAid?{" "}
        <Link
          to="/register"
          className="font-semibold text-red-600 transition hover:text-red-700"
        >
          Create an account
        </Link>
      </p>
    </AuthFrame>
  );
}

export function AuthFrame({
  title,
  subtitle,
  children,
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 sm:px-6 sm:py-14">
      <div
        className="absolute -left-28 top-0 h-80 w-80 rounded-full bg-red-200/40 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-blue-200/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.16)] lg:grid-cols-[0.95fr_1.05fr]">
        <aside className="hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300/30"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-600 shadow-lg shadow-red-950/40">
                <HeartPulse
                  className="h-7 w-7"
                  aria-hidden="true"
                />
              </span>

              <span>
                <span className="block text-2xl font-black tracking-[0.16em]">
                  ORGANAID
                </span>

                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Connecting lives
                </span>
              </span>
            </Link>

            <h1 className="mt-14 max-w-md text-4xl font-bold tracking-tight">
              Secure healthcare coordination in one connected platform.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              OrganAid helps donors, recipients, hospitals, and
              administrators coordinate verification, medical
              information, requests, and care pathways safely.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
                aria-hidden="true"
              />

              <div>
                <p className="text-sm font-semibold text-white">
                  Protected access
                </p>

                <p className="mt-2 text-xs leading-6 text-slate-300">
                  Account access is role-based and intended only for
                  authorized OrganAid users.
                </p>
              </div>
            </div>
          </div>
        </aside>

        <section className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-red-600 transition hover:text-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100 lg:hidden"
            >
              <HeartPulse
                className="h-5 w-5"
                aria-hidden="true"
              />

              OrganAid
            </Link>

            <p className="mt-8 text-sm font-semibold text-red-600 lg:mt-0">
              Secure account access
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              {title}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {subtitle}
            </p>

            <div className="mt-8">
              {children}
            </div>

            <div className="mt-8 border-t border-slate-100 pt-5 text-center text-xs leading-5 text-slate-400">
              © {new Date().getFullYear()} OrganAid
              <br />
              Secure Organ Donation and Transplant Management Platform
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function LoginSkeleton() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
      role="status"
      aria-label="Loading sign-in page"
    >
      <div className="w-full max-w-md space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="h-14 w-14 animate-pulse rounded-2xl bg-slate-200" />

        <div className="space-y-3">
          <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
        </div>

        <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}