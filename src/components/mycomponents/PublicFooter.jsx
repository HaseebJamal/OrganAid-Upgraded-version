import {
  ArrowUp,
  Clock3,
  Globe,
  HeartPulse,
  Mail,
  MapPin,
 Phone,
  ShieldCheck,
  Share2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function PublicFooter() {
  const year = new Date().getFullYear();

  function scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  return (
    <footer className="relative mt-24 overflow-hidden bg-slate-950 text-slate-300">

      {/* Background Glow */}
      <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-16">

        {/* Top */}
        <div className="grid gap-14 lg:grid-cols-4">

          {/* Brand */}
          <div>

            <div className="flex items-center gap-3">

              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-900/40">
                <HeartPulse className="h-7 w-7 text-white" />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-wide text-white">
                  OrganAid
                </h2>

                <p className="text-sm text-slate-400">
                  Smart Organ Donation Platform
                </p>
              </div>

            </div>

            <p className="mt-6 leading-7 text-slate-400">
              OrganAid securely connects donors, recipients,
              hospitals and healthcare professionals using
              intelligent digital workflows that reduce delays,
              improve transparency and help save lives.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-300">
              <ShieldCheck className="h-4 w-4" />
              Secure Healthcare Platform
            </div>

          </div>

          {/* Quick Links */}
          <div>

            <h3 className="mb-5 text-lg font-semibold text-white">
              Quick Links
            </h3>

            <FooterLink to="/">Home</FooterLink>
            <FooterLink to="/about">About</FooterLink>
            <FooterLink to="/how-it-works">
              How It Works
            </FooterLink>
            <FooterLink to="/faq">FAQ</FooterLink>
            <FooterLink to="/contact">
              Contact
            </FooterLink>

          </div>

          {/* Resources */}
          <div>

            <h3 className="mb-5 text-lg font-semibold text-white">
              Resources
            </h3>

            <FooterLink to="/privacy">
              Privacy Policy
            </FooterLink>

            <FooterLink to="/terms">
              Terms & Conditions
            </FooterLink>

            <FooterLink to="/login">
              Login
            </FooterLink>

            <FooterLink to="/register">
              Register
            </FooterLink>

            <FooterLink to="/faq">
              Support Center
            </FooterLink>

          </div>

          {/* Contact */}
          <div>

            <h3 className="mb-5 text-lg font-semibold text-white">
              Contact Information
            </h3>

            <div className="space-y-5 text-sm">

              <Info icon={MapPin}>
                Faisalabad, Pakistan
              </Info>

              <Info icon={Mail}>
                support@organaid.pk
              </Info>

              <Info icon={Phone}>
                +92 300 1234567
              </Info>

              <Info icon={Clock3}>
                Available 24 Hours
              </Info>

              <Info icon={Globe}>
                www.organaid.pk
              </Info>

            </div>

          </div>

        </div>

        {/* Statistics */}

        <div className="mt-16 grid gap-6 border-y border-slate-800 py-10 sm:grid-cols-2 lg:grid-cols-4">

          <Stat number="500+" label="Registered Donors" />

          <Stat number="120+" label="Hospitals Connected" />

          <Stat number="300+" label="Recipients Assisted" />

          <Stat number="99.9%" label="Secure Records" />

        </div>

        {/* Bottom */}

        <div className="flex flex-col items-center justify-between gap-6 pt-8 lg:flex-row">

          <div>

            <p className="text-sm text-slate-400">
              © {year} OrganAid. All rights reserved.
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Developed for improving transparency in organ
              donation and transplantation.
            </p>

          </div>

          {/* Social */}

          <div className="flex items-center gap-3">

            <Social>
              <Share2 size={18} aria-label="Facebook" />
            </Social>

            <Social>
              <Share2 size={18} aria-label="Instagram" />
            </Social>

            <Social>
              <Share2 size={18} aria-label="Twitter" />
            </Social>

            <Social>
              <Share2 size={18} aria-label="LinkedIn" />
            </Social>

          </div>

          {/* Back to Top */}

          <button
            onClick={scrollTop}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <ArrowUp size={18} />
            Back to Top
          </button>

        </div>

      </div>
    </footer>
  );
}

function FooterLink({ to, children }) {
  return (
    <Link
      to={to}
      className="mb-3 block text-slate-400 transition hover:translate-x-1 hover:text-red-400"
    >
      {children}
    </Link>
  );
}

function Info({ icon: Icon, children }) {
  return (
    <div className="flex gap-3">
      <Icon className="mt-1 h-5 w-5 text-red-400" />
      <span>{children}</span>
    </div>
  );
}

function Stat({ number, label }) {
  return (
    <div className="text-center">
      <h3 className="text-3xl font-bold text-red-500">
        {number}
      </h3>

      <p className="mt-2 text-sm text-slate-400">
        {label}
      </p>
    </div>
  );
}

function Social({ children }) {
  return (
    <button className="grid h-11 w-11 place-items-center rounded-xl bg-slate-900 transition hover:bg-red-600">
      {children}
    </button>
  );
}
