/**
 * Button.tsx — Reusable button component for Tiffin.
 *
 * Supports variants: primary (amber #D97706), secondary (white surface with #E5E7EB border),
 * outline, ghost, and danger.
 * Includes loading spinner state and icon slots.
 */

import React, { forwardRef } from "react";
import Spinner from "./Spinner";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const base =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#d97706]/40 disabled:opacity-50 disabled:cursor-not-allowed";

    // Variant styles
    const variants = {
      primary:
        "bg-[#d97706] text-white hover:bg-[#b45309] shadow-sm border border-transparent",
      secondary:
        "bg-white text-[#1a1a1a] border border-[#e5e7eb] hover:bg-gray-50 shadow-sm",
      outline:
        "bg-transparent text-[#1a1a1a] border border-[#e5e7eb] hover:bg-gray-50",
      ghost:
        "bg-transparent text-[#6b7280] hover:text-[#1a1a1a] hover:bg-gray-100",
      danger:
        "bg-red-600 text-white hover:bg-red-700 shadow-sm border border-transparent",
    };

    // Size styles
    const sizes = {
      sm: "px-2.5 py-1.5 text-xs gap-1.5",
      md: "px-3.5 py-2 text-sm gap-2",
      lg: "px-4.5 py-2.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Spinner
            size="sm"
            color={variant === "primary" || variant === "danger" ? "white" : "accent"}
          />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
