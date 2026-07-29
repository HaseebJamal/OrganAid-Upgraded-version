import { useState } from "react";
import {
  Building2,
  Clock3,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  ShieldCheck,
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

const initialForm = {
  name: "",
  email: "",
  subject: "",
  inquiryType: "general",
  message: "",
};

const inquiryTypes = [
  {
    value: "general",
    label: "General inquiry",
  },
  {
    value: "support",
    label: "Technical support",
  },
  {
    value: "hospital",
    label: "Hospital onboarding",
  },
  {
    value: "partnership",
    label: "Partnership",
  },
  {
    value: "privacy",
    label: "Privacy or data concern",
  },
];

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    fallback
  );
}

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

    if (submitted) {
      setSubmitted(false);
    }
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Your name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Your email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email.trim()
      )
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.subject.trim()) {
      nextErrors.subject = "A subject is required.";
    }

    if (!form.message.trim()) {
      nextErrors.message = "Your message is required.";
    } else if (form.message.trim().length < 10) {
      nextErrors.message =
        "Please provide at least 10 characters.";
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

      /*
       * Connect your backend contact service here.
       *
       * Example:
       *
       * await contactService.sendMessage({
       *   name: form.name.trim(),
       *   email: form.email.trim().toLowerCase(),
       *   subject: form.subject.trim(),
       *   inquiryType: form.inquiryType,
       *   message: form.message.trim(),
       * });
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 900)
      );

      setSubmitted(true);
      setForm(initialForm);
      setErrors({});

      toast.success("Your message has been sent.");
    } catch (error) {
      toast.error(
        getErrorMessage(
          error,
          "Your message could not be sent."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <ContactHero />

      <ContactDetails />

      <ContactFormSection
        form={form}
        errors={errors}
        submitted={submitted}
        isSubmitting={isSubmitting}
        updateField={updateField}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function ContactHero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.32),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.15),transparent_35%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-red-100 backdrop-blur">
          <MessageSquareText
            className="h-4 w-4"
            aria-hidden="true"
          />
          OrganAid support and partnerships
        </span>

        <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">
          Contact the OrganAid team
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
          Reach out about technical support, hospital onboarding,
          partnerships, privacy concerns, or general platform
          questions.
        </p>
      </div>
    </section>
  );
}

function ContactDetails() {
  const items = [
    {
      icon: Mail,
      title: "Email",
      value: "support@organaid.pk",
      href: "mailto:support@organaid.pk",
      description: "General support and platform questions",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+92 300 1234567",
      href: "tel:+923001234567",
      description: "Business-hours support contact",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Faisalabad, Pakistan",
      description: "Project and coordination base",
    },
    {
      icon: Clock3,
      title: "Support hours",
      value: "Monday–Friday, 9:00 AM–5:00 PM",
      description: "Urgent medical issues should go to emergency services",
    },
  ];

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <ContactCard
              key={item.title}
              {...item}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactFormSection({
  form,
  errors,
  submitted,
  isSubmitting,
  updateField,
  onSubmit,
}) {
  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <aside className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-7 text-white sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600 shadow-lg shadow-red-950/40">
            <ShieldCheck
              className="h-6 w-6"
              aria-hidden="true"
            />
          </span>

          <h2 className="mt-6 text-2xl font-bold tracking-tight">
            Before you send a message
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Please avoid including private medical records, passwords,
            national identification numbers, or confidential donor and
            recipient information in this public contact form.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start gap-3">
              <Building2
                className="mt-0.5 h-5 w-5 shrink-0 text-red-300"
                aria-hidden="true"
              />

              <div>
                <p className="font-semibold">
                  Hospital onboarding
                </p>

                <p className="mt-2 text-xs leading-6 text-slate-300">
                  Include your organization name, registration context,
                  and official contact details so the onboarding request
                  can be routed correctly.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
            <p className="text-sm font-semibold text-amber-200">
              Medical emergencies
            </p>

            <p className="mt-2 text-xs leading-6 text-amber-100/80">
              This form is not an emergency service. Contact local
              emergency services or a qualified healthcare provider
              when immediate medical assistance is required.
            </p>
          </div>
        </aside>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-semibold text-red-600">
              Send a message
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              How can we help?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Complete the form and provide enough context for the
              OrganAid team to review your inquiry.
            </p>
          </div>

          {submitted && (
            <Alert
              variant="success"
              className="mt-6"
            >
              <AlertTitle>Message sent</AlertTitle>

              <AlertDescription>
                Thank you for contacting OrganAid. Your inquiry has
                been recorded successfully.
              </AlertDescription>
            </Alert>
          )}

          <form
            onSubmit={onSubmit}
            className="mt-7 grid gap-5 sm:grid-cols-2"
            noValidate
          >
            <FormField
              label="Your name"
              name="name"
              required
              value={form.name}
              error={errors.name}
              disabled={isSubmitting}
              placeholder="Enter your full name"
              onChange={(event) =>
                updateField("name", event.target.value)
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
              disabled={isSubmitting}
              placeholder="you@example.com"
              onChange={(event) =>
                updateField("email", event.target.value)
              }
            />

            <div className="space-y-2">
              <label
                htmlFor="inquiryType"
                className="block text-sm font-semibold text-slate-800"
              >
                Inquiry type
              </label>

              <select
                id="inquiryType"
                value={form.inquiryType}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateField("inquiryType", event.target.value)
                }
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-70"
              >
                {inquiryTypes.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <FormField
              label="Subject"
              name="subject"
              required
              value={form.subject}
              error={errors.subject}
              disabled={isSubmitting}
              placeholder="Briefly describe your inquiry"
              onChange={(event) =>
                updateField("subject", event.target.value)
              }
            />

            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="contact-message"
                  className="text-sm font-semibold text-slate-800"
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
                  {form.message.length}/1200
                </span>
              </div>

              <Textarea
                id="contact-message"
                value={form.message}
                maxLength={1200}
                rows={7}
                disabled={isSubmitting}
                error={Boolean(errors.message)}
                placeholder="Write your message..."
                aria-describedby={
                  errors.message
                    ? "contact-message-error"
                    : "contact-message-hint"
                }
                onChange={(event) =>
                  updateField("message", event.target.value)
                }
              />

              {errors.message ? (
                <p
                  id="contact-message-error"
                  className="mt-2 text-xs font-medium text-red-600"
                  role="alert"
                >
                  {errors.message}
                </p>
              ) : (
                <p
                  id="contact-message-hint"
                  className="mt-2 text-xs leading-5 text-slate-500"
                >
                  Do not include confidential medical or identity
                  information.
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <Button
                type="submit"
                fullWidth
                size="lg"
                leftIcon={Send}
                loading={isSubmitting}
                loadingText="Sending message..."
              >
                Send message
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function ContactCard({
  icon: Icon,
  title,
  value,
  description,
  href,
}) {
  const content = (
    <>
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
        <Icon
          className="h-5 w-5"
          aria-hidden="true"
        />
      </span>

      <h2 className="mt-5 font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-2 break-words text-sm font-semibold text-slate-700">
        {value}
      </p>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </>
  );

  const className =
    "group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg hover:shadow-slate-200/70";

  if (href) {
    return (
      <a
        href={href}
        className={className}
      >
        {content}
      </a>
    );
  }

  return (
    <article className={className}>
      {content}
    </article>
  );
}