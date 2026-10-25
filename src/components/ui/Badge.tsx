import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "brand"
    | "teal"
    | "violet"
    | "success"
    | "warning"
    | "error"
    | "surface";
}

export function Badge({
  variant = "surface",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn("badge", `badge-${variant}`, className)}
      {...props}
    >
      {children}
    </span>
  );
}
