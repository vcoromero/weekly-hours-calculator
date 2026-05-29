import { describe, it, expect } from "vitest";
import { cn } from "../utils.ts";

describe("cn", () => {
  it("returns single class unchanged", () => {
    expect(cn("foo")).toBe("foo");
  });

  it("merges multiple classes with space", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters out falsy values", () => {
    expect(cn("foo", false, undefined, null, "bar")).toBe("foo bar");
  });

  it("merges conflicting tailwind classes", () => {
    const result = cn("p-4", "p-6");
    expect(result).toMatch(/p-6/);
  });

  it("handles conditional classes", () => {
    const isActive = true;
    expect(cn("base", isActive && "active")).toBe("base active");
  });

  it("handles array of classes", () => {
    expect(cn(["foo", "bar"])).toBe("foo bar");
  });
});
