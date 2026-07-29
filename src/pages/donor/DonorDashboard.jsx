import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  Droplets,
  FileText,
  HeartHandshake,
  MapPin,
  RefreshCw,
  Save,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Textarea from "../../components/ui/Textarea";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/Alert";
import { StatusBadge } from "../../components/ui/Badge";

import ReportUploader from "../../components/mycomponents/ReportUploader";
import ReportsList from "../../components/mycomponents/ReportsList";
import NotificationsList from "../../components/mycomponents/NotificationsList";

import {
  createDonorProfile,
  getDonorProfile,
  toggleAvailability,
  updateDonorProfile,
} from "../../services/donorService";

const organs = [
  "Kidney",
  "Liver",
  "Heart",
  "Lung",
  "Pancreas",
  "Cornea",
  "Bone Marrow",
];

const bloodGroups = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
];

const emptyProfile = {
  bloodGroup: "",
  dateOfBirth: "",
  gender: "",
  address: "",
  city: "",
  organType: "",
  medicalHistory: "",
};

const selectClassName =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70";

function normalizeProfile(response) {
  return (
    response?.profile ||
    response?.donor ||
    response?.data?.profile ||
    response?.data?.donor ||
    response?.data ||
    response ||
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

function isNotFoundError(error) {
  const status = error?.response?.status;
  const message = String(
    error?.response?.data?.message ||
      error?.message ||
      ""
  ).toLowerCase();

  return status === 404 || message.includes("not found");
}

function normalizeAvailability(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function formatDate(value) {
  if (!value) return "Not provided";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not provided";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
}

function calculateProfileCompletion(profile) {
  const fields = [
    "bloodGroup",
    "dateOfBirth",
    "gender",
    "address",
    "city",
    "organType",
  ];

  const completed = fields.filter(
    (field) => Boolean(profile?.[field])
  ).length;

  return Math.round((completed / fields.length) * 100);
}

export default function DonorDashboard() {
  const [donor, setDonor] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [errors, setErrors] = useState({});

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingAvailability, setIsUpdatingAvailability] =
    useState(false);

  const [loadError, setLoadError] = useState("");
  const [reportVersion, setReportVersion] = useState(0);

  const loadProfile = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setLoadError("");

        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await getDonorProfile();
        const profile = normalizeProfile(response);

        if (!profile) {
          setDonor(null);
          setForm(emptyProfile);
          return;
        }

        setDonor(profile);

        setForm({
          ...emptyProfile,
          ...profile,
          dateOfBirth: profile.dateOfBirth
            ? String(profile.dateOfBirth).slice(0, 10)
            : "",
        });
      } catch (error) {
        if (isNotFoundError(error)) {
          setDonor(null);
          setForm(emptyProfile);
          return;
        }

        const message = getErrorMessage(
          error,
          "Unable to load your donor profile."
        );

        setLoadError(message);

        if (refresh) {
          toast.error(message);
        }
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const isAvailable = useMemo(() => {
    return (
      normalizeAvailability(donor?.availabilityStatus) ===
      "available"
    );
  }, [donor?.availabilityStatus]);

  const profileCompletion = useMemo(() => {
    return calculateProfileCompletion(donor || form);
  }, [donor, form]);

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

    if (!form.bloodGroup) {
      nextErrors.bloodGroup = "Blood group is required.";
    }

    if (!form.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required.";
    } else {
      const selectedDate = new Date(form.dateOfBirth);
      const today = new Date();

      if (
        Number.isNaN(selectedDate.getTime()) ||
        selectedDate >= today
      ) {
        nextErrors.dateOfBirth =
          "Enter a valid date of birth.";
      }
    }

    if (!form.gender) {
      nextErrors.gender = "Gender is required.";
    }

    if (!form.organType) {
      nextErrors.organType =
        "Select the organ or tissue you wish to donate.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!form.address.trim()) {
      nextErrors.address = "Address is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    if (!validateProfile() || isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        bloodGroup: form.bloodGroup,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: form.address.trim(),
        city: form.city.trim(),
        organType: form.organType,
        medicalHistory: form.medicalHistory.trim(),
      };

      const response = donor
        ? await updateDonorProfile(payload)
        : await createDonorProfile(payload);

      const savedProfile =
        normalizeProfile(response) || {
          ...donor,
          ...payload,
        };

      setDonor(savedProfile);

      setForm({
        ...emptyProfile,
        ...savedProfile,
        dateOfBirth: savedProfile.dateOfBirth
          ? String(savedProfile.dateOfBirth).slice(0, 10)
          : payload.dateOfBirth,
      });

      toast.success(
        donor
          ? "Donor profile updated successfully."
          : "Donor profile created successfully."
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to save your donor profile."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvailabilityToggle() {
    if (isUpdatingAvailability) return;

    try {
      setIsUpdatingAvailability(true);

      const response = await toggleAvailability();
      const updatedProfile = normalizeProfile(response);

      if (updatedProfile) {
        setDonor(updatedProfile);

        setForm((current) => ({
          ...current,
          ...updatedProfile,
          dateOfBirth: updatedProfile.dateOfBirth
            ? String(updatedProfile.dateOfBirth).slice(0, 10)
            : current.dateOfBirth,
        }));
      } else {
        await loadProfile({ refresh: true });
      }

      toast.success(
        isAvailable
          ? "Your availability has been disabled."
          : "You are now available for donor coordination."
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to update your availability."
        )
      );
    } finally {
      setIsUpdatingAvailability(false);
    }
  }

  if (isLoading) {
    return <DonorDashboardSkeleton />;
  }

  if (!donor) {
    return (
      <div className="space-y-6">
        {loadError && (
          <ProfileLoadError
            message={loadError}
            onRetry={() => loadProfile()}
          />
        )}

        <WelcomeProfileCard />

        <ProfileForm
          form={form}
          errors={errors}
          isSaving={isSaving}
          updateField={updateField}
          onSubmit={handleSaveProfile}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <ProfileLoadError
          message={loadError}
          onRetry={() => loadProfile()}
        />
      )}

      <DonorHero
        donor={donor}
        available={isAvailable}
        profileCompletion={profileCompletion}
        isRefreshing={isRefreshing}
        isUpdatingAvailability={isUpdatingAvailability}
        onRefresh={() =>
          loadProfile({ refresh: true })
        }
        onToggleAvailability={handleAvailabilityToggle}
      />

      <section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Donor profile summary"
      >
        <Metric
          icon={ShieldCheck}
          label="Verification status"
          value={
            donor.isVerified
              ? "Verified"
              : "Pending review"
          }
          tone={
            donor.isVerified
              ? "emerald"
              : "amber"
          }
        />

        <Metric
          icon={HeartHandshake}
          label="Availability"
          value={
            donor.availabilityStatus || "Pending"
          }
          tone={
            isAvailable
              ? "emerald"
              : "amber"
          }
        />

        <Metric
          icon={Stethoscope}
          label="Donation type"
          value={donor.organType || "Not set"}
          tone="blue"
        />

        <Metric
          icon={MapPin}
          label="Location"
          value={donor.city || "Not set"}
          tone="violet"
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(18rem,0.75fr)]">
        <ProfileForm
          form={form}
          errors={errors}
          isSaving={isSaving}
          updateField={updateField}
          onSubmit={handleSaveProfile}
          edit
        />

        <div className="space-y-6">
          <ProfileSummary
            donor={donor}
            completion={profileCompletion}
          />

          <section id="notifications">
            <NotificationsList />
          </section>
        </div>
      </div>

      <section
        id="medical-records"
        className="space-y-6"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
            <FileText
              className="h-5 w-5"
              aria-hidden="true"
            />
          </span>

          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Medical records
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Upload and review medical documents used by
              authorized hospitals during donor verification.
            </p>
          </div>
        </div>

        <ReportUploader
          onDone={() =>
            setReportVersion((current) => current + 1)
          }
        />

        <ReportsList key={reportVersion} />
      </section>
    </div>
  );
}

function DonorHero({
  donor,
  available,
  profileCompletion,
  isRefreshing,
  isUpdatingAvailability,
  onRefresh,
  onToggleAvailability,
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-red-950 to-red-700 p-6 text-white shadow-xl shadow-red-100 sm:p-8">
      <div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-red-100">
              <HeartHandshake
                className="h-5 w-5"
                aria-hidden="true"
              />
              Your donation journey
            </span>

            <StatusBadge
              status={
                donor.isVerified
                  ? "verified"
                  : "pending"
              }
              label={
                donor.isVerified
                  ? "Verified donor"
                  : "Verification pending"
              }
            />
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Thank you for choosing to become a potential lifesaver.
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-red-100">
            Keep your profile and medical records current so
            authorized hospitals can coordinate safe,
            transparent donor verification.
          </p>

          <div className="mt-6 max-w-md">
            <div className="flex items-center justify-between text-xs font-semibold text-red-100">
              <span>Profile completion</span>
              <span>{profileCompletion}%</span>
            </div>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{
                  width: `${profileCompletion}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button
            variant="outline"
            leftIcon={RefreshCw}
            loading={isRefreshing}
            loadingText="Refreshing..."
            onClick={onRefresh}
            className="border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20 hover:text-white"
          >
            Refresh profile
          </Button>

          <Button
            variant={available ? "outline" : "default"}
            loading={isUpdatingAvailability}
            loadingText="Updating..."
            onClick={onToggleAvailability}
            className={
              available
                ? "border-white bg-white text-red-700 hover:bg-red-50 hover:text-red-800"
                : "bg-white text-red-700 hover:bg-red-50"
            }
          >
            Set {available ? "unavailable" : "available"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function WelcomeProfileCard() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-red-950 to-red-700 p-6 text-white shadow-xl shadow-red-100 sm:p-8">
      <div className="relative">
        <div className="flex items-center gap-2 text-sm font-semibold text-red-100">
          <HeartHandshake
            className="h-5 w-5"
            aria-hidden="true"
          />
          Begin your donation journey
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight">
          Complete your donor profile
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-red-100">
          Your donor profile helps authorized healthcare teams
          understand your basic eligibility and coordinate the
          next verification steps.
        </p>
      </div>
    </section>
  );
}

function ProfileForm({
  form,
  errors,
  updateField,
  onSubmit,
  isSaving,
  edit = false,
}) {
  return (
    <form
      id="profile"
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      noValidate
    >
      <div className="mb-6">
        <p className="text-sm font-semibold text-red-600">
          Profile details
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          {edit
            ? "Keep your information current"
            : "Complete your donor profile"}
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          This information supports preliminary verification only.
          Final donor eligibility must be determined by qualified
          healthcare professionals.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <SelectField
          label="Blood group"
          id="bloodGroup"
          required
          value={form.bloodGroup}
          error={errors.bloodGroup}
          disabled={isSaving}
          onChange={(event) =>
            updateField("bloodGroup", event.target.value)
          }
        >
          <option value="">Choose blood group</option>

          {bloodGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </SelectField>

        <FormField
          label="Date of birth"
          name="dateOfBirth"
          type="date"
          required
          value={form.dateOfBirth || ""}
          error={errors.dateOfBirth}
          leftIcon={CalendarDays}
          disabled={isSaving}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(event) =>
            updateField("dateOfBirth", event.target.value)
          }
        />

        <SelectField
          label="Gender"
          id="gender"
          required
          value={form.gender}
          error={errors.gender}
          disabled={isSaving}
          onChange={(event) =>
            updateField("gender", event.target.value)
          }
        >
          <option value="">Choose an option</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
          <option value="Prefer not to say">
            Prefer not to say
          </option>
        </SelectField>

        <SelectField
          label="Organ or tissue to donate"
          id="organType"
          required
          value={form.organType}
          error={errors.organType}
          disabled={isSaving}
          onChange={(event) =>
            updateField("organType", event.target.value)
          }
        >
          <option value="">Choose an organ or tissue</option>

          {organs.map((organ) => (
            <option key={organ} value={organ}>
              {organ}
            </option>
          ))}
        </SelectField>

        <FormField
          label="City"
          name="city"
          required
          value={form.city}
          error={errors.city}
          leftIcon={MapPin}
          disabled={isSaving}
          placeholder="Enter your city"
          onChange={(event) =>
            updateField("city", event.target.value)
          }
        />

        <FormField
          label="Address"
          name="address"
          required
          value={form.address}
          error={errors.address}
          leftIcon={MapPin}
          disabled={isSaving}
          placeholder="Enter your current address"
          onChange={(event) =>
            updateField("address", event.target.value)
          }
        />

        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="medicalHistory"
              className="text-sm font-semibold text-slate-800"
            >
              Medical history
              <span className="ml-1 font-normal text-slate-400">
                Optional
              </span>
            </label>

            <span className="text-xs text-slate-400">
              {form.medicalHistory.length}/1000
            </span>
          </div>

          <Textarea
            id="medicalHistory"
            value={form.medicalHistory}
            maxLength={1000}
            disabled={isSaving}
            placeholder="Add relevant conditions, treatments, allergies, or surgical history..."
            onChange={(event) =>
              updateField(
                "medicalHistory",
                event.target.value
              )
            }
          />

          <p className="mt-2 text-xs leading-5 text-slate-500">
            Do not use this field for emergencies. Contact a
            qualified healthcare provider when urgent care is
            required.
          </p>
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <Button
          type="submit"
          leftIcon={Save}
          loading={isSaving}
          loadingText={
            edit
              ? "Saving changes..."
              : "Creating profile..."
          }
        >
          {edit
            ? "Save changes"
            : "Create donor profile"}
        </Button>
      </div>
    </form>
  );
}

function SelectField({
  label,
  id,
  required = false,
  error,
  children,
  ...props
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-sm font-semibold text-slate-800"
      >
        {label}

        {required && (
          <>
            <span
              className="ml-1 text-red-600"
              aria-hidden="true"
            >
              *
            </span>

            <span className="sr-only">Required</span>
          </>
        )}
      </label>

      <select
        id={id}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={errorId}
        className={[
          selectClassName,
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-100"
            : "",
        ].join(" ")}
        {...props}
      >
        {children}
      </select>

      {error && (
        <p
          id={errorId}
          className="text-xs font-medium text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function ProfileSummary({
  donor,
  completion,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-600">
          <UserRound
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div>
          <h2 className="font-bold text-slate-950">
            Profile summary
          </h2>

          <p className="text-xs text-slate-500">
            {completion}% profile completion
          </p>
        </div>
      </div>

      <dl className="mt-5 space-y-3 text-sm">
        <Summary
          icon={Droplets}
          label="Blood group"
          value={donor.bloodGroup}
        />

        <Summary
          icon={CalendarDays}
          label="Date of birth"
          value={formatDate(donor.dateOfBirth)}
        />

        <Summary
          icon={MapPin}
          label="City"
          value={donor.city}
        />

        <Summary
          icon={MapPin}
          label="Address"
          value={donor.address}
        />
      </dl>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  tone,
}) {
  const styles = {
    red: "bg-red-50 text-red-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={`grid h-11 w-11 place-items-center rounded-xl ${
          styles[tone] || styles.red
        }`}
      >
        <Icon
          className="h-5 w-5"
          aria-hidden="true"
        />
      </span>

      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate font-bold text-slate-950">
        {value}
      </p>
    </article>
  );
}

function Summary({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <dt className="flex items-center gap-2 text-slate-500">
        {Icon && (
          <Icon
            className="h-4 w-4"
            aria-hidden="true"
          />
        )}

        {label}
      </dt>

      <dd className="max-w-[60%] break-words text-right font-semibold text-slate-800">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function ProfileLoadError({
  message,
  onRetry,
}) {
  return (
    <Alert variant="destructive">
      <AlertTitle>
        Donor profile could not be loaded
      </AlertTitle>

      <AlertDescription>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <span>{message}</span>

          <Button
            variant="outline"
            size="sm"
            leftIcon={RefreshCw}
            onClick={onRetry}
            className="border-red-200 text-red-700 hover:bg-red-100"
          >
            Try again
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}

function DonorDashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading donor workspace"
    >
      <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
        <div className="h-[34rem] animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="space-y-6">
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  );
}