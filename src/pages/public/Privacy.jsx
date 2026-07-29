import {
  ArrowRight,
  Database,
  Eye,
  FileText,
  Hospital,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

const policySections = [
  {
    id: "information-collected",
    number: "01",
    icon: Database,
    title: "Information we collect",
    content: (
      <>
        <p>
          OrganAid may collect information that users provide when
          creating and managing an account, completing a profile,
          submitting an organ request, uploading a medical document,
          registering a hospital, or contacting the platform team.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <InformationItem
            title="Account information"
            description="Name, email address, phone number, password credentials, and assigned role."
          />

          <InformationItem
            title="Profile information"
            description="Date of birth, gender, address, city, blood group, organ type, availability, and related profile details."
          />

          <InformationItem
            title="Medical information"
            description="Medical history, medical condition, urgency level, and documents uploaded for an authorized workflow."
          />

          <InformationItem
            title="Hospital information"
            description="Hospital name, registration number, contact details, address, website, and verification information."
          />

          <InformationItem
            title="Activity information"
            description="Requests, status changes, verification activity, notifications, and timestamps associated with platform actions."
          />

          <InformationItem
            title="Technical information"
            description="Information needed for authentication, security monitoring, error handling, and system operation."
          />
        </div>
      </>
    ),
  },
  {
    id: "use-of-information",
    number: "02",
    icon: FileText,
    title: "How information is used",
    content: (
      <>
        <p>
          OrganAid uses submitted information to operate the platform
          and support approved organ-donation coordination workflows.
        </p>

        <ul className="mt-5 space-y-3">
          <PolicyPoint>
            Create and maintain user, donor, recipient, and hospital
            profiles.
          </PolicyPoint>

          <PolicyPoint>
            Authenticate users and provide access based on their
            assigned role.
          </PolicyPoint>

          <PolicyPoint>
            Support donor availability, organ requests, hospital review,
            and administrative verification.
          </PolicyPoint>

          <PolicyPoint>
            Store and display medical documents within authorized
            workflows.
          </PolicyPoint>

          <PolicyPoint>
            Deliver account, request, verification, and system
            notifications.
          </PolicyPoint>

          <PolicyPoint>
            Investigate technical problems, misuse, unauthorized access,
            and platform errors.
          </PolicyPoint>
        </ul>
      </>
    ),
  },
  {
    id: "access-and-sharing",
    number: "03",
    icon: Eye,
    title: "Access and sharing",
    content: (
      <>
        <p>
          Information should be accessible only to users whose role and
          workflow require it. OrganAid does not present user information
          as publicly searchable medical data.
        </p>

        <div className="mt-5 space-y-4">
          <AccessRow
            icon={UserRound}
            title="Account holders"
            description="Users can view and update information available within their own account and dashboard."
          />

          <AccessRow
            icon={Hospital}
            title="Authorized hospitals"
            description="Verified hospital users may access relevant donor or recipient information only through approved clinical-review workflows."
          />

          <AccessRow
            icon={ShieldCheck}
            title="Administrators"
            description="Authorized administrators may manage users, verification, requests, notifications, and system settings according to backend permissions."
          />
        </div>

        <p className="mt-5">
          OrganAid should not sell personal or medical information.
          Information may need to be disclosed when required by law,
          necessary to protect users or the platform, or requested through
          a valid legal process.
        </p>
      </>
    ),
  },
  {
    id: "security",
    number: "04",
    icon: LockKeyhole,
    title: "Security measures",
    content: (
      <>
        <p>
          OrganAid is designed to use authenticated access, protected API
          routes, password hashing, role-based authorization, input
          validation, and restricted medical-document access.
        </p>

        <p className="mt-4">
          No online system can guarantee absolute security. Production
          deployment should also include secure cookies or another
          carefully implemented session mechanism, HTTPS, rate limiting,
          audit logging, file validation, database protection, backups,
          monitoring, and incident-response procedures.
        </p>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">
            Account responsibility
          </p>

          <p className="mt-2 text-sm leading-6 text-amber-800">
            Users should use strong passwords, keep credentials private,
            sign out from shared devices, and immediately report suspected
            unauthorized access.
          </p>
        </div>
      </>
    ),
  },
  {
    id: "retention",
    number: "05",
    icon: Database,
    title: "Data retention",
    content: (
      <>
        <p>
          Information should be retained only for as long as it is needed
          to operate the relevant account or workflow, maintain required
          records, resolve disputes, investigate misuse, and satisfy
          applicable legal or institutional obligations.
        </p>

        <p className="mt-4">
          Retention periods should be defined in the production system for
          user accounts, uploaded reports, notifications, audit logs,
          verification records, and organ requests.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    number: "06",
    icon: UserRound,
    title: "Your choices and rights",
    content: (
      <>
        <p>
          Depending on the features implemented and the law applicable to
          the deployment, users may be able to request access, correction,
          deletion, or restriction of certain information.
        </p>

        <ul className="mt-5 space-y-3">
          <PolicyPoint>
            Review and update profile information from the relevant
            dashboard.
          </PolicyPoint>

          <PolicyPoint>
            Request correction of inaccurate account or profile data.
          </PolicyPoint>

          <PolicyPoint>
            Ask how information is used within the platform.
          </PolicyPoint>

          <PolicyPoint>
            Request account deletion, subject to required retention and
            verification obligations.
          </PolicyPoint>

          <PolicyPoint>
            Report a privacy, security, or unauthorized-access concern.
          </PolicyPoint>
        </ul>
      </>
    ),
  },
  {
    id: "deletion",
    number: "07",
    icon: Trash2,
    title: "Account deletion",
    content: (
      <>
        <p>
          Account deletion should be handled through an authenticated
          request or verified support process. Some records may need to be
          preserved when required for security, audit, dispute resolution,
          legal compliance, or healthcare workflow integrity.
        </p>

        <p className="mt-4">
          Deleting an account should not automatically erase records that
          another authorized party is legally or operationally required to
          retain.
        </p>
      </>
    ),
  },
  {
    id: "children",
    number: "08",
    icon: ShieldCheck,
    title: "Children and dependent users",
    content: (
      <>
        <p>
          Organ-donation and transplant workflows involving minors or
          dependent individuals may require verified consent from a parent,
          guardian, healthcare institution, or other legally authorized
          person.
        </p>

        <p className="mt-4">
          The platform should not rely only on a self-declared date of
          birth when legal consent or clinical authorization is required.
        </p>
      </>
    ),
  },
  {
    id: "updates",
    number: "09",
    icon: FileText,
    title: "Changes to this policy",
    content: (
      <>
        <p>
          This notice may be updated when OrganAid features, data practices,
          security controls, or legal requirements change.
        </p>

        <p className="mt-4">
          Material changes should be communicated through this page, an
          account notification, or another appropriate platform channel.
        </p>
      </>
    ),
  },
];

export default function Privacy() {
  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <PrivacyHero />

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[16rem_minmax(0,1fr)] lg:px-8">
          <PolicyNavigation />

          <main className="min-w-0">
            <ImportantNotice />

            <div className="mt-6 space-y-6">
              {policySections.map((section) => (
                <PolicySection
                  key={section.id}
                  {...section}
                />
              ))}
            </div>

            <ContactSection />
          </main>
        </div>
      </section>
    </div>
  );
}

function PrivacyHero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.32),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.15),transparent_35%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-red-100 backdrop-blur">
          <ShieldCheck
            className="h-4 w-4"
            aria-hidden="true"
          />
          Privacy and data responsibility
        </span>

        <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">
          Privacy policy
        </h1>

        <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-slate-300">
          This notice explains the types of information OrganAid may
          process, how that information supports platform workflows, and
          the responsibilities required to protect sensitive data.
        </p>

        <p className="mt-6 text-sm text-slate-400">
          Last updated: July 2026
        </p>
      </div>
    </section>
  );
}

function PolicyNavigation() {
  return (
    <aside className="h-fit lg:sticky lg:top-24">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="px-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
          On this page
        </p>

        <nav
          className="mt-3 space-y-1"
          aria-label="Privacy policy sections"
        >
          {policySections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="block rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-700"
            >
              {section.number}. {section.title}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

function ImportantNotice() {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <ShieldCheck
          className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
          aria-hidden="true"
        />

        <div>
          <h2 className="font-bold text-amber-950">
            Project privacy notice
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-900">
            This policy should match the actual OrganAid backend,
            database, file storage, hosting environment, retention
            practices, and access controls. It is not a substitute for
            professional legal or data-protection review before production
            deployment.
          </p>
        </div>
      </div>
    </section>
  );
}

function PolicySection({
  id,
  number,
  icon: Icon,
  title,
  content,
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-50 text-red-600">
          <Icon
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-600">
            Section {number}
          </p>

          <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {title}
          </h2>
        </div>
      </div>

      <div className="mt-6 text-sm leading-7 text-slate-600">
        {content}
      </div>
    </section>
  );
}

function InformationItem({
  title,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </div>
  );
}

function PolicyPoint({ children }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
        <ShieldCheck
          className="h-3 w-3"
          aria-hidden="true"
        />
      </span>

      <span>{children}</span>
    </li>
  );
}

function AccessRow({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-red-600 shadow-sm">
        <Icon
          className="h-4 w-4"
          aria-hidden="true"
        />
      </span>

      <div>
        <h3 className="font-semibold text-slate-900">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {description}
        </p>
      </div>
    </div>
  );
}

function ContactSection() {
  return (
    <section className="mt-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-6 text-white sm:p-8">
      <div className="flex items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-600">
          <Mail
            className="h-5 w-5"
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0">
          <h2 className="text-2xl font-bold">
            Privacy questions or concerns
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
            Contact the OrganAid team to report a privacy concern,
            suspected unauthorized access, or a request relating to your
            account information.
          </p>

          <Link
            to="/contact"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
          >
            Contact OrganAid
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