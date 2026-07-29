import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  HeartPulse,
  Hospital,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const workflowSteps = [
  {
    number: "01",
    icon: UsersRound,
    title: "Create an account",
    description:
      "Register as a donor, recipient, or hospital representative and access a dedicated role-based workspace.",
  },
  {
    number: "02",
    icon: FileText,
    title: "Complete your profile",
    description:
      "Provide the medical, contact, and organizational information required for the relevant workflow.",
  },
  {
    number: "03",
    icon: ShieldCheck,
    title: "Verification and review",
    description:
      "Authorized hospitals and administrators review submitted information before protected actions become available.",
  },
  {
    number: "04",
    icon: HeartHandshake,
    title: "Coordinate care",
    description:
      "Verified participants can follow requests, availability, documents, notifications, and review activity.",
  },
];

const platformFeatures = [
  {
    icon: LockKeyhole,
    title: "Role-based access",
    description:
      "Donors, recipients, hospitals, and administrators receive separate dashboards and permissions.",
  },
  {
    icon: Hospital,
    title: "Hospital verification",
    description:
      "Hospital registration details are reviewed before clinical queues and coordination tools are enabled.",
  },
  {
    icon: ClipboardCheck,
    title: "Structured review",
    description:
      "Profiles, organ requests, and verification records move through clear, trackable workflows.",
  },
  {
    icon: Activity,
    title: "Status visibility",
    description:
      "Users can view verification, availability, request, report, and notification status from their dashboard.",
  },
  {
    icon: FileText,
    title: "Medical documents",
    description:
      "Supported reports can be uploaded and accessed through authenticated, permission-controlled workflows.",
  },
  {
    icon: HeartPulse,
    title: "Compatibility support",
    description:
      "OrganAid organizes blood group, organ type, availability, urgency, and verification information for review.",
  },
];

const userRoles = [
  {
    icon: HeartHandshake,
    title: "Donors",
    description:
      "Maintain a donor profile, update availability, upload reports, and follow verification updates.",
    link: "/register",
    action: "Register as a donor",
  },
  {
    icon: UserCheck,
    title: "Recipients",
    description:
      "Manage medical information, follow verification, and submit an organ request after approval.",
    link: "/register",
    action: "Register as a recipient",
  },
  {
    icon: Building2,
    title: "Hospitals",
    description:
      "Create an institutional profile and participate in authorized review and care-coordination workflows.",
    link: "/register",
    action: "Register a hospital",
  },
];

const trustPoints = [
  "Final medical suitability remains the responsibility of qualified healthcare professionals.",
  "Administrator and hospital actions must be authorized and enforced by the backend.",
  "Sensitive data should be accessible only to users with a legitimate workflow requirement.",
  "OrganAid is a coordination platform and not an emergency medical service.",
];

export default function Home() {
  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <HeroSection />

      <RoleSection />

      <WorkflowSection />

      <FeatureSection />

      <TrustSection />

      <AwarenessSection />

      <FinalCallToAction />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.38),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.18),transparent_38%)]"
        aria-hidden="true"
      />

      <div
        className="absolute left-1/2 top-10 h-80 w-80 -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 py-20 sm:px-6 sm:py-24 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:px-8 lg:py-28">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-red-100 backdrop-blur">
            <HeartPulse
              className="h-4 w-4"
              aria-hidden="true"
            />
            Digital organ-donation coordination
          </span>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Connect care.
            <span className="block text-red-400">
              Coordinate with confidence.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            OrganAid connects donors, recipients, hospitals, and
            administrators through structured profiles, verification
            workflows, organ requests, medical-document management, and
            secure role-based dashboards.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300/30"
            >
              Create an account
              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/how-it-works"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
            >
              See how it works
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
            <TrustItem text="Role-based dashboards" />
            <TrustItem text="Verified workflows" />
            <TrustItem text="Request tracking" />
          </div>
        </div>

        <HeroDashboardPreview />
      </div>
    </section>
  );
}

function HeroDashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-lg">
      <div
        className="absolute -inset-6 rounded-full bg-red-600/20 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-600 text-white">
              <HeartPulse
                className="h-5 w-5"
                aria-hidden="true"
              />
            </span>

            <div>
              <p className="font-bold text-white">
                OrganAid workspace
              </p>

              <p className="text-xs text-slate-400">
                Secure care coordination
              </p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">
            Protected
          </span>
        </div>

        <div className="mt-6 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-red-100">
            Current workflow
          </p>

          <p className="mt-2 text-xl font-bold text-white">
            Profile verification
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-3/4 rounded-full bg-white" />
          </div>

          <div className="mt-3 flex justify-between text-xs text-red-100">
            <span>Profile complete</span>
            <span>75%</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <PreviewMetric
            icon={ShieldCheck}
            label="Verification"
            value="Pending"
          />

          <PreviewMetric
            icon={FileText}
            label="Documents"
            value="Uploaded"
          />

          <PreviewMetric
            icon={HeartHandshake}
            label="Availability"
            value="Managed"
          />

          <PreviewMetric
            icon={ClipboardCheck}
            label="Requests"
            value="Tracked"
          />
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <Activity
              className="mt-0.5 h-5 w-5 shrink-0 text-red-300"
              aria-hidden="true"
            />

            <div>
              <p className="text-sm font-semibold text-white">
                Structured status updates
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Follow profile, verification, request, and notification
                activity from one workspace.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoleSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Built for every participant"
          title="One platform, dedicated role-based experiences"
          description="Each participant receives tools designed around their responsibilities in the OrganAid workflow."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {userRoles.map((role) => (
            <RoleCard
              key={role.title}
              {...role}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="How OrganAid works"
          title="A clear path from registration to coordination"
          description="The workflow is designed to make responsibilities, verification status, and next steps easier to understand."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {workflowSteps.map((step) => (
            <WorkflowCard
              key={step.number}
              {...step}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            Explore the complete workflow
            <ArrowRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Platform capabilities"
          title="Professional tools for transparent coordination"
          description="OrganAid brings essential profile, document, request, review, and communication functionality into one system."
        />

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {platformFeatures.map((feature) => (
            <FeatureCard
              key={feature.title}
              {...feature}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="bg-slate-950 py-20 text-white sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <div>
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-600 shadow-lg shadow-red-950/40">
            <ShieldCheck
              className="h-7 w-7"
              aria-hidden="true"
            />
          </span>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-red-300">
            Responsible healthcare technology
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Designed to support professionals—not replace them
          </h2>

          <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
            OrganAid structures coordination and information flow, while
            clinical evaluation, final compatibility, ethical approval,
            and transplant decisions remain with authorized healthcare
            professionals and institutions.
          </p>
        </div>

        <div className="space-y-4">
          {trustPoints.map((point) => (
            <div
              key={point}
              className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <CheckCircle2
                className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300"
                aria-hidden="true"
              />

              <p className="text-sm leading-6 text-slate-300">
                {point}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AwarenessSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-600">
            Awareness and participation
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Better systems begin with informed communities
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-600">
            Organ donation requires trust, accurate information, ethical
            oversight, and participation from healthcare institutions and
            communities.
          </p>

          <p className="mt-5 text-base leading-8 text-slate-600">
            OrganAid helps make the administrative journey easier to
            understand by showing users their current status, required
            actions, verification progress, and request history.
          </p>

          <Link
            to="/about"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
          >
            Learn more about OrganAid
            <ArrowRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div
            className="absolute -inset-8 rounded-full bg-red-100 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-8 shadow-xl shadow-red-100/60 sm:p-10">
            <span className="grid h-16 w-16 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-200">
              <HeartHandshake
                className="h-8 w-8"
                aria-hidden="true"
              />
            </span>

            <h3 className="mt-6 text-2xl font-bold text-slate-950">
              Participation should be informed and voluntary
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Users should understand what information is collected, who
              may review it, and which clinical and legal steps remain
              outside the platform.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <Sparkles
                  className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                  aria-hidden="true"
                />

                <p className="text-sm leading-6 text-slate-600">
                  Clear consent, privacy controls, audit history, and
                  backend authorization are essential future-production
                  requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="pb-20 sm:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-800 px-6 py-12 text-center text-white shadow-xl shadow-red-100 sm:px-10 sm:py-16">
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-3xl">
            <HeartPulse
              className="mx-auto h-10 w-10 text-red-100"
              aria-hidden="true"
            />

            <h2 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Take the next step with OrganAid
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-red-100 sm:text-base">
              Create an account to complete your profile, manage records,
              follow verification, and participate in authorized
              organ-donation workflows.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              >
                Register now
                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                Contact OrganAid
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-600">
        {eyebrow}
      </p>

      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>

      <p className="mt-4 text-base leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function RoleCard({
  icon: Icon,
  title,
  description,
  link,
  action,
}) {
  return (
    <article className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-red-200 hover:shadow-xl hover:shadow-slate-200/70">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
        <Icon
          className="h-6 w-6"
          aria-hidden="true"
        />
      </span>

      <h3 className="mt-5 text-xl font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">
        {description}
      </p>

      <Link
        to={link}
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red-600 transition hover:text-red-700"
      >
        {action}
        <ArrowRight
          className="h-4 w-4"
          aria-hidden="true"
        />
      </Link>
    </article>
  );
}

function WorkflowCard({
  number,
  icon: Icon,
  title,
  description,
}) {
  return (
    <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <span className="absolute right-5 top-4 text-4xl font-black text-slate-100">
        {number}
      </span>

      <span className="relative grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600">
        <Icon
          className="h-5 w-5"
          aria-hidden="true"
        />
      </span>

      <h3 className="relative mt-5 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="relative mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg hover:shadow-slate-200/70">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
        <Icon
          className="h-5 w-5"
          aria-hidden="true"
        />
      </span>

      <h3 className="mt-5 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function TrustItem({ text }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CheckCircle2
        className="h-4 w-4 text-emerald-300"
        aria-hidden="true"
      />
      {text}
    </span>
  );
}

function PreviewMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <Icon
        className="h-5 w-5 text-red-300"
        aria-hidden="true"
      />

      <p className="mt-3 text-xs text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}