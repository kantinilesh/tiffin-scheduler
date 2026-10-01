/**
 * EmptyState.tsx — Placeholder state displayed when lists or views have no data.
 *
 * Renders a centered icon, title/message, description, and optional action button.
 * Uses a white card surface with #E5E7EB border.
 */

import React from "react";

export interface EmptyStateProps {
  message?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  message = "No items yet",
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-[#e5e7eb] bg-white p-12 text-center shadow-xs ${className}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-[#d97706]">
        {icon || (
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        )}
      </div>

      <h3 className="text-sm font-semibold text-[#1a1a1a]">
        {title || message}
      </h3>

      {(description || (title && message)) && (
        <p className="mt-1 max-w-sm text-xs text-[#6b7280]">
          {description || message}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
