/**
 * layout.tsx — Root layout for the Next.js app.
 * Sets the HTML lang, loads the Inter font via next/font/google,
 * and applies the global CSS. Every page is rendered inside this shell.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tiffin",
  description: "Tiffin Scheduler — manage and schedule your tiffin deliveries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
