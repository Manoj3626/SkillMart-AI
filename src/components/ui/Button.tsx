"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "outline" | "teal" | "white" | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  as?: "button" | "a";
  href?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  className,
  disabled,
  as: Tag = "button",
  href,
  ...props
}: ButtonProps) {
  const classes = cn(
    "btn",
    `btn-${variant}`,
    `btn-${size}`,
    loading && "opacity-70 cursor-wait",
    className
  );

  if (Tag === "a" && href) {
    return (
      <a href={href} className={classes}>
        {loading ? <Spinner size={size} /> : null}
        {children}
      </a>
    );
  }

  return (
    <button className={classes} disabled={disabled || loading} {...props}>
      {loading ? <Spinner size={size} /> : null}
      {children}
    </button>
  );
}

function Spinner({ size }: { size: string }) {
  const s = size === "sm" ? 12 : size === "lg" || size === "xl" ? 18 : 14;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      className="animate-spin"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
