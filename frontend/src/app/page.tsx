/**
 * page.tsx — Root page that redirects to /dashboard.
 *
 * The Header component on the dashboard will handle the auth check:
 * if the user is not authenticated, it redirects to /login.
 */

import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
}
