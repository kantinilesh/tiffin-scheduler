/**
 * Spinner.tsx — Lightweight loading spinner.
 *
 * Built with pure SVG and Tailwind's animate-spin utility.
 * Supports sizes (sm, md, lg) and colors (accent, white, secondary).
 */

import React from "react";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "accent" | "white" | "secondary";
  className?: string;
}

export function Spinner({
  size = "md",
  color = "accent",
  className = "",
}: SpinnerProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-5 w-5",
    lg: "h-8 w-8",
  };

  const colorClasses = {
    accent: "text-[#d97706]",
    white: "text-white",
    secondary: "text-[#6b7280]",
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-label="Loading"
      role="status"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export default Spinner;
