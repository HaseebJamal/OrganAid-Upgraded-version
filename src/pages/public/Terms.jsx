import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Gavel,
  Hospital,
  Lock,
  Mail,
  Scale,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "acceptance",
    number: "01",
    icon: FileText,
    title: "Acceptance of these terms",
    content:
      "By creating an account or using OrganAid, you agree to comply with these Terms and Conditions. If you do not agree with these terms, you should not use the platform.",
  },
  {
    id: "eligibility",
    number: "02",
    icon: UserCheck,
    title: "User eligibility",
    content:
      "Users must provide accurate information during registration. Donors, recipients, hospitals, and administrators are responsible for maintaining accurate and current profile information.",
  },
  {
    id: "acceptable-use",
    number: "03",
    icon: ShieldCheck,
    title: "Acceptable use",
    bullets: [
      "Use the platform only for lawful purposes.",
      "Provide truthful medical and personal information.",
      "Respect other users and healthcare professionals.",
      "Use only accounts assigned to you.",
      "Follow all applicable healthcare regulations.",
    ],
  },
  {
    id: "prohibited",
    number: "04",
    icon: AlertTriangle,
    title: "Prohibited activities",
    bullets: [
      "Creating fake donor or recipient profiles.",
      "Uploading fraudulent medical documents.",
      "Attempting unauthorized access.",
      "Interfering with platform security.",
      "Using OrganAid for illegal or unethical activities.",
    ],
  },
  {
    id: "medical",
    number: "05",
    icon: Hospital,
    title: "Medical responsibility",
    content:
      "OrganAid provides software that supports healthcare workflows. Medical decisions, diagnosis, donor suitability, recipient eligibility, compatibility assessments, and transplant procedures remain the responsibility of qualified healthcare professionals.",
  },
  {
    id: "security",
    number: "06",
    icon: Lock,
    title: "Account security",
    content:
      "Users are responsible for protecting their login credentials and must immediately report suspected unauthorized account access or security incidents.",
  },
  {
    id: "liability",
    number: "07",
    icon: Scale,
    title: "Limitation of liability",
    content:
      "OrganAid is not responsible for clinical decisions, treatment outcomes, transplant availability, medical emergencies, hospital decisions, or delays caused by external healthcare providers or regulatory requirements.",
  },
  {
    id: "termination",
    number: "08",
    icon: Gavel,
    title: "Account suspension or termination",
    content:
      "Accounts may be suspended or permanently removed for fraudulent activity, policy violations, misuse of medical information, or actions that threaten platform security or other users.",
  },
];

export default function Terms() {
  return (
    <div className="overflow-hidden bg-white">
      <Hero />

      <section className="py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[260px_1fr]">

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="px-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                Sections
              </p>

              <nav className="mt-3 space-y-1">
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
                  >
                    {section.number}. {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <main className="space-y-6">
            <Notice />

            {sections.map((section) => (
              <Section
                key={section.id}
                {...section}
              />
            ))}

            <Changes />

            <Contact />
          </main>
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,.35),transparent_35%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold">
          <FileText className="h-4 w-4" />
          Terms & Conditions
        </span>

        <h1 className="mt-6 text-5xl font-bold">
          OrganAid Terms of Use
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-300">
          These terms explain the rules, responsibilities, and acceptable
          use of the OrganAid platform.
        </p>

        <p className="mt-6 text-sm text-slate-400">
          Last updated: July 2026
        </p>
      </div>
    </section>
  );
}

function Notice() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />

        <div>
          <h2 className="font-bold text-amber-900">
            Educational project notice
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            This document should be reviewed and updated before any real
            production deployment. Healthcare systems are subject to
            country-specific laws, healthcare regulations, and privacy
            requirements.
          </p>
        </div>
      </div>
    </div>
  );
}

function Section({
  id,
  number,
  icon: Icon,
  title,
  content,
  bullets,
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-red-600">
            Section {number}
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {title}
          </h2>
        </div>
      </div>

      {content && (
        <p className="mt-6 leading-7 text-slate-600">
          {content}
        </p>
      )}

      {bullets && (
        <ul className="mt-6 space-y-3">
          {bullets.map((item) => (
            <li
              key={item}
              className="flex gap-3"
            >
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />

              <span className="text-slate-600">
                {item}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Changes() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <h2 className="text-2xl font-bold">
        Changes to these terms
      </h2>

      <p className="mt-4 leading-7 text-slate-600">
        OrganAid may update these Terms and Conditions as platform
        features, legal requirements, or operational procedures change.
        Continued use of the platform after updates indicates acceptance
        of the revised terms.
      </p>
    </section>
  );
}

function Contact() {
  return (
    <section className="rounded-3xl bg-gradient-to-br from-slate-950 to-red-900 p-8 text-white">
      <div className="flex gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600">
          <Mail className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">
            Questions about these terms?
          </h2>

          <p className="mt-3 max-w-2xl text-slate-300">
            If you have questions regarding these Terms and Conditions,
            please contact the OrganAid support team.
          </p>

          <Link
            to="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-red-700 transition hover:bg-red-50"
          >
            Contact Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}