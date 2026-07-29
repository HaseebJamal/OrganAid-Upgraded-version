import { useMemo, useState } from "react";
import {
  AtSign,
  BellRing,
  Mail,
  Send,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";

import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import Textarea from "../../components/ui/Textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../components/ui/Alert";
import { StatusBadge } from "../../components/ui/Badge";

import { sendNotification } from "../../services/adminService";

const initialForm = {
  target: "role",
  role: "all",
  email: "",
  title: "",
  message: "",
};

const roleOptions = [
  {
    value: "all",
    label: "All active members",
  },
  {
    value: "donor",
    label: "Donors",
  },
  {
    value: "recipient",
    label: "Recipients",
  },
  {
    value: "hospital",
    label: "Hospitals",
  },
  {
    value: "admin",
    label: "Administrators",
  },
];

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function Notifications() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const recipientLabel = useMemo(() => {
    if (form.target === "email") {
      return form.email.trim() || "Specific email";
    }

    return (
      roleOptions.find((option) => option.value === form.role)
        ?.label || "Selected role"
    );
  }, [form.email, form.role, form.target]);

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

    setLastResult(null);
  }

  function validateForm() {
    const nextErrors = {};

    if (form.target === "email") {
      if (!form.email.trim()) {
        nextErrors.email = "Recipient email is required.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
      ) {
        nextErrors.email = "Enter a valid email address.";
      }
    }

    if (!form.title.trim()) {
      nextErrors.title = "Notification title is required.";
    } else if (form.title.trim().length < 3) {
      nextErrors.title =
        "Notification title must contain at least 3 characters.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Notification message is required.";
    } else if (form.message.trim().length < 10) {
      nextErrors.message =
        "Notification message must contain at least 10 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm() || isSending) return;

    try {
      setIsSending(true);
      setLastResult(null);

      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        ...(form.target === "email"
          ? {
              email: form.email.trim().toLowerCase(),
            }
          : {
              role: form.role,
            }),
      };

      const response = await sendNotification(payload);

      const recipientCount = Number(
        response?.count ??
          response?.data?.count ??
          0
      );

      toast.success(
        `Notification sent to ${recipientCount} recipient${
          recipientCount === 1 ? "" : "s"
        }.`
      );

      setLastResult({
        count: recipientCount,
        recipient: recipientLabel,
        title: form.title.trim(),
      });

      setForm((current) => ({
        ...current,
        title: "",
        message: "",
      }));

      setErrors({});
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "The notification could not be sent."
        )
      );
    } finally {
      setIsSending(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setErrors({});
    setLastResult(null);
  }

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader />

      {lastResult && (
        <Alert variant="success">
          <AlertTitle>Notification sent successfully</AlertTitle>

          <AlertDescription>
            “{lastResult.title}” was sent to{" "}
            <strong>{lastResult.recipient}</strong> and reached{" "}
            <strong>
              {lastResult.count} recipient
              {lastResult.count === 1 ? "" : "s"}
            </strong>
            .
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
                <BellRing
                  className="h-5 w-5"
                  aria-hidden="true"
                />
              </span>

              <div>
                <CardTitle>Compose notification</CardTitle>

                <CardDescription>
                  Send a platform announcement to a user role or a
                  specific registered email address.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              noValidate
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label
                    htmlFor="notification-target"
                    className="block text-sm font-semibold text-slate-800"
                  >
                    Send to
                  </label>

                  <select
                    id="notification-target"
                    value={form.target}
                    disabled={isSending}
                    onChange={(event) =>
                      updateField("target", event.target.value)
                    }
                    className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
                  >
                    <option value="role">
                      A user role
                    </option>

                    <option value="email">
                      Specific email address
                    </option>
                  </select>
                </div>

                {form.target === "email" ? (
                  <FormField
                    label="Recipient email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    error={errors.email}
                    leftIcon={Mail}
                    disabled={isSending}
                    placeholder="member@example.com"
                    onChange={(event) =>
                      updateField("email", event.target.value)
                    }
                  />
                ) : (
                  <div className="space-y-2">
                    <label
                      htmlFor="notification-role"
                      className="block text-sm font-semibold text-slate-800"
                    >
                      Target role
                    </label>

                    <select
                      id="notification-role"
                      value={form.role}
                      disabled={isSending}
                      onChange={(event) =>
                        updateField("role", event.target.value)
                      }
                      className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
                    >
                      {roleOptions.map((option) => (
                        <option
                          key={option.value}
                          value={option.value}
                        >
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <FormField
                  label="Notification title"
                  name="title"
                  required
                  value={form.title}
                  error={errors.title}
                  leftIcon={AtSign}
                  disabled={isSending}
                  maxLength={100}
                  placeholder="Enter a clear notification title"
                  className="sm:col-span-2"
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  hint={`${form.title.length}/100 characters`}
                />

                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label
                      htmlFor="notification-message"
                      className="block text-sm font-semibold text-slate-800"
                    >
                      Message
                      <span
                        className="ml-1 text-red-600"
                        aria-hidden="true"
                      >
                        *
                      </span>
                    </label>

                    <span className="text-xs text-slate-400">
                      {form.message.length}/1000
                    </span>
                  </div>

                  <Textarea
                    id="notification-message"
                    value={form.message}
                    disabled={isSending}
                    error={Boolean(errors.message)}
                    maxLength={1000}
                    rows={7}
                    placeholder="Write the notification message..."
                    onChange={(event) =>
                      updateField("message", event.target.value)
                    }
                    aria-describedby={
                      errors.message
                        ? "notification-message-error"
                        : "notification-message-hint"
                    }
                  />

                  {errors.message ? (
                    <p
                      id="notification-message-error"
                      className="mt-2 text-xs font-medium text-red-600"
                      role="alert"
                    >
                      {errors.message}
                    </p>
                  ) : (
                    <p
                      id="notification-message-hint"
                      className="mt-2 text-xs leading-5 text-slate-500"
                    >
                      Keep the message concise and avoid including
                      confidential medical information.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSending}
                  onClick={resetForm}
                >
                  Reset form
                </Button>

                <Button
                  type="submit"
                  leftIcon={Send}
                  loading={isSending}
                  loadingText="Sending notification..."
                >
                  Send notification
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Delivery summary
              </CardTitle>

              <CardDescription>
                Review the target before sending.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <SummaryRow
                icon={UsersRound}
                label="Audience"
                value={recipientLabel}
              />

              <SummaryRow
                icon={BellRing}
                label="Delivery type"
                value="In-app notification"
              />

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <div className="mt-2">
                  <StatusBadge
                    status={
                      form.title.trim() &&
                      form.message.trim()
                        ? "ready"
                        : "pending"
                    }
                    label={
                      form.title.trim() &&
                      form.message.trim()
                        ? "Ready to send"
                        : "Draft incomplete"
                    }
                    icon={false}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert variant="warning">
            <AlertTitle>
              Avoid sensitive information
            </AlertTitle>

            <AlertDescription>
              Do not include diagnoses, organ-match details, medical
              records, or other confidential data in broad
              announcements.
            </AlertDescription>
          </Alert>
        </aside>
      </div>
    </div>
  );
}

function PageHeader() {
  return (
    <header>
      <p className="text-sm font-semibold text-red-600">
        Member communication
      </p>

      <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
        Notifications
      </h1>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
        Send secure platform announcements to user groups or
        individual registered accounts.
      </p>
    </header>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
        <Icon
          className="h-4 w-4"
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}