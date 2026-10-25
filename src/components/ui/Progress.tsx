import React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  label?: string;
  showLabel?: boolean;
  color?: "brand" | "teal" | "violet" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Progress({
  value,
  label,
  showLabel = false,
  color = "brand",
  size = "md",
  className,
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const barColors: Record<string, string> = {
    brand: "linear-gradient(90deg, var(--color-brand-500), var(--color-brand-400))",
    teal: "linear-gradient(90deg, var(--color-teal-500), var(--color-teal-400))",
    violet: "linear-gradient(90deg, var(--color-violet-600), var(--color-violet-400))",
    success: "linear-gradient(90deg, var(--color-success-600), var(--color-success-500))",
    warning: "linear-gradient(90deg, var(--color-warning-600), var(--color-warning-500))",
    error: "linear-gradient(90deg, var(--color-error-600), var(--color-error-500))",
  };

  const heights: Record<string, string> = {
    sm: "4px",
    md: "6px",
    lg: "10px",
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {(label || showLabel) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className="text-xs font-medium text-[var(--color-surface-600)]">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-xs font-semibold text-[var(--color-surface-700)]">
              {clamped}%
            </span>
          )}
        </div>
      )}
      <div
        className="progress"
        style={{ height: heights[size] }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="progress-bar"
          style={{ width: `${clamped}%`, background: barColors[color] }}
        />
      </div>
    </div>
  );
}

interface ScoreRingProps {
  score: number; // 0-100
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function ScoreRing({
  score,
  size = 80,
  strokeWidth = 6,
  label,
  color = "var(--color-brand-500)",
}: ScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-surface-200)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.34,1.56,.64,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-[var(--color-surface-900)]">
            {score}
          </span>
        </div>
      </div>
      {label && (
        <span className="text-xs font-medium text-[var(--color-surface-500)] text-center">
          {label}
        </span>
      )}
    </div>
  );
}
