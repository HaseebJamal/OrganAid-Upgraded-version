import { useMemo, useState } from "react";
import {
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/Alert";

import { useAuth } from "../../context/AuthContext";
import { adminLogin } from "../../services/authService";

const initialForm = {
  email: "",
  password: "",
};

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function normalizeUser(response) {
  return (
    response?.user ||
    response?.data?.user ||
    response?.data ||
    response ||
    null
  );
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { refreshUser } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

  const redirectPath = useMemo(() => {
    const requestedPath = location.state?.from?.pathname;

    if (
      requestedPath &&
      requestedPath.startsWith("/admin")
    ) {
      return requestedPath;
    }

    return "/admin/dashboard";
  }, [location.state]);

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
      nextErrors.email = "Admin email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
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

      const response = await adminLogin({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      let authenticatedUser = normalizeUser(response);

      if (typeof refreshUser === "function") {
        authenticatedUser =
          (await refreshUser()) || authenticatedUser;
      }

      const role = normalizeRole(authenticatedUser?.role);

      if (!["admin", "super_admin"].includes(role)) {
        throw new Error(
          "This account does not have administrator access."
        );
      }

      toast.success("Welcome to the OrganAid admin portal.");

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-12 sm:px-6">
      <div
        className="absolute -left-32 top-10 h-80 w-80 rounded-full bg-red-600/20 blur-3xl"
        aria-hidden="true"
      />

      <div
        className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.45)] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600 shadow-lg shadow-red-950/40">
                <ShieldCheck
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </span>

              <div>
                <p className="text-xl font-black tracking-[0.16em]">
                  ORGANAID
                </p>

                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  Administration portal
                </p>
              </div>
            </div>

            <h1 className="mt-14 max-w-md text-4xl font-bold tracking-tight">
              Secure oversight for critical healthcare workflows.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Review users, hospitals, organ requests, verification
              activity, and platform-wide settings from one protected
              workspace.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-white">
              Restricted system
            </p>

            <p className="mt-2 text-xs leading-6 text-slate-300">
              Access is limited to authorized OrganAid administrators.
              Sign-in activity should be recorded in the platform audit
              log.
            </p>
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="mx-auto max-w-md">
            <div className="lg:hidden">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-100">
                <ShieldCheck
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </span>
            </div>

            <p className="mt-6 text-sm font-semibold text-red-600 lg:mt-0">
              Restricted access
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Admin sign in
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your administrator credentials to access the
              OrganAid control center.
            </p>

            {serverError && (
              <Alert
                variant="destructive"
                className="mt-6"
              >
                <AlertTitle>Sign-in failed</AlertTitle>

                <AlertDescription>
                  {serverError}
                </AlertDescription>
              </Alert>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-5"
              noValidate
            >
              <FormField
                label="Admin email"
                name="email"
                type="email"
                required
                autoComplete="username"
                value={form.email}
                error={errors.email}
                leftIcon={Mail}
                disabled={isSubmitting}
                placeholder="admin@organaid.pk"
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
              />

              <FormField
                label="Password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                value={form.password}
                error={errors.password}
                leftIcon={LockKeyhole}
                showPasswordToggle
                disabled={isSubmitting}
                placeholder="Enter your password"
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
                Sign in as administrator
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs leading-6 text-slate-500">
                For security, do not share administrator credentials.
                Multiple failed login attempts should trigger backend
                rate limiting and audit logging.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}