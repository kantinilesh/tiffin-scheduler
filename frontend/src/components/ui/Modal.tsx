/**
 * Modal.tsx — Accessible modal dialog component.
 *
 * Renders an overlay backdrop with a white dialog card.
 * Handles Escape key navigation and backdrop dismiss.
 * Supports title, description, body content, and custom footer actions.
 */

"use client";

import React, { useEffect, useCallback } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "lg",
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <div
        className={`relative z-10 w-full ${maxWidthClasses[maxWidth]} rounded-lg border border-[#e5e7eb] bg-white p-6 shadow-xl transition-all`}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#e5e7eb]">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-[#1a1a1a]">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-[#6b7280]">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[#6b7280] hover:bg-gray-100 hover:text-[#1a1a1a] transition-colors focus:outline-none"
            aria-label="Close"
          >
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="py-4 text-sm text-[#1a1a1a]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
