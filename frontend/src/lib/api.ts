/**
 * api.ts — Thin wrapper around fetch for calling the backend API.
 *
 * All requests include credentials (cookies) so the httpOnly JWT
 * is sent automatically. The BACKEND_URL comes from the
 * NEXT_PUBLIC_BACKEND_URL env var.
 */

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/**
 * Calls the backend API with credentials included.
 * Throws on non-OK responses with the error message from the server.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BACKEND_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.error || "Request failed");
  }

  return res.json();
}

/** Typed error with HTTP status code */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** The backend URL, exported for direct link construction (e.g. OAuth) */
export { BACKEND_URL };
