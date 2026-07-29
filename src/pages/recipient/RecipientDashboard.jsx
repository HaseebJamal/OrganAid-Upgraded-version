import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Activity,
  CalendarDays,
  ClipboardPlus,
  HeartPulse,
  MapPin,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
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

import NotificationsList from "../../components/mycomponents/NotificationsList";

import {
  createOrganRequest,
  createRecipient,
  getMyRecipientProfile,
  getMyRequests,
  updateRecipient,
} from "../../services/recipientService";

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

const urgencyLevels = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const emptyProfile = {
  bloodGroup: "",
  dateOfBirth: "",
  gender: "",
  phone: "",
  address: "",
  city: "",
  requiredOrgan: "",
  medicalCondition: "",
  urgencyLevel: "Medium",
};

const selectClassName =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70";

function normalizeProfile(response) {
  return (
    response?.recipient ||
    response?.profile ||
    response?.data?.recipient ||
    response?.data?.profile ||
    response?.data ||
    response ||
    null
  );
}

function normalizeRequests(response) {
  if (Array.isArray(response)) return response;

  if (Array.isArray(response?.requests)) {
    return response.requests;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.requests)) {
    return response.data.requests;
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

function formatLabel(value, fallback = "Not specified") {
  if (!value) return fallback;

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase()
    );
}

function isRequestActive(request) {
  const status = String(request?.status || "")
    .trim()
    .toLowerCase();

  return ![
    "completed",
    "cancelled",
    "rejected",
    "closed",
  ].includes(status);
}

export default function RecipientDashboard() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(emptyProfile);
  const [errors, setErrors] = useState({});
  const [requests, setRequests] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] =
    useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] =
    useState(false);

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

        let currentProfile = null;

        try {
          const profileResponse =
            await getMyRecipientProfile();

          currentProfile =
            normalizeProfile(profileResponse);
        } catch (error) {
          if (!isNotFoundError(error)) {
            throw error;
          }
        }

        if (!currentProfile) {
          setProfile(null);
          setForm(emptyProfile);
          setRequests([]);
          return;
        }

        setProfile(currentProfile);

        setForm({
          ...emptyProfile,
          ...currentProfile,
          dateOfBirth: currentProfile.dateOfBirth
            ? String(currentProfile.dateOfBirth).slice(0, 10)
            : "",
        });

        const requestsResponse = await getMyRequests();

        setRequests(
          normalizeRequests(requestsResponse)
        );
      } catch (error) {
        const message = getErrorMessage(
          error,
          "Unable to load your recipient workspace."
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

  const activeRequest = useMemo(() => {
    return requests.find(isRequestActive) || null;
  }, [requests]);

  const latestRequest = useMemo(() => {
    if (!requests.length) return null;

    return [...requests].sort((first, second) => {
      const firstDate = new Date(
        first.createdAt ||
          first.updatedAt ||
          0
      ).getTime();

      const secondDate = new Date(
        second.createdAt ||
          second.updatedAt ||
          0
      ).getTime();

      return secondDate - firstDate;
    })[0];
  }, [requests]);

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
      nextErrors.bloodGroup =
        "Blood group is required.";
    }

    if (!form.dateOfBirth) {
      nextErrors.dateOfBirth =
        "Date of birth is required.";
    } else {
      const dateOfBirth = new Date(
        form.dateOfBirth
      );

      if (
        Number.isNaN(dateOfBirth.getTime()) ||
        dateOfBirth >= new Date()
      ) {
        nextErrors.dateOfBirth =
          "Enter a valid date of birth.";
      }
    }

    if (!form.gender) {
      nextErrors.gender =
        "Gender is required.";
    }

    if (!form.requiredOrgan) {
      nextErrors.requiredOrgan =
        "Select the required organ or tissue.";
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

    if (!form.address.trim()) {
      nextErrors.address =
        "Address is required.";
    }

    if (!form.medicalCondition.trim()) {
      nextErrors.medicalCondition =
        "Medical condition details are required.";
    } else if (
      form.medicalCondition.trim().length < 10
    ) {
      nextErrors.medicalCondition =
        "Provide at least 10 characters describing the medical condition.";
    }

    if (!form.urgencyLevel) {
      nextErrors.urgencyLevel =
        "Select an urgency level.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSaveProfile(event) {
    event.preventDefault();

    if (
      !validateProfile() ||
      isSavingProfile
    ) {
      return;
    }

    try {
      setIsSavingProfile(true);

      const payload = {
        bloodGroup: form.bloodGroup,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        phone: form.phone.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        requiredOrgan: form.requiredOrgan,
        medicalCondition:
          form.medicalCondition.trim(),
        urgencyLevel: form.urgencyLevel,
      };

      const response = profile
        ? await updateRecipient(payload)
        : await createRecipient(payload);

      const savedProfile =
        normalizeProfile(response) || {
          ...profile,
          ...payload,
        };

      setProfile(savedProfile);

      setForm({
        ...emptyProfile,
        ...savedProfile,
        dateOfBirth: savedProfile.dateOfBirth
          ? String(savedProfile.dateOfBirth).slice(
              0,
              10
            )
          : payload.dateOfBirth,
      });

      toast.success(
        profile
          ? "Recipient profile updated successfully."
          : "Recipient profile created successfully."
      );

      await loadDashboard({
        refresh: true,
      });
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to save your recipient profile."
        )
      );
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleCreateRequest() {
    if (
      !profile ||
      isSubmittingRequest ||
      activeRequest
    ) {
      return;
    }

    const confirmed = window.confirm(
      `Submit an organ request for ${profile.requiredOrgan}?\n\nYour profile will be shared with authorized care teams for review.`
    );

    if (!confirmed) return;

    try {
      setIsSubmittingRequest(true);

      await createOrganRequest({
        organType: profile.requiredOrgan,
        urgencyLevel: profile.urgencyLevel,
      });

      const response = await getMyRequests();

      setRequests(normalizeRequests(response));

      toast.success(
        "Your organ request has been submitted successfully."
      );
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Unable to submit your organ request."
        )
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  }

  if (isLoading) {
    return <RecipientDashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <Alert variant="destructive">
          <AlertTitle>
            Recipient workspace could not be loaded
          </AlertTitle>

          <AlertDescription>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>{loadError}</span>

              <Button
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                onClick={() => loadDashboard()}
                className="border-red-200 text-red-700 hover:bg-red-100"
              >
                Try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <RecipientHero
        profile={profile}
        activeRequest={activeRequest}
        isRefreshing={isRefreshing}
        onRefresh={() =>
          loadDashboard({
            refresh: true,
          })
        }
      />

      {profile && (
        <section
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Recipient profile summary"
        >
          <Metric
            icon={ShieldCheck}
            label="Profile status"
            value={
              profile.isVerified
                ? "Verified"
                : "Pending review"
            }
            color={
              profile.isVerified
                ? "emerald"
                : "amber"
            }
          />

          <Metric
            icon={HeartPulse}
            label="Required organ"
            value={
              profile.requiredOrgan ||
              "Not set"
            }
            color="red"
          />

          <Metric
            icon={Activity}
            label="Urgency"
            value={
              profile.urgencyLevel ||
              "Not set"
            }
            color={
              profile.urgencyLevel === "Critical"
                ? "red"
                : "amber"
            }
          />

          <Metric
            icon={MapPin}
            label="Location"
            value={profile.city || "Not set"}
            color="violet"
          />
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <RecipientProfileForm
          form={form}
          errors={errors}
          edit={Boolean(profile)}
          isSaving={isSavingProfile}
          updateField={updateField}
          onSubmit={handleSaveProfile}
        />

        {profile && (
          <aside className="space-y-6">
            <RequestCard
              profile={profile}
              activeRequest={activeRequest}
              latestRequest={latestRequest}
              isSubmitting={
                isSubmittingRequest
              }
              onSubmitRequest={
                handleCreateRequest
              }
            />

            <section id="notifications">
              <NotificationsList />
            </section>
          </aside>
        )}
      </div>

      {profile && (
        <RequestHistory requests={requests} />
      )}
    </div>
  );
}

function RecipientHero({
  profile,
  activeRequest,
  isRefreshing,
  onRefresh,
}) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-700 p-6 text-white shadow-xl shadow-blue-100 sm:p-8">
      <div
        className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-blue-100">
            <HeartPulse
              className="h-5 w-5"
              aria-hidden="true"
            />
            Your care pathway
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight">
            Keep your medical request ready for review.
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
            Maintain accurate medical and contact information so
            authorized healthcare teams can review your request
            safely and efficiently.
          </p>

          {profile && (
            <div className="mt-5 flex flex-wrap gap-2">
              <StatusBadge
                status={
                  profile.isVerified
                    ? "verified"
                    : "pending"
                }
                label={
                  profile.isVerified
                    ? "Profile verified"
                    : "Verification pending"
                }
              />

              {activeRequest && (
                <StatusBadge
                  status={
                    activeRequest.status ||
                    "pending"
                  }
                  label={`Request: ${formatLabel(
                    activeRequest.status,
                    "Pending"
                  )}`}
                />
              )}
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

function RecipientProfileForm({
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
      <p className="text-sm font-semibold text-blue-600">
        Medical profile
      </p>

      <h2 className="mt-1 text-xl font-bold text-slate-950">
        {edit
          ? "Keep your care details current"
          : "Complete your recipient profile"}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        This information is shared only with authorized healthcare
        teams involved in verification and organ-request review.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <SelectField
          label="Blood group"
          id="bloodGroup"
          required
          value={form.bloodGroup}
          error={errors.bloodGroup}
          disabled={isSaving}
          onChange={(event) =>
            updateField(
              "bloodGroup",
              event.target.value
            )
          }
        >
          <option value="">
            Choose blood group
          </option>

          {bloodGroups.map((group) => (
            <option
              key={group}
              value={group}
            >
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
          max={new Date()
            .toISOString()
            .slice(0, 10)}
          onChange={(event) =>
            updateField(
              "dateOfBirth",
              event.target.value
            )
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
            updateField(
              "gender",
              event.target.value
            )
          }
        >
          <option value="">
            Choose an option
          </option>

          <option value="Male">
            Male
          </option>

          <option value="Female">
            Female
          </option>

          <option value="Other">
            Other
          </option>

          <option value="Prefer not to say">
            Prefer not to say
          </option>
        </SelectField>

        <SelectField
          label="Required organ or tissue"
          id="requiredOrgan"
          required
          value={form.requiredOrgan}
          error={errors.requiredOrgan}
          disabled={isSaving}
          onChange={(event) =>
            updateField(
              "requiredOrgan",
              event.target.value
            )
          }
        >
          <option value="">
            Choose an organ or tissue
          </option>

          {organs.map((organ) => (
            <option
              key={organ}
              value={organ}
            >
              {organ}
            </option>
          ))}
        </SelectField>

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
          placeholder="Enter your city"
          onChange={(event) =>
            updateField(
              "city",
              event.target.value
            )
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
              htmlFor="medicalCondition"
              className="text-sm font-semibold text-slate-800"
            >
              Medical condition
              <span
                className="ml-1 text-red-600"
                aria-hidden="true"
              >
                *
              </span>
            </label>

            <span className="text-xs text-slate-400">
              {form.medicalCondition.length}/1500
            </span>
          </div>

          <Textarea
            id="medicalCondition"
            value={form.medicalCondition}
            maxLength={1500}
            rows={6}
            disabled={isSaving}
            error={Boolean(
              errors.medicalCondition
            )}
            placeholder="Describe the diagnosis, symptoms, treatment history, specialist recommendation, and other relevant medical details..."
            aria-describedby={
              errors.medicalCondition
                ? "medical-condition-error"
                : "medical-condition-hint"
            }
            onChange={(event) =>
              updateField(
                "medicalCondition",
                event.target.value
              )
            }
          />

          {errors.medicalCondition ? (
            <p
              id="medical-condition-error"
              className="mt-2 text-xs font-medium text-red-600"
              role="alert"
            >
              {errors.medicalCondition}
            </p>
          ) : (
            <p
              id="medical-condition-hint"
              className="mt-2 text-xs leading-5 text-slate-500"
            >
              Do not use this field for medical emergencies. Contact
              an emergency service or qualified healthcare provider
              when immediate care is required.
            </p>
          )}
        </div>

        <SelectField
          label="Urgency level"
          id="urgencyLevel"
          required
          value={form.urgencyLevel}
          error={errors.urgencyLevel}
          disabled={isSaving}
          onChange={(event) =>
            updateField(
              "urgencyLevel",
              event.target.value
            )
          }
        >
          {urgencyLevels.map((level) => (
            <option
              key={level}
              value={level}
            >
              {level}
            </option>
          ))}
        </SelectField>
      </div>

      <Alert
        variant="info"
        className="mt-6"
      >
        <AlertTitle>
          Clinical verification required
        </AlertTitle>

        <AlertDescription>
          The urgency level entered here is preliminary. Authorized
          clinicians must review medical evidence and determine the
          official clinical priority.
        </AlertDescription>
      </Alert>

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
          className="bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-100"
        >
          {edit
            ? "Save changes"
            : "Create recipient profile"}
        </Button>
      </div>
    </form>
  );
}

function RequestCard({
  profile,
  activeRequest,
  latestRequest,
  isSubmitting,
  onSubmitRequest,
}) {
  const canSubmit =
    profile.isVerified && !activeRequest;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
          <ClipboardPlus
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div>
          <p className="text-sm font-semibold text-blue-600">
            Care request
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-950">
            Request{" "}
            {profile.requiredOrgan ||
              "an organ"}
          </h2>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-500">
        Submitting a request shares your verified profile with
        authorized care teams for clinical review and coordination.
      </p>

      {activeRequest && (
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-500">
            Active request
          </p>

          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="font-semibold text-blue-950">
              {activeRequest.organType ||
                profile.requiredOrgan}
            </p>

            <StatusBadge
              status={
                activeRequest.status ||
                "pending"
              }
            />
          </div>
        </div>
      )}

      {!profile.isVerified && (
        <Alert
          variant="warning"
          className="mt-4"
        >
          <AlertTitle>
            Profile verification pending
          </AlertTitle>

          <AlertDescription>
            Your recipient profile must be verified before you can
            submit an organ request.
          </AlertDescription>
        </Alert>
      )}

      {!activeRequest &&
        latestRequest &&
        !isRequestActive(latestRequest) && (
          <p className="mt-4 text-xs text-slate-500">
            Your latest request was{" "}
            {formatLabel(
              latestRequest.status
            )}{" "}
            on{" "}
            {formatDate(
              latestRequest.updatedAt ||
                latestRequest.createdAt
            )}
            .
          </p>
        )}

      <Button
        type="button"
        fullWidth
        leftIcon={ClipboardPlus}
        loading={isSubmitting}
        loadingText="Submitting request..."
        disabled={!canSubmit}
        onClick={onSubmitRequest}
        className="mt-5 bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-100"
      >
        {activeRequest
          ? "Request already active"
          : !profile.isVerified
            ? "Verification required"
            : "Submit organ request"}
      </Button>
    </section>
  );
}

function RequestHistory({ requests }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5">
        <p className="text-sm font-semibold text-blue-600">
          Request history
        </p>

        <h2 className="mt-1 text-xl font-bold text-slate-950">
          Your organ requests
        </h2>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          Review the status and submission date of your current and
          previous care requests.
        </p>
      </div>

      {requests.length ? (
        <div className="divide-y divide-slate-100">
          {requests.map((request, index) => (
            <RequestHistoryItem
              key={
                request._id ||
                request.id ||
                index
              }
              request={request}
            />
          ))}
        </div>
      ) : (
        <div className="px-6 py-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <ClipboardPlus
              className="h-6 w-6"
              aria-hidden="true"
            />
          </span>

          <p className="mt-4 font-semibold text-slate-950">
            No organ requests submitted
          </p>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Once your profile is verified, you can submit an organ
            request from the care-request panel.
          </p>
        </div>
      )}
    </section>
  );
}

function RequestHistoryItem({ request }) {
  return (
    <article className="p-5 transition hover:bg-slate-50/70">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-slate-900">
            {request.organType ||
              "Organ request"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>
              Urgency:{" "}
              {request.urgencyLevel ||
                "Not specified"}
            </span>

            <span aria-hidden="true">
              •
            </span>

            <span>
              Submitted{" "}
              {formatDate(
                request.createdAt
              )}
            </span>
          </div>
        </div>

        <StatusBadge
          status={
            request.status || "pending"
          }
          label={formatLabel(
            request.status,
            "Pending"
          )}
        />
      </div>
    </article>
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
  const errorId = error
    ? `${id}-error`
    : undefined;

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

            <span className="sr-only">
              Required
            </span>
          </>
        )}
      </label>

      <select
        id={id}
        required={required}
        aria-invalid={
          Boolean(error) || undefined
        }
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

function Metric({
  icon: Icon,
  label,
  value,
  color,
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    violet:
      "bg-violet-50 text-violet-600",
    emerald:
      "bg-emerald-50 text-emerald-600",
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <span
        className={`grid h-11 w-11 place-items-center rounded-xl ${
          colors[color] || colors.blue
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
        {value || "Not set"}
      </p>
    </article>
  );
}

function RecipientDashboardSkeleton() {
  return (
    <div
      className="space-y-6"
      role="status"
      aria-label="Loading recipient workspace"
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

      <div className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white" />
    </div>
  );
}
