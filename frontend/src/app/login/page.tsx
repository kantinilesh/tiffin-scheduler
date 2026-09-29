/**
 * login/page.tsx — Login page with a "Sign in with Google" button.
 *
 * Centered card on a white background. The button is amber-outlined
 * (not filled) and links directly to the backend's Google OAuth route.
 * No client-side auth logic — the backend handles the full OAuth flow
 * and sets an httpOnly cookie on success.
 */

import Link from "next/link";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

export const metadata = {
  title: "Tiffin — Sign In",
};

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-bg">
      <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8 shadow-sm">
        {/* Wordmark */}
        <h1 className="mb-2 text-center text-2xl font-semibold text-text">
          Tiffin
        </h1>
        <p className="mb-8 text-center text-sm text-text-secondary">
          Sign in to manage your email campaigns
        </p>

        {/* Google OAuth button — amber outline, not filled */}
        <Link
          href={`${BACKEND_URL}/auth/google`}
          className="flex w-full items-center justify-center gap-3 rounded-md border-2 border-accent px-4 py-2.5 text-sm font-medium text-accent transition-colors hover:bg-amber-50"
        >
          {/* Google "G" icon (inline SVG) */}
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </Link>
      </div>
    </main>
  );
}
