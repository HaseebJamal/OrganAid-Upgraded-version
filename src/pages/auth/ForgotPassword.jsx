import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  HeartPulse,
  Mail,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import Button from "../../components/ui/Button";
import FormField from "../../components/ui/FormField";
import {
  Card,
  CardContent,
} from "../../components/ui/Card";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "../../components/ui/Alert";

// import { forgotPassword } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!email.trim()) {
      return toast.error("Email address is required.");
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return toast.error("Please enter a valid email.");
    }

    try {
      setLoading(true);

      /*
      await forgotPassword({
        email,
      });
      */

      await new Promise((resolve) =>
        setTimeout(resolve, 1500)
      );

      setEmailSent(true);

      toast.success(
        "Password reset email sent successfully."
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to send password reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 via-white to-slate-100 px-4 py-10">

      {/* Background */}

      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-red-200/40 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-blue-200/30 blur-3xl" />

      <Card className="relative w-full max-w-lg rounded-3xl shadow-2xl">

        <CardContent className="p-8">

          {/* Logo */}

          <div className="text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-600 text-white shadow-lg shadow-red-200">

              <HeartPulse className="h-10 w-10" />

            </div>

            <h1 className="mt-6 text-3xl font-bold text-slate-900">
              Forgot Password
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Enter your registered email address and we'll
              send you a secure password reset link.
            </p>

          </div>

          {emailSent ? (

            <Alert className="mt-8 border-green-200 bg-green-50">

              <AlertTitle className="flex items-center gap-2 text-green-700">

                <CheckCircle2 className="h-5 w-5" />

                Email Sent Successfully

              </AlertTitle>

              <AlertDescription className="mt-2 text-green-700">

                If an OrganAid account exists with{" "}
                <strong>{email}</strong>, a password reset
                link has been sent.

                <br />

                Please check your inbox and spam folder.

              </AlertDescription>

            </Alert>

          ) : (

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-6"
            >

              <FormField
                label="Email Address"
                type="email"
                required
                value={email}
                leftIcon={Mail}
                placeholder="Enter your registered email"
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                loadingText="Sending Reset Link..."
              >
                Send Password Reset Link
              </Button>

            </form>

          )}

          <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-4">

            <div className="flex items-start gap-3">

              <ShieldCheck className="mt-0.5 h-5 w-5 text-green-600" />

              <div>

                <p className="font-semibold text-slate-800">
                  Security Notice
                </p>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Password reset links expire automatically
                  for your protection. Never share your
                  password or reset link with anyone.
                </p>

              </div>

            </div>

          </div>

          <div className="mt-8 text-center">

            <Link
              to="/login"
              className="inline-flex items-center gap-2 font-semibold text-red-600 transition hover:text-red-700"
            >

              <ArrowLeft className="h-4 w-4" />

              Back to Login

            </Link>

          </div>

          <div className="mt-8 border-t pt-5 text-center text-xs text-slate-400">

            © {new Date().getFullYear()} OrganAid

            <br />

            Secure Organ Donation & Transplant Management Platform

          </div>

        </CardContent>

      </Card>

    </main>
  );
}