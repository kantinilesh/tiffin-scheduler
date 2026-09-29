/**
 * types/user.ts — TypeScript type for the authenticated user profile.
 * Matches the shape returned by GET /auth/me on the backend.
 */

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
}
