import {
  ArrowRight,
  Bell,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  Hospital,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Create an account",
    description:
      "Register as a donor, recipient, or hospital representative and access a workspace designed for your role.",
    points: [
      "Choose the correct account type",
      "Provide basic contact information",
      "Receive role-based dashboard access",
    ],
  },
  {
    number: "02",
    icon: FileText,
    title: "Complete your profile",
    description:
      "Add the medical, personal, or institutional information required for your OrganAid workflow.",
    points: [
      "Donors provide donation and availability details",
      "Recipients provide medical and organ-request details",
      "Hospitals provide registration information",
    ],
  },
  {
    number: "03",
    icon: Hospital,
    title: "Submit records for review",
    description:
      "Upload supported documents and submit profile information for review by authorized participants.",
    points: [
      "Medical reports can be uploaded",
      "Hospital profiles enter an approval workflow",
      "Sensitive actions remain permission-controlled",
    ],
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Verification and authorization",
    description:
      "Hospitals and administrators review the information relevant to their responsibilities before protected features become available.",
    points: [
      "Hospital registration is reviewed",
      "Donor and recipient profiles may require verification",
      "Backend permissions control sensitive actions",
    ],
  },
  {
    number: "05",
    icon: ClipboardCheck,
    title: "Request and coordination",
    description:
      "Verified users can participate in approved workflows such as donor availability, recipient requests, and clinical review queues.",
    points: [
      "Recipients can submit approved requests",
      "Hospitals can review authorized records",
      "Users can follow current request status",
    ],
  },
  {
    number: "06",
    icon: Bell,
    title: "Receive status updates",
    description:
      "OrganAid displays notifications and workflow updates when important profile, verification, or request activity occurs.",
    points: [
      "Review account notifications",
      "Track verification changes",
      "Follow request and profile history",
    ],
  },
];

const roleJourneys = [
  {
    icon: HeartHandshake,
    title: "Donor journey",
    description:
      "Create a donor profile, provide medical information, upload records, manage availability, and follow verification updates.",
  },
  {
    icon: ClipboardCheck,
    title: "Recipient journey",
    description:
      "Complete a care profile, receive verification, submit an organ request, and track its current status.",
  },
  {
    icon: Hospital,
    title: "Hospital journey",
    description:
      "Register the organization, complete verification, and access authorized donor and recipient review workflows.",
  },
];

export default function HowItWorks() {
  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <HeroSection />

      <ProcessSection />

      <RoleJourneySection />

      <TrustSection />

      <FinalCallToAction />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.34),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.16),transparent_35%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-red-100 backdrop-blur">
          <ClipboardCheck
            className="h-4 w-4"
            aria-hidden="true"
          />
          OrganAid workflow
        </span>

        <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">
          How OrganAid works
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-300">
          OrganAid guides donors, recipients, hospitals, and
          administrators through structured registration,
          verification, document, request, and coordination
          workflows.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/register"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300/30"
          >
            Create an account
            <ArrowRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>

          <Link
            to="/faq"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
          >
            Read common questions
          </Link>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Step-by-step process"
          title="A clear workflow from registration to coordination"
          description="Each stage gives users a clear understanding of what information is needed, who reviews it, and what happens next."
        />

        <div className="relative mt-14">
          <div
            className="absolute bottom-8 left-7 top-8 hidden w-px bg-slate-200 md:block"
            aria-hidden="true"
          />

          <div className="space-y-6">
            {steps.map((step) => (
              <ProcessStep
                key={step.number}
                {...step}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function RoleJourneySection() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Role-specific experience"
          title="Different users follow different care pathways"
          description="OrganAid separates responsibilities so each role sees only the tools and information relevant to its workflow."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {roleJourneys.map((journey) => (
            <RoleJourneyCard
              key={journey.title}
              {...journey}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
        <div>
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-100">
            <ShieldCheck
              className="h-7 w-7"
              aria-hidden="true"
            />
          </span>

          <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-red-600">
            Important responsibility
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            OrganAid supports healthcare coordination
          </h2>

          <p className="mt-5 text-base leading-8 text-slate-600">
            The platform organizes information and workflows, but it
            does not make medical decisions or independently approve
            organ transplants.
          </p>
        </div>

        <div className="space-y-4">
          <TrustPoint>
            Final medical eligibility and compatibility must be
            determined by qualified healthcare professionals.
          </TrustPoint>

          <TrustPoint>
            Hospital and administrator permissions must be verified
            and enforced by the backend.
          </TrustPoint>

          <TrustPoint>
            Uploaded medical records should be validated, protected,
            and accessible only to authorized users.
          </TrustPoint>

          <TrustPoint>
            OrganAid is not an emergency service or a replacement for
            immediate medical care.
          </TrustPoint>
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="pb-20 sm:pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-800 px-6 py-12 text-center text-white shadow-xl shadow-red-100 sm:px-10 sm:py-14">
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-3xl">
            <HeartHandshake
              className="mx-auto h-10 w-10 text-red-100"
              aria-hidden="true"
            />

            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              Ready to begin your OrganAid journey?
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-red-100 sm:text-base">
              Create an account and complete the profile required for
              your donor, recipient, or hospital workflow.
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
                Contact support
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

function ProcessStep({
  number,
  icon: Icon,
  title,
  description,
  points,
}) {
  return (
    <article className="relative grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg md:grid-cols-[3.5rem_1fr] md:gap-6 md:p-6">
      <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-100">
        <Icon
          className="h-6 w-6"
          aria-hidden="true"
        />
      </span>

      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
          Step {number}
        </p>

        <h3 className="mt-1 text-xl font-bold text-slate-950">
          {title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          {description}
        </p>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {points.map((point) => (
            <li
              key={point}
              className="flex items-start gap-2 text-sm text-slate-600"
            >
              <CheckIcon />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

function RoleJourneyCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
        <Icon
          className="h-6 w-6"
          aria-hidden="true"
        />
      </span>

      <h3 className="mt-5 text-xl font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        {description}
      </p>
    </article>
  );
}

function TrustPoint({ children }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <ShieldCheck
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
      </span>

      <p className="text-sm leading-6 text-slate-600">
        {children}
      </p>
    </div>
  );
}

function CheckIcon() {
  return (
    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
      <ShieldCheck
        className="h-3 w-3"
        aria-hidden="true"
      />
    </span>
  );
}