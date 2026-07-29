import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  HeartPulse,
  Home,
  Search,
} from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-100 px-4">

      {/* Background */}
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-red-200/30 blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-red-300/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl">

        <div className="rounded-3xl border border-red-100 bg-white p-10 text-center shadow-2xl">

          {/* Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-12 w-12 text-red-600" />
          </div>

          {/* Error */}
          <p className="mt-8 text-7xl font-extrabold tracking-tight text-red-600">
            404
          </p>

          <h1 className="mt-4 text-3xl font-bold text-slate-900">
            Page Not Found
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-600">
            Sorry, the page you're looking for doesn't exist, has been moved,
            or the link you followed is no longer available.
          </p>

          {/* Suggestions */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-left">

            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-red-600" />
              <h2 className="font-semibold text-slate-900">
                You can try:
              </h2>
            </div>

            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              <li>• Check the URL for typing mistakes.</li>
              <li>• Return to the homepage.</li>
              <li>• Navigate using the main menu.</li>
              <li>• Contact support if the issue continues.</li>
            </ul>

          </div>

          {/* Buttons */}
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              <Home className="h-5 w-5" />
              Back to Home
            </Link>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-600 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              Contact Support
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>

          {/* Footer */}
          <div className="mt-10 border-t border-slate-200 pt-6">

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <HeartPulse className="h-5 w-5 text-red-600" />
              OrganAid — Connecting donors, recipients and hospitals securely.
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}