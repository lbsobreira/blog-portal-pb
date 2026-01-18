"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [magicLink, setMagicLink] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [status, session, callbackUrl, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check if we should use dev mode (localhost without FORCE_RESEND)
      // Set NEXT_PUBLIC_FORCE_RESEND=true in .env to test Resend locally
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
      const forceResend = process.env.NEXT_PUBLIC_FORCE_RESEND === "true";
      const isDev = isLocalhost && !forceResend;

      if (isDev) {
        // Dev mode: use credentials provider with redirect: false to handle manually
        const result = await signIn("dev-email", {
          email,
          redirect: false,
          callbackUrl,
        });

        if (result?.ok) {
          // Session is established, wait a moment then redirect
          router.refresh();
          setTimeout(() => {
            window.location.href = callbackUrl;
          }, 100);
        } else if (result?.error) {
          alert(`Sign in failed: ${result.error}. Make sure the email is valid.`);
          setIsLoading(false);
        }
      } else {
        // Production: use magic link
        const result = await signIn("resend", {
          email,
          callbackUrl,
          redirect: false,
        });

        if (result?.ok) {
          setEmailSent(true);
        } else if (result?.error) {
          alert(`Sign in failed: ${result.error}`);
        }
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      alert("Sign in failed. Please try again.");
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Check your email</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            A sign in link has been sent to <strong>{email}</strong>
          </p>

          {magicLink && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                🔧 Development Mode
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                Email sending failed (likely firewall). Click below to sign in:
              </p>
              <a
                href={magicLink}
                className="inline-block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Sign In (Dev Mode)
              </a>
            </div>
          )}

          <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
            {magicLink
              ? "In production, you'll receive this link via email."
              : "Click the link in the email to sign in. The link will expire in 24 hours."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sign in to your account with a magic link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-2"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending link..." : "Send magic link"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            No password required. We'll email you a secure link to sign in.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignInForm />
    </Suspense>
  );
}
