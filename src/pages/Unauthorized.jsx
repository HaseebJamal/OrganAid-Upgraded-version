import { Link } from "react-router-dom";
import {
  ShieldX,
  Lock,
  Home,
  ArrowLeft,
  HeartPulse,
} from "lucide-react";

export default function Unauthorized() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-100 px-4">

      {/* Background */}
      <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-red-200/30 blur-3xl" />
      <div className="absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-red-300/20 blur-3xl" />

      <div className="relative w-full max-w-xl">

        <div className="rounded-3xl border border-red-100 bg-white p-10 shadow-2xl text-center">

          {/* Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
            <ShieldX className="h-12 w-12 text-red-600" />
          </div>

          {/* Status */}
          <h1 className="mt-8 text-6xl font-extrabold text-red-600">
            403
          </h1>

          <h2 className="mt-3 text-3xl font-bold text-slate-900">
            Access Denied
          </h2>

          <p className="mt-4 text-slate-600 leading-7">
            Sorry, you don't have permission to access this page.
            This section is restricted based on your account role
            or authentication status.
          </p>

          {/* Info */}
          <div className="mt-8 rounded-2xl border border-red-100 bg-red-50 p-5 text-left">

            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-slate-900">
                Possible reasons
              </h3>
            </div>

            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• You are not logged in.</li>
              <li>• Your account doesn't have permission.</li>
              <li>• Your profile is still pending verification.</li>
              <li>• This page is available only for another user role.</li>
            </ul>

          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">

            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-600 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </button>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3 font-semibold text-white transition hover:bg-red-700"
            >
              <Home className="h-5 w-5" />
              Home
            </Link>

          </div>

          {/* Footer */}
          <div className="mt-10 border-t border-slate-200 pt-6">

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <HeartPulse className="h-5 w-5 text-red-600" />
              OrganAid — Secure Organ Donation Management Platform
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}