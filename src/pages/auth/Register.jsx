import { useMemo, useState } from "react";
import {
  Building2,
  HeartHandshake,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  Link,
  Navigate,
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

import { AuthFrame } from "./Login";
import { useAuth } from "../../context/AuthContext";

const roleRoutes = {
  donor: "/donor/dashboard",
  recipient: "/recipient/dashboard",
  hospital: "/hospital/dashboard",
  admin: "/admin/dashboard",
  super_admin: "/admin/dashboard",
};

const roleOptions = [
  {
    value: "donor",
    label: "Donor",
    description:
      "Register your donor profile and manage availability.",
    icon: HeartHandshake,
  },
  {
    value: "recipient",
    label: "Recipient",
    description:
      "Create and monitor your organ request and care profile.",
    icon: UsersRound,
  },
  {
    value: "hospital",
    label: "Hospital",
    description:
      "Register a healthcare organization for verification and coordination.",
    icon: Building2,
  },
];

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  role: "donor",
  password: "",
  confirmPassword: "",
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

export default function Register() {
  const {
    user,
    loading,
    register,
    refreshUser,
  } = useAuth();

  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRole = useMemo(
    () =>
      roleOptions.find(
        (option) => option.value === form.role
      ) || roleOptions[0],
    [form.role]
  );

  if (loading) {
    return <RegisterSkeleton />;
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

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    } else if (form.fullName.trim().length < 3) {
      nextErrors.fullName =
        "Full name must contain at least 3 characters.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (
      !/^[+()\-\s0-9]{7,20}$/.test(form.phone.trim())
    ) {
      nextErrors.phone =
        "Enter a valid phone number.";
    }

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

    if (!form.role) {
      nextErrors.role =
        "Select an account type.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    } else if (form.password.length < 8) {
      nextErrors.password =
        "Password must contain at least 8 characters.";
    } else if (
      !/[A-Z]/.test(form.password) ||
      !/[a-z]/.test(form.password) ||
      !/[0-9]/.test(form.password)
    ) {
      nextErrors.password =
        "Use uppercase, lowercase, and at least one number.";
    }

    if (!form.confirmPassword) {
      nextErrors.confirmPassword =
        "Confirm your password.";
    } else if (
      form.password !== form.confirmPassword
    ) {
      nextErrors.confirmPassword =
        "Passwords do not match.";
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

      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        role: form.role,
        password: form.password,
      };

      const response = await register(payload);

      let registeredUser = normalizeUser(response);

      if (!registeredUser && refreshUser) {
        registeredUser = await refreshUser();
      }

      if (!registeredUser) {
        throw new Error(
          "The account was created, but user information was not returned."
        );
      }

      toast.success(
        "Your OrganAid account has been created successfully."
      );

      navigate(
        getDashboardPath(registeredUser.role),
        {
          replace: true,
        }
      );
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Unable to create your account."
      );

      setServerError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthFrame
      title="Create your account"
      subtitle="Join OrganAid as a donor, recipient, or verified hospital representative."
    >
      {serverError && (
        <Alert
          variant="destructive"
          className="mb-6"
        >
          <AlertTitle>
            Registration failed
          </AlertTitle>

          <AlertDescription>
            {serverError}
          </AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-5 sm:grid-cols-2"
        noValidate
      >
        <FormField
          label="Full name"
          name="fullName"
          required
          value={form.fullName}
          error={errors.fullName}
          leftIcon={UserRound}
          autoComplete="name"
          disabled={isSubmitting}
          placeholder="Enter your full name"
          onChange={(event) =>
            updateField(
              "fullName",
              event.target.value
            )
          }
        />

        <FormField
          label="Phone number"
          name="phone"
          type="tel"
          required
          value={form.phone}
          error={errors.phone}
          leftIcon={Phone}
          autoComplete="tel"
          disabled={isSubmitting}
          placeholder="+92 300 1234567"
          onChange={(event) =>
            updateField(
              "phone",
              event.target.value
            )
          }
        />

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
          className="sm:col-span-2"
          onChange={(event) =>
            updateField(
              "email",
              event.target.value
            )
          }
        />

        <div className="sm:col-span-2">
          <div className="mb-3">
            <p className="text-sm font-semibold text-slate-800">
              I am registering as
              <span
                className="ml-1 text-red-600"
                aria-hidden="true"
              >
                *
              </span>
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Select the account type that matches your role in
              OrganAid.
            </p>
          </div>

          <div
            className="grid gap-3 md:grid-cols-3"
            role="radiogroup"
            aria-label="Account type"
          >
            {roleOptions.map((option) => (
              <RoleCard
                key={option.value}
                {...option}
                selected={
                  form.role === option.value
                }
                disabled={isSubmitting}
                onSelect={() =>
                  updateField(
                    "role",
                    option.value
                  )
                }
              />
            ))}
          </div>

          {errors.role && (
            <p
              className="mt-2 text-xs font-medium text-red-600"
              role="alert"
            >
              {errors.role}
            </p>
          )}

          <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold text-slate-700">
              Selected: {selectedRole.label}
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {selectedRole.description}
            </p>
          </div>
        </div>

        <FormField
          label="Password"
          name="password"
          type="password"
          required
          value={form.password}
          error={errors.password}
          leftIcon={LockKeyhole}
          showPasswordToggle
          autoComplete="new-password"
          disabled={isSubmitting}
          placeholder="Create a strong password"
          hint="Use at least 8 characters with uppercase, lowercase, and a number."
          onChange={(event) =>
            updateField(
              "password",
              event.target.value
            )
          }
        />

        <FormField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          required
          value={form.confirmPassword}
          error={errors.confirmPassword}
          leftIcon={LockKeyhole}
          showPasswordToggle
          autoComplete="new-password"
          disabled={isSubmitting}
          placeholder="Repeat your password"
          onChange={(event) =>
            updateField(
              "confirmPassword",
              event.target.value
            )
          }
        />

        <div className="sm:col-span-2">
          <Alert variant="info">
            <AlertTitle>
              Verification required
            </AlertTitle>

            <AlertDescription>
              Donor, recipient, and hospital accounts may require
              identity, medical, or organization verification before
              accessing all platform features.
            </AlertDescription>
          </Alert>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isSubmitting}
          loadingText="Creating your account..."
          className="sm:col-span-2"
        >
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-red-600 transition hover:text-red-700"
        >
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs leading-5 text-slate-400">
        By creating an account, you agree to the{" "}
        <Link
          to="/terms"
          className="font-medium text-slate-600 hover:text-red-600"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          to="/privacy"
          className="font-medium text-slate-600 hover:text-red-600"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </AuthFrame>
  );
}

function RoleCard({
  value: _value,
  label,
  description,
  icon: Icon,
  selected,
  disabled,
  onSelect,
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={[
        "rounded-2xl border p-4 text-left transition duration-200",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
        "disabled:cursor-not-allowed disabled:opacity-60",
        selected
          ? "border-red-300 bg-red-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-red-200 hover:bg-red-50/40",
      ].join(" ")}
    >
      <span
        className={[
          "grid h-10 w-10 place-items-center rounded-xl",
          selected
            ? "bg-red-600 text-white"
            : "bg-slate-100 text-slate-500",
        ].join(" ")}
      >
        <Icon
          className="h-5 w-5"
          aria-hidden="true"
        />
      </span>

      <p
        className={[
          "mt-3 text-sm font-bold",
          selected
            ? "text-red-700"
            : "text-slate-900",
        ].join(" ")}
      >
        {label}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </button>
  );
}

function RegisterSkeleton() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4"
      role="status"
      aria-label="Loading registration page"
    >
      <div className="w-full max-w-2xl space-y-5 rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full max-w-lg animate-pulse rounded bg-slate-100" />

        <div className="grid gap-5 sm:grid-cols-2">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className="h-11 animate-pulse rounded-xl bg-slate-200"
              />
            )
          )}
        </div>

        <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}
