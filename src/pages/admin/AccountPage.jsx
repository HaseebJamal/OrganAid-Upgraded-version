import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AtSign,
  Image,
  Mail,
  Phone,
  RefreshCw,
  Save,
  Settings2,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";

import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/Alert";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/Avatar";
import { StatusBadge } from "../../components/ui/Badge";

import { useAuth } from "../../context/AuthContext";
import {
  getSystemSettings,
  updateAdminProfile,
  updateSystemSettings,
} from "../../services/adminService";

const initialProfile = {
  fullName: "",
  email: "",
  phone: "",
  profileImage: "",
};

const initialSettings = {
  maintenanceMode: false,
  matchingEnabled: true,
  emailNotifications: true,
};

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

function normalizeSettings(response) {
  const data =
    response?.settings ||
    response?.data?.settings ||
    response?.data ||
    response ||
    {};

  return {
    maintenanceMode: Boolean(data.maintenanceMode),
    matchingEnabled:
      data.matchingEnabled === undefined
        ? true
        : Boolean(data.matchingEnabled),
    emailNotifications:
      data.emailNotifications === undefined
        ? true
        : Boolean(data.emailNotifications),
  };
}

export function Profile() {
  const { user, refreshUser } = useAuth();

  const [form, setForm] = useState(initialProfile);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      profileImage: user?.profileImage || "",
    });
  }, [user]);

  const hasChanges = useMemo(() => {
    return (
      form.fullName.trim() !== (user?.fullName || "").trim() ||
      form.email.trim() !== (user?.email || "").trim() ||
      form.phone.trim() !== (user?.phone || "").trim() ||
      form.profileImage.trim() !==
        (user?.profileImage || "").trim()
    );
  }, [form, user]);

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
  }

  function validateProfile() {
    const nextErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Full name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    }

    if (
      form.profileImage.trim() &&
      !/^https?:\/\/.+/i.test(form.profileImage.trim())
    ) {
      nextErrors.profileImage =
        "Enter a valid image URL beginning with http:// or https://.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateProfile() || isSaving) return;

    try {
      setIsSaving(true);

      await updateAdminProfile({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        profileImage: form.profileImage.trim(),
      });

      await refreshUser();

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Your profile could not be updated."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm() {
    setForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      profileImage: user?.profileImage || "",
    });

    setErrors({});
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading
        eyebrow="Administrator account"
        title="My profile"
        description="Manage the identity and contact information shown throughout the OrganAid administration workspace."
      />

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar size="2xl">
              <AvatarImage
                src={form.profileImage}
                alt={`${form.fullName || "Administrator"} profile`}
              />

              <AvatarFallback name={form.fullName} />
            </Avatar>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-xl font-bold text-slate-950">
                  {form.fullName || "OrganAid Administrator"}
                </h2>

                <StatusBadge
                  status="verified"
                  label="Administrator"
                />
              </div>

              <p className="mt-1 truncate text-sm text-slate-500">
                {form.email || "No email address"}
              </p>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Keep these details accurate so administrative
                activity, alerts, and account recovery remain
                reliable.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 p-6 sm:grid-cols-2"
          noValidate
        >
          <FormField
            label="Full name"
            name="fullName"
            required
            value={form.fullName}
            error={errors.fullName}
            leftIcon={UserRound}
            placeholder="Enter your full name"
            disabled={isSaving}
            onChange={(event) =>
              updateField("fullName", event.target.value)
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
            placeholder="+92 300 1234567"
            disabled={isSaving}
            onChange={(event) =>
              updateField("phone", event.target.value)
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
            placeholder="admin@organaid.pk"
            disabled={isSaving}
            className="sm:col-span-2"
            onChange={(event) =>
              updateField("email", event.target.value)
            }
          />

          <FormField
            label="Profile image URL"
            name="profileImage"
            type="url"
            value={form.profileImage}
            error={errors.profileImage}
            leftIcon={Image}
            placeholder="https://example.com/profile.jpg"
            hint="Use a direct HTTPS image URL. A file uploader can be added later."
            disabled={isSaving}
            className="sm:col-span-2"
            onChange={(event) =>
              updateField("profileImage", event.target.value)
            }
          />

          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:col-span-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={!hasChanges || isSaving}
              onClick={resetForm}
            >
              Reset changes
            </Button>

            <Button
              type="submit"
              leftIcon={Save}
              loading={isSaving}
              loadingText="Saving profile..."
              disabled={!hasChanges}
            >
              Save profile
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function Settings() {
  const [settings, setSettings] = useState(initialSettings);
  const [savedSettings, setSavedSettings] =
    useState(initialSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const hasChanges = useMemo(() => {
    return Object.keys(initialSettings).some(
      (key) => settings[key] !== savedSettings[key]
    );
  }, [settings, savedSettings]);

  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getSystemSettings();
      const normalized = normalizeSettings(response);

      setSettings(normalized);
      setSavedSettings(normalized);
    } catch (error) {
      const message = getErrorMessage(
        error,
        "System settings could not be loaded."
      );

      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  function updateSetting(key, value) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function saveSettings() {
    if (!hasChanges || isSaving) return;

    try {
      setIsSaving(true);

      const response = await updateSystemSettings(settings);
      const normalized = normalizeSettings(response);

      setSettings(normalized);
      setSavedSettings(normalized);

      toast.success("System settings saved successfully.");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "System settings could not be saved."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  function resetSettings() {
    setSettings(savedSettings);
  }

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeading
        eyebrow="Platform configuration"
        title="System settings"
        description="Control maintenance, organ-matching activity, and outbound platform notifications."
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Settings could not be loaded</AlertTitle>

          <AlertDescription>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>

              <Button
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                onClick={loadSettings}
                className="border-red-200 text-red-700 hover:bg-red-100"
              >
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {settings.maintenanceMode && (
        <Alert variant="warning">
          <AlertTitle>Maintenance mode is active</AlertTitle>

          <AlertDescription>
            Normal users may be unable to access parts of the
            platform until maintenance mode is disabled.
          </AlertDescription>
        </Alert>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
              <Settings2
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Global controls
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                These settings affect all OrganAid users and should
                be changed carefully.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <SettingToggle
            icon={Wrench}
            label="Maintenance mode"
            description="Temporarily restrict normal platform activity while maintenance or deployment work is underway."
            checked={settings.maintenanceMode}
            tone="warning"
            onChange={(value) =>
              updateSetting("maintenanceMode", value)
            }
          />

          <SettingToggle
            icon={ShieldCheck}
            label="Matching workflow"
            description="Allow authorized hospitals and care teams to perform donor-recipient matching."
            checked={settings.matchingEnabled}
            tone="success"
            onChange={(value) =>
              updateSetting("matchingEnabled", value)
            }
          />

          <SettingToggle
            icon={AtSign}
            label="Email notifications"
            description="Allow OrganAid to send account, verification, matching, and administrative notification emails."
            checked={settings.emailNotifications}
            tone="info"
            onChange={(value) =>
              updateSetting("emailNotifications", value)
            }
          />
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 p-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={!hasChanges || isSaving}
            onClick={resetSettings}
          >
            Reset changes
          </Button>

          <Button
            type="button"
            leftIcon={Save}
            loading={isSaving}
            loadingText="Saving settings..."
            disabled={!hasChanges}
            onClick={saveSettings}
          >
            Save settings
          </Button>
        </div>
      </section>

      <Alert variant="info">
        <AlertTitle>Administrative safeguard</AlertTitle>

        <AlertDescription>
          The backend should record every settings change in an audit
          log with the administrator, timestamp, previous value, and
          new value.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function PageHeading({
  eyebrow,
  title,
  description,
}) {
  return (
    <header>
      <p className="text-sm font-semibold text-red-600">
        {eyebrow}
      </p>

      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
        {title}
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        {description}
      </p>
    </header>
  );
}

function SettingToggle({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  tone = "default",
}) {
  const toneClasses = {
    default: "bg-slate-100 text-slate-600",
    warning: "bg-amber-50 text-amber-700",
    success: "bg-emerald-50 text-emerald-700",
    info: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="flex items-start justify-between gap-5 p-5 sm:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
            toneClasses[tone] || toneClasses.default
          }`}
        >
          <Icon
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div>
          <p className="font-semibold text-slate-950">
            {label}
          </p>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={[
          "relative mt-1 h-7 w-12 shrink-0 rounded-full transition duration-200",
          "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-100",
          checked
            ? "bg-red-600"
            : "bg-slate-200",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked
              ? "translate-x-6"
              : "translate-x-1",
          ].join(" ")}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div
      className="max-w-4xl space-y-6"
      role="status"
      aria-label="Loading system settings"
    >
      <div className="space-y-3">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-64 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-full max-w-xl animate-pulse rounded bg-slate-100" />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 p-6">
          <div className="h-12 w-52 animate-pulse rounded-xl bg-slate-200" />
        </div>

        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b border-slate-100 p-6 last:border-0"
          >
            <div className="flex flex-1 items-center gap-4">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-slate-200" />

              <div className="flex-1 space-y-3">
                <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-full max-w-lg animate-pulse rounded bg-slate-100" />
              </div>
            </div>

            <div className="h-7 w-12 animate-pulse rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
