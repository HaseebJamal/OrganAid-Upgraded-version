import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Building2,
  ClipboardCheck,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Textarea from "../../components/ui/Textarea";
import { StatusBadge } from "../../components/ui/Badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/Alert";

import {
  createHospital,
  getHospitalHistory,
  getHospitalProfile,
  getHospitalQueue,
  updateHospital,
  verifyQueueItem,
} from "../../services/hospitalService";

const emptyHospital = {
  hospitalName: "",
  registrationNumber: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  province: "",
  website: "",
  description: "",
};

function normalizeHospital(response) {
  return (
    response?.hospital ||
    response?.profile ||
    response?.data?.hospital ||
    response?.data?.profile ||
    response?.data ||
    response ||
    null
  );
}

function normalizeQueue(response) {
  const data =
    response?.queue ||
    response?.data?.queue ||
    response?.data ||
    response ||
    {};

  return {
    donors: Array.isArray(data.donors)
      ? data.donors
      : [],
    recipients: Array.isArray(data.recipients)
      ? data.recipients
      : [],
  };
}

function normalizeHistory(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.history)) {
    return response.history;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.history)) {
    return response.data.history;
  }

  return [];
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

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function HospitalDashboard() {
  const [hospital, setHospital] = useState(null);
  const [form, setForm] = useState(emptyHospital);
  const [errors, setErrors] = useState({});

  const [queue, setQueue] = useState({
    donors: [],
    recipients: [],
  });

  const [history, setHistory] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [processingQueueId, setProcessingQueueId] =
    useState("");

  const [loadError, setLoadError] = useState("");

  const loadDashboard = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        setLoadError("");

        if (refresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const profileResponse =
          await getHospitalProfile();

        const profile =
          normalizeHospital(profileResponse);

        if (!profile) {
          setHospital(null);
          setForm(emptyHospital);
          setQueue({
            donors: [],
            recipients: [],
          });
          setHistory([]);
          return;
        }

        setHospital(profile);

        setForm({
          ...emptyHospital,
          ...profile,
        });

        if (profile.isVerified) {
          const [queueResponse, historyResponse] =
            await Promise.all([
              getHospitalQueue(),
              getHospitalHistory(),
            ]);

          setQueue(normalizeQueue(queueResponse));
          setHistory(
            normalizeHistory(historyResponse)
          );
        } else {
          setQueue({
            donors: [],
            recipients: [],
          });
          setHistory([]);
        }
      } catch (error) {
        if (isNotFoundError(error)) {
          setHospital(null);
          setForm(emptyHospital);
          return;
        }

        const message = getErrorMessage(
          error,
          "Unable to load the hospital workspace."
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
    loadDashboard();
  }, [loadDashboard]);

  const queueCount = useMemo(
    () =>
      queue.donors.length +
      queue.recipients.length,
    [queue]
  );

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

  function validateHospital() {
    const nextErrors = {};

    if (!form.hospitalName.trim()) {
      nextErrors.hospitalName =
        "Hospital name is required.";
    }

    if (!form.registrationNumber.trim()) {
      nextErrors.registrationNumber =
        "Registration number is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email =
        "Hospital email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      nextErrors.email =
        "Enter a valid email address.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone =
        "Phone number is required.";
    } else if (
      !/^[+()\-\s0-9]{7,20}$/.test(
        form.phone.trim()
      )
    ) {
      nextErrors.phone =
        "Enter a valid phone number.";
    }

    if (!form.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!form.province.trim()) {
      nextErrors.province =
        "Province is required.";
    }

    if (!form.address.trim()) {
      nextErrors.address =
        "Hospital address is required.";
    }

    if (
      form.website.trim() &&
      !/^https?:\/\/.+/i.test(
        form.website.trim()
      )
    ) {
      nextErrors.website =
        "Website must begin with http:// or https://.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave(event) {
    event.preventDefault();

    if (!validateHospital() || isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      const payload = {
        hospitalName: form.hospitalName.trim(),
        registrationNumber:
          form.registrationNumber.trim(),
        email: form.email
          .trim()
          .toLowerCase(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        website: form.website.trim(),
        description: form.description.trim(),
      };

      const response = hospital
        ? await updateHospital(payload)
        : await createHospital(payload);

      const savedHospital =
        normalizeHospital(response) || {
          ...hospital,
          ...payload,
        };

      setHospital(savedHospital);
      setForm({
        ...emptyHospital,
        ...savedHospital,
      });

      toast.success(
        hospital
          ? "Hospital profile updated successfully."
          : "Hospital profile created successfully."
      );

      await loadDashboard({
        refresh: true,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to save the hospital profile."
        )
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleVerification(
    kind,
    item,
    decision
  ) {
    const itemId = item?._id || item?.id;

    if (!itemId || processingQueueId) {
      return;
    }

    const actionLabel =
      decision === "verified"
        ? "verify"
        : "decline";

    const confirmed = window.confirm(
      `Are you sure you want to ${actionLabel} ${
        item.user?.fullName ||
        item.fullName ||
        "this profile"
      }?`
    );

    if (!confirmed) return;

    try {
      setProcessingQueueId(itemId);

      await verifyQueueItem(
        kind,
        itemId,
        decision
      );

      toast.success(
        decision === "verified"
          ? "Profile verified successfully."
          : "Profile declined successfully."
      );

      await loadDashboard({
        refresh: true,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to save the verification decision."
        )
      );
    } finally {
      setProcessingQueueId("");
    }
  }

  if (isLoading) {
    return <HospitalDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <Alert variant="destructive">
          <AlertTitle>
            Hospital workspace could not be loaded
          </AlertTitle>

          <AlertDescription>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{loadError}</span>

              <Button
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                onClick={() =>
                  loadDashboard()
                }
                className="border-red-200 text-red-700 hover:bg-red-100"
              >
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <HospitalHero
        hospital={hospital}
        isRefreshing={isRefreshing}
        onRefresh={() =>
          loadDashboard({
            refresh: true,
          })
        }
      />

      {hospital && (
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Hospital dashboard statistics"
        >
          <Metric
            icon={ShieldCheck}
            label="Verification"
            value={
              hospital.isVerified
                ? "Verified hospital"
                : "Awaiting review"
            }
            color={
              hospital.isVerified
                ? "emerald"
                : "amber"
            }
          />

          <Metric
            icon={ClipboardCheck}
            label="Donors in queue"
            value={queue.donors.length}
            color="red"
          />

          <Metric
            icon={Clock3}
            label="Recipients in queue"
            value={queue.recipients.length}
            color="amber"
          />

          <Metric
            icon={MapPin}
            label="Location"
            value={
              hospital.city || "Not set"
            }
            color="blue"
          />
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <HospitalForm
          form={form}
          errors={errors}
          edit={Boolean(hospital)}
          isSaving={isSaving}
          updateField={updateField}
          onSubmit={handleSave}
        />

        {hospital && (
          <aside className="space-y-6">
            {!hospital.isVerified ? (
              <VerificationPending />
            ) : (
              <VerificationQueue
                queue={queue}
                total={queueCount}
                processingQueueId={
                  processingQueueId
                }
                onVerify={
                  handleVerification
                }
              />
            )}

            <VerificationHistory
              history={history}
            />
          </aside>
        )}
      </div>
    </div>
  );
}

function HospitalHero({
  hospital,
  isRefreshing,
  onRefresh,
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-violet-950 to-indigo-800 p-6 text-white shadow-xl shadow-violet-100 sm:p-8">
      <div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-violet-100">
            <Building2
              className="h-5 w-5"
              aria-hidden="true"
            />
            Hospital operations
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Coordinate care with confidence.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-violet-100">
            Maintain an accurate hospital profile and
            review authorized donor and recipient
            records through a secure clinical
            workspace.
          </p>

          {hospital && (
            <div className="mt-5">
              <StatusBadge
                status={
                  hospital.isVerified
                    ? "verified"
                    : "pending"
                }
                label={
                  hospital.isVerified
                    ? "Verified hospital"
                    : "Verification pending"
                }
              />
            </div>
          )}
        </div>

        <Button
          variant="outline"
          leftIcon={RefreshCw}
          loading={isRefreshing}
          loadingText="Refreshing..."
          onClick={onRefresh}
          className="border-white/30 bg-white/10 text-white hover:border-white/50 hover:bg-white/20 hover:text-white"
        >
          Refresh workspace
        </Button>
      </div>
    </section>
  );
}

function HospitalForm({
  form,
  errors,
  updateField,
  onSubmit,
  edit,
  isSaving,
}) {
  return (
    <form
      id="profile"
      onSubmit={onSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      noValidate
    >
      <p className="text-sm font-semibold text-violet-600">
        Hospital profile
      </p>

      <h2 className="mt-1 text-xl font-bold text-slate-950">
        {edit
          ? "Manage hospital details"
          : "Create hospital profile"}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        Accurate registration and contact information
        helps administrators validate your healthcare
        organization.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <FormField
          label="Hospital name"
          name="hospitalName"
          required
          value={form.hospitalName}
          error={errors.hospitalName}
          leftIcon={Building2}
          disabled={isSaving}
          placeholder="Enter hospital name"
          onChange={(event) =>
            updateField(
              "hospitalName",
              event.target.value
            )
          }
        />

        <FormField
          label="Registration number"
          name="registrationNumber"
          required
          value={form.registrationNumber}
          error={errors.registrationNumber}
          leftIcon={ShieldCheck}
          disabled={isSaving}
          placeholder="Official registration number"
          onChange={(event) =>
            updateField(
              "registrationNumber",
              event.target.value
            )
          }
        />

        <FormField
          label="Hospital email"
          name="email"
          type="email"
          required
          value={form.email}
          error={errors.email}
          leftIcon={Mail}
          disabled={isSaving}
          placeholder="hospital@example.com"
          onChange={(event) =>
            updateField(
              "email",
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
          disabled={isSaving}
          placeholder="+92 300 1234567"
          onChange={(event) =>
            updateField(
              "phone",
              event.target.value
            )
          }
        />

        <FormField
          label="City"
          name="city"
          required
          value={form.city}
          error={errors.city}
          leftIcon={MapPin}
          disabled={isSaving}
          placeholder="Enter city"
          onChange={(event) =>
            updateField(
              "city",
              event.target.value
            )
          }
        />

        <FormField
          label="Province"
          name="province"
          required
          value={form.province}
          error={errors.province}
          leftIcon={MapPin}
          disabled={isSaving}
          placeholder="Enter province"
          onChange={(event) =>
            updateField(
              "province",
              event.target.value
            )
          }
        />

        <FormField
          label="Website"
          name="website"
          type="url"
          value={form.website}
          error={errors.website}
          leftIcon={Globe2}
          disabled={isSaving}
          placeholder="https://hospital.example.com"
          className="md:col-span-2"
          onChange={(event) =>
            updateField(
              "website",
              event.target.value
            )
          }
        />

        <FormField
          label="Hospital address"
          name="address"
          required
          value={form.address}
          error={errors.address}
          leftIcon={MapPin}
          disabled={isSaving}
          placeholder="Enter complete hospital address"
          className="md:col-span-2"
          onChange={(event) =>
            updateField(
              "address",
              event.target.value
            )
          }
        />

        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between gap-3">
            <label
              htmlFor="hospital-description"
              className="text-sm font-semibold text-slate-800"
            >
              Description
              <span className="ml-1 font-normal text-slate-400">
                Optional
              </span>
            </label>

            <span className="text-xs text-slate-400">
              {form.description.length}/1000
            </span>
          </div>

          <Textarea
            id="hospital-description"
            rows={5}
            maxLength={1000}
            value={form.description}
            disabled={isSaving}
            placeholder="Describe the hospital, clinical services, transplant facilities, or verification team..."
            onChange={(event) =>
              updateField(
                "description",
                event.target.value
              )
            }
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
        <Button
          type="submit"
          leftIcon={Save}
          loading={isSaving}
          loadingText={
            edit
              ? "Saving hospital..."
              : "Creating hospital..."
          }
          className="bg-violet-700 hover:bg-violet-800 focus-visible:ring-violet-100"
        >
          {edit
            ? "Save hospital details"
            : "Create hospital profile"}
        </Button>
      </div>
    </form>
  );
}

function VerificationPending() {
  return (
    <Alert variant="warning">
      <AlertTitle>
        Verification in progress
      </AlertTitle>

      <AlertDescription>
        An OrganAid administrator must verify the
        hospital registration before donor and
        recipient review queues become available.
      </AlertDescription>
    </Alert>
  );
}

function VerificationQueue({
  queue,
  total,
  processingQueueId,
  onVerify,
}) {
  const entries = [
    ...queue.donors.map((item) => ({
      kind: "donor",
      item,
    })),
    ...queue.recipients.map((item) => ({
      kind: "recipient",
      item,
    })),
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-violet-600">
              Clinical review
            </p>

            <h2 className="mt-1 font-bold text-slate-950">
              Verification queue
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {total} pending profile
              {total === 1 ? "" : "s"}
            </p>
          </div>

          <StatusBadge
            status={
              total > 0
                ? "pending"
                : "completed"
            }
            label={
              total > 0
                ? `${total} pending`
                : "Queue clear"
            }
          />
        </div>
      </div>

      {entries.length ? (
        <div className="divide-y divide-slate-100">
          {entries.map(
            ({ kind, item }, index) => (
              <QueueItem
                key={
                  item._id ||
                  item.id ||
                  `${kind}-${index}`
                }
                kind={kind}
                item={item}
                isProcessing={
                  processingQueueId ===
                  (item._id || item.id)
                }
                onVerify={onVerify}
              />
            )
          )}
        </div>
      ) : (
        <div className="px-5 py-12 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ClipboardCheck
              className="h-6 w-6"
              aria-hidden="true"
            />
          </span>

          <p className="mt-4 font-semibold text-slate-950">
            No profiles waiting for review
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            New donor or recipient verification
            requests will appear here.
          </p>
        </div>
      )}
    </section>
  );
}

function QueueItem({
  kind,
  item,
  isProcessing,
  onVerify,
}) {
  const name =
    item.user?.fullName ||
    item.fullName ||
    "Profile review";

  const detail =
    item.organType ||
    item.city ||
    item.bloodGroup ||
    "Details pending";

  return (
    <article className="p-5 transition hover:bg-slate-50/70">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
          <UserRound
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="truncate font-semibold text-slate-900">
              {name}
            </p>

            <StatusBadge
              status="pending"
              size="sm"
            />
          </div>

          <p className="mt-1 text-xs capitalize text-slate-500">
            {kind} · {detail}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="success"
              loading={isProcessing}
              loadingText="Saving..."
              onClick={() =>
                onVerify(
                  kind,
                  item,
                  "verified"
                )
              }
            >
              Verify
            </Button>

            <Button
              size="sm"
              variant="outline"
              disabled={isProcessing}
              onClick={() =>
                onVerify(
                  kind,
                  item,
                  "rejected"
                )
              }
              className="text-red-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function VerificationHistory({ history }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-violet-600">
        Recent activity
      </p>

      <h2 className="mt-1 font-bold text-slate-950">
        Verification history
      </h2>

      <div className="mt-4 space-y-3">
        {history.length ? (
          history.slice(0, 5).map(
            (item, index) => (
              <article
                key={
                  item._id ||
                  item.id ||
                  index
                }
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-800">
                    {item.title ||
                      "Verification activity"}
                  </p>

                  {item.status && (
                    <StatusBadge
                      status={item.status}
                      size="sm"
                    />
                  )}
                </div>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.message ||
                    item.description ||
                    "No additional details provided."}
                </p>

                <p className="mt-2 text-[11px] text-slate-400">
                  {formatDate(
                    item.createdAt ||
                    item.updatedAt
                  )}
                </p>
              </article>
            )
          )
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
            No verification activity yet.
          </p>
        )}
      </div>
    </section>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  color,
}) {
  const colors = {
    violet:
      "bg-violet-50 text-violet-600",
    red: "bg-red-50 text-red-600",
    amber:
      "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    emerald:
      "bg-emerald-50 text-emerald-600",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={`grid h-11 w-11 place-items-center rounded-xl ${
          colors[color] || colors.violet
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

function HospitalDashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading hospital workspace"
    >
      <div className="h-64 animate-pulse rounded-3xl bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map(
          (_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-white"
            />
          )
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <div className="h-[42rem] animate-pulse rounded-2xl border border-slate-200 bg-white" />

        <div className="space-y-6">
          <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-white" />

          <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
      </div>
    </div>
  );
}
