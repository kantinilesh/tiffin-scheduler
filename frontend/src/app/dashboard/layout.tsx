/**
 * dashboard/layout.tsx — Layout for all authenticated dashboard pages.
 *
 * Wraps children with the Header component. Any page under /dashboard
 * automatically gets the header with user info and logout.
 */

import Header from "@/components/ui/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
    </>
  );
}
