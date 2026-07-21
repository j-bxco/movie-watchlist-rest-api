import { describe, it, expect } from "vitest";
import { createMovieSchema, updateMovieSchema } from "../movieValidators.js";

const CURRENT_YEAR = new Date().getFullYear();

const validPayload = {
  title: "Inception",
  releaseYear: 2010,
  overview: "A thief who steals corporate secrets through dream-sharing technology.",
  genres: ["Action", "Sci-Fi", "Thriller"],
  runtime: 148,
  posterUrl: "https://example.com/inception.jpg",
};

describe("createMovieSchema", () => {
  it("accepts a valid full payload", () => {
    const result = createMovieSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts a payload with only required fields (title, releaseYear)", () => {
    const result = createMovieSchema.safeParse({
      title: "Inception",
      releaseYear: 2010,
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from title", () => {
    const result = createMovieSchema.safeParse({
      ...validPayload,
      title: "  Inception  ",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Inception");
  });

  it("rejects an empty title", () => {
    const result = createMovieSchema.safeParse({ ...validPayload, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a releaseYear below 1888", () => {
    const result = createMovieSchema.safeParse({
      ...validPayload,
      releaseYear: 1887,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a releaseYear beyond current year + 10", () => {
    const result = createMovieSchema.safeParse({
      ...validPayload,
      releaseYear: CURRENT_YEAR + 11,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer releaseYear", () => {
    const result = createMovieSchema.safeParse({
      ...validPayload,
      releaseYear: 2010.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a negative runtime", () => {
    const result = createMovieSchema.safeParse({
      ...validPayload,
      runtime: -10,
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid posterUrl (not a URL)", () => {
    const result = createMovieSchema.safeParse({
      ...validPayload,
      posterUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects non-string items in the genres array", () => {
    const result = createMovieSchema.safeParse({
      ...validPayload,
      genres: ["Sci-Fi", 42],
    });
    expect(result.success).toBe(false);
  });
});

describe("updateMovieSchema", () => {
  it("accepts an empty object (all fields optional)", () => {
    const result = updateMovieSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a partial update (only title)", () => {
    const result = updateMovieSchema.safeParse({ title: "Interstellar" });
    expect(result.success).toBe(true);
  });

  it("still rejects invalid values when provided (e.g., bad posterUrl)", () => {
    const result = updateMovieSchema.safeParse({ posterUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });
});
