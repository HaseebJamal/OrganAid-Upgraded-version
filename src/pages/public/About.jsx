import {
  Activity,
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  HeartHandshake,
  HeartPulse,
  Hospital,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const trustFeatures = [
  {
    icon: ShieldCheck,
    title: "Verified participation",
    description:
      "Role-based workflows help administrators and authorized hospitals review submitted profiles before sensitive coordination begins.",
  },
  {
    icon: UsersRound,
    title: "Connected stakeholders",
    description:
      "Donors, recipients, hospitals, and administrators work through dedicated dashboards designed around their responsibilities.",
  },
  {
    icon: Activity,
    title: "Structured matching support",
    description:
      "OrganAid organizes blood group, organ type, urgency, availability, and verification data to support compatibility review.",
  },
];

const processSteps = [
  {
    number: "01",
    icon: UsersRound,
    title: "Account registration",
    description:
      "A user registers as a donor, recipient, or hospital representative and receives access to the appropriate workspace.",
  },
  {
    number: "02",
    icon: ClipboardCheck,
    title: "Profile completion",
    description:
      "Medical, contact, and organizational information is submitted through structured and validated forms.",
  },
  {
    number: "03",
    icon: Hospital,
    title: "Authorized review",
    description:
      "Relevant profiles and requests can be reviewed by verified hospitals and platform administrators.",
  },
  {
    number: "04",
    icon: HeartHandshake,
    title: "Compatibility coordination",
    description:
      "The platform supports review of donor and recipient information needed for safe clinical coordination.",
  },
  {
    number: "05",
    icon: HeartPulse,
    title: "Care pathway updates",
    description:
      "Participants receive notifications, status updates, and request history throughout the workflow.",
  },
];

const principles = [
  {
    icon: ShieldCheck,
    title: "Safety first",
    description:
      "Clinical decisions remain the responsibility of qualified healthcare professionals.",
  },
  {
    icon: LockKeyhole,
    title: "Privacy by design",
    description:
      "Access should be limited by role, authorization, and the minimum information needed for each workflow.",
  },
  {
    icon: Scale,
    title: "Ethical coordination",
    description:
      "The platform is designed to support transparent review and accountable decision-making.",
  },
];

export default function About() {
  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <HeroSection />

      <StorySection />

      <MissionSection />

      <ProcessSection />

      <PrinciplesSection />

      <FinalCallToAction />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.35),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.18),transparent_35%)]"
        aria-hidden="true"
      />

      <div
        className="absolute left-1/2 top-16 h-72 w-72 -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-red-100 backdrop-blur">
            <HeartPulse
              className="h-4 w-4"
              aria-hidden="true"
            />
            Digital organ-donation coordination
          </span>

          <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Building a more connected organ-donation ecosystem
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
            OrganAid brings donors, recipients, hospitals, and
            administrators into one structured platform for profile
            verification, medical-document management, request tracking,
            and healthcare coordination.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 text-sm font-semibold text-white shadow-lg shadow-red-950/30 transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-red-300/30"
            >
              Join OrganAid
              <ArrowRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/how-it-works"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
            >
              Explore the workflow
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function StorySection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:px-8">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-600">
            Why OrganAid exists
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            The challenge is not only medical—it is also operational
          </h2>

          <p className="mt-6 text-base leading-8 text-slate-600">
            Organ-donation workflows involve multiple participants,
            sensitive records, verification steps, changing availability,
            and urgent communication. When those activities are fragmented,
            coordination becomes slower and harder to audit.
          </p>

          <p className="mt-5 text-base leading-8 text-slate-600">
            OrganAid addresses that problem by providing dedicated
            role-based workspaces, structured profile data, secure document
            handling, review queues, notifications, and request histories in
            one system.
          </p>

          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5">
            <div className="flex items-start gap-3">
              <Sparkles
                className="mt-0.5 h-5 w-5 shrink-0 text-red-600"
                aria-hidden="true"
              />

              <div>
                <p className="font-semibold text-slate-950">
                  Important clinical boundary
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  OrganAid supports coordination and review. It does not
                  replace clinical testing, medical judgment, transplant
                  committees, or applicable legal procedures.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {trustFeatures.map((feature) => (
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

function MissionSection() {
  return (
    <section className="bg-slate-950 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-600 shadow-lg shadow-red-950/40">
          <HeartHandshake
            className="h-7 w-7"
            aria-hidden="true"
          />
        </span>

        <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-red-300">
          Our mission
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Make organ-donation coordination clearer, safer, and more
          accountable
        </h2>

        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-300">
          Our goal is to reduce administrative friction, improve
          communication, preserve workflow history, and give every
          authorized participant a clearer view of what happens next.
        </p>
      </div>
    </section>
  );
}

function ProcessSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-600">
            Trusted workflow
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            How OrganAid supports the care pathway
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Each stage is structured so that users understand their
            responsibilities, current status, and next action.
          </p>
        </div>

        <div className="relative mt-14">
          <div
            className="absolute bottom-8 left-7 top-8 hidden w-px bg-slate-200 sm:block"
            aria-hidden="true"
          />

          <div className="space-y-5">
            {processSteps.map((step) => (
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

function PrinciplesSection() {
  return (
    <section className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-600">
            Core principles
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Designed around trust and responsibility
          </h2>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Healthcare technology must be clear about what it does, who may
            use it, and where professional judgment remains essential.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {principles.map((principle) => (
            <PrincipleCard
              key={principle.title}
              {...principle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCallToAction() {
  return (
    <section className="py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-red-800 px-6 py-12 text-center text-white shadow-xl shadow-red-100 sm:px-10 sm:py-14">
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <HeartPulse
              className="mx-auto h-10 w-10 text-red-100"
              aria-hidden="true"
            />

            <h2 className="mt-5 text-3xl font-bold tracking-tight">
              Better coordination begins with informed participation
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-red-100 sm:text-base">
              Create an account to build your profile, manage requests,
              upload records, and follow the OrganAid workflow.
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              >
                Create an account
                <ArrowRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>

              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/20"
              >
                Contact the team
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-lg hover:shadow-slate-200/70">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600 transition group-hover:bg-red-600 group-hover:text-white">
          <Icon
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div>
          <h3 className="font-bold text-slate-950">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
      </div>
    </article>
  );
}

function ProcessStep({
  number,
  icon: Icon,
  title,
  description,
}) {
  return (
    <article className="relative flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:gap-6 sm:p-6">
      <span className="relative z-10 grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-red-600 text-white shadow-lg shadow-red-100">
        <Icon
          className="h-6 w-6"
          aria-hidden="true"
        />
      </span>

      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
          Step {number}
        </p>

        <h3 className="mt-1 text-lg font-bold text-slate-950">
          {title}
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </article>
  );
}

function PrincipleCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/70">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
        <Icon
          className="h-6 w-6"
          aria-hidden="true"
        />
      </span>

      <h3 className="mt-5 text-lg font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <CheckCircle2
        className="mx-auto mt-5 h-5 w-5 text-emerald-600"
        aria-hidden="true"
      />
    </article>
  );
}