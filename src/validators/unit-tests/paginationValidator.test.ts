import { describe, it, expect } from "vitest";
import { paginationSchema } from "../paginationValidator.js";

describe("paginationSchema", () => {
  it("accepts valid page and limit", () => {
    const result = paginationSchema.safeParse({ page: 2, limit: 20 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(20);
    }
  });

  it("applies defaults when no values are given", () => {
    const result = paginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
    }
  });

  it("coerces string numbers to integers", () => {
    const result = paginationSchema.safeParse({ page: "2", limit: "25" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(25);
    }
  });

  it("rejects a limit above 100", () => {
    const result = paginationSchema.safeParse({ page: 1, limit: 101 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive page", () => {
    const result = paginationSchema.safeParse({ page: 0, limit: 10 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-positive limit", () => {
    const result = paginationSchema.safeParse({ page: 1, limit: 0 });
    expect(result.success).toBe(false);
  });
});
