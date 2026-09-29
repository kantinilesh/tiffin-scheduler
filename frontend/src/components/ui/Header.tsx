/**
 * Header.tsx — App header shown on authenticated pages.
 *
 * Left side:  "Tiffin" wordmark in the accent color.
 * Right side: user avatar (circle), name, email (small gray), "Log out" button.
 *
 * On mount, calls GET /auth/me to fetch the current user. If 401,
 * redirects to /login. This is a client component because it needs
 * useEffect for the API call and useRouter for navigation.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError } from "@/lib/api";
import type { User } from "@/types/user";


export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<User>("/auth/me")
      .then(setUser)
      .catch((err) => {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleLogout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch {
      // Even if the request fails, redirect to login
    }
    router.replace("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-3">
      {/* Left: wordmark */}
      <span className="text-xl font-bold text-accent">Tiffin</span>

      {/* Right: user info + logout */}
      {loading ? (
        <div className="h-8 w-32 animate-pulse rounded bg-border" />
      ) : user ? (
        <div className="flex items-center gap-3">
          {/* Avatar */}
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm font-medium text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}

          {/* Name + email */}
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-tight text-text">
              {user.name}
            </p>
            <p className="text-xs leading-tight text-text-secondary">
              {user.email}
            </p>
          </div>

          {/* Log out button */}
          <button
            onClick={handleLogout}
            className="ml-2 text-sm text-text-secondary transition-colors hover:text-accent"
          >
            Log out
          </button>
        </div>
      ) : null}
    </header>
  );
}
