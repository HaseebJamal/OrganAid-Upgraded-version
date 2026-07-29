import { useMemo, useState } from "react";
import {
  HeartPulse,
  Hospital,
  LockKeyhole,
  Search,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import Accordion from "../../components/ui/Accordion";
import Input from "../../components/ui/Input";
import { Alert, AlertDescription, AlertTitle } from "../../components/ui/Alert";

const faqItems = [
  {
    category: "general",
    title: "What is OrganAid?",
    content:
      "OrganAid is a digital organ-donation coordination platform that connects donors, recipients, hospitals, and administrators through role-based dashboards, profile verification, medical-record management, organ requests, and notifications.",
  },
  {
    category: "accounts",
    title: "Who can register on OrganAid?",
    content:
      "Donors, recipients, and hospital representatives can register through the public registration page. Administrator accounts should be created securely through the backend and must not be available through public registration.",
  },
  {
    category: "matching",
    title: "How does organ matching work?",
    content:
      "OrganAid organizes relevant information such as blood group, organ type, availability, urgency, and verification status to support compatibility review. Final medical suitability must always be determined by qualified healthcare professionals.",
  },
  {
    category: "security",
    title: "Is my personal information secure?",
    content:
      "OrganAid uses authenticated access, role-based authorization, protected API routes, and restricted workflows to reduce unauthorized access. The backend should also enforce secure password storage, audit logging, rate limiting, and strict access controls for sensitive data.",
  },
  {
    category: "donors",
    title: "Can donors update their availability?",
    content:
      "Yes. Donors can update their availability status from the donor dashboard. Hospitals and administrators can then see the current status when reviewing donor profiles.",
  },
  {
    category: "hospitals",
    title: "How do hospitals participate?",
    content:
      "Hospital representatives create a hospital profile and submit registration information for verification. Once approved, authorized hospital users can access the clinical review queue and participate in approved coordination workflows.",
  },
  {
    category: "recipients",
    title: "Can recipients submit more than one active request?",
    content:
      "The platform should prevent duplicate active requests for the same recipient. A recipient should complete and verify their profile before submitting an organ request.",
  },
  {
    category: "documents",
    title: "What types of medical documents can be uploaded?",
    content:
      "Users can upload supported documents such as PDF reports and accepted image files. The backend should validate file type, file size, ownership, and access permissions before storing or serving any medical document.",
  },
  {
    category: "verification",
    title: "Who verifies donor and recipient profiles?",
    content:
      "Verification responsibilities depend on the workflow. Authorized hospital staff may review clinical details, while administrators manage platform-level approvals, roles, and access. All final decisions must be enforced by backend permissions.",
  },
  {
    category: "support",
    title: "Is OrganAid an emergency medical service?",
    content:
      "No. OrganAid is a coordination and management platform. For urgent medical assistance, users should contact local emergency services or a qualified healthcare provider immediately.",
  },
];

const categories = [
  { value: "all", label: "All questions" },
  { value: "general", label: "General" },
  { value: "accounts", label: "Accounts" },
  { value: "matching", label: "Matching" },
  { value: "security", label: "Security" },
  { value: "hospitals", label: "Hospitals" },
  { value: "donors", label: "Donors" },
  { value: "recipients", label: "Recipients" },
];

export default function FAQ() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return faqItems.filter((item) => {
      const matchesCategory =
        category === "all" || item.category === category;

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  return (
    <div className="overflow-hidden bg-white text-slate-900">
      <FAQHero />

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
              <Input
                type="search"
                value={search}
                leftIcon={Search}
                clearable
                placeholder="Search frequently asked questions"
                onChange={(event) => setSearch(event.target.value)}
                onClear={() => setSearch("")}
              />

              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-100"
              >
                {categories.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-8">
            {filteredItems.length ? (
              <Accordion items={filteredItems} />
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
                <Search
                  className="mx-auto h-8 w-8 text-slate-400"
                  aria-hidden="true"
                />

                <h2 className="mt-4 text-lg font-bold text-slate-950">
                  No matching questions found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Try a different search term or choose another category.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <TrustSection />

      <SupportSection />
    </div>
  );
}

function FAQHero() {
  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(220,38,38,0.3),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(37,99,235,0.16),transparent_35%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 sm:py-24 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-red-100 backdrop-blur">
          <HeartPulse className="h-4 w-4" aria-hidden="true" />
          OrganAid help center
        </span>

        <h1 className="mt-7 text-4xl font-bold tracking-tight sm:text-5xl">
          Frequently asked questions
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-300">
          Find clear answers about registration, verification, matching,
          medical records, hospital participation, and platform security.
        </p>
      </div>
    </section>
  );
}

function TrustSection() {
  const items = [
    {
      icon: UsersRound,
      title: "Role-based access",
      description:
        "Each user type receives a workspace designed around their responsibilities.",
    },
    {
      icon: Hospital,
      title: "Verified organizations",
      description:
        "Hospital accounts require review before clinical workflows are enabled.",
    },
    {
      icon: LockKeyhole,
      title: "Protected workflows",
      description:
        "Sensitive actions should be checked by authenticated backend permissions.",
    },
  ];

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-red-600">
            Trust and clarity
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            Built around accountable healthcare coordination
          </h2>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                {title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                {description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function SupportSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <Alert variant="info">
          <AlertTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            Still need help?
          </AlertTitle>

          <AlertDescription>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Contact the OrganAid team for technical support, hospital
                onboarding, or platform questions.
              </span>

              <Link
                to="/contact"
                className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-xl bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Contact support
              </Link>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </section>
  );
}