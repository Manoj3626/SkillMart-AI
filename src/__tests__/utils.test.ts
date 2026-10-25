import { describe, it, expect } from "vitest";

// ─── Utility functions ───────────────────────────────────────────────────────
import { cn, formatDate, formatDuration, truncate, slugify, clamp } from "@/lib/utils";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });
  it("handles conditional classes", () => {
    expect(cn("base", false && "not-here", "end")).toBe("base end");
  });
  it("deduplicates tailwind conflicting classes", () => {
    // twMerge should prefer the later class
    const result = cn("p-2", "p-4");
    expect(result).toBe("p-4");
  });
});

describe("formatDuration()", () => {
  it("formats 0 seconds", () => expect(formatDuration(0)).toBe("00:00"));
  it("formats 61 seconds", () => expect(formatDuration(61)).toBe("01:01"));
  it("formats 3600 seconds", () => expect(formatDuration(3600)).toBe("60:00"));
});

describe("truncate()", () => {
  it("does not truncate short strings", () => expect(truncate("hello", 10)).toBe("hello"));
  it("truncates long strings", () => {
    const result = truncate("hello world", 7);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(8);
  });
});

describe("slugify()", () => {
  it("lowercases and hyphenates", () => expect(slugify("Hello World")).toBe("hello-world"));
  it("removes special chars", () => expect(slugify("React & TypeScript!")).toBe("react-typescript"));
  it("collapses multiple hyphens", () => expect(slugify("a - b -- c")).toBe("a-b-c"));
});

describe("clamp()", () => {
  it("clamps below min", () => expect(clamp(-5, 0, 100)).toBe(0));
  it("clamps above max", () => expect(clamp(150, 0, 100)).toBe(100));
  it("leaves value in range", () => expect(clamp(50, 0, 100)).toBe(50));
});

describe("formatDate()", () => {
  it("returns a non-empty string for a valid ISO date", () => {
    const result = formatDate("2026-01-15");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
