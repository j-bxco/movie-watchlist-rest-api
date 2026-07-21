import { describe, it, expect } from "vitest";
import {
  addToWatchlistSchema,
  updateWatchListItemSchema,
} from "../watchlistValidators.js";

const validPayload = {
  movieId: "123e4567-e89b-12d3-a456-426614174000",
  status: "TO_WATCH" as const,
  rating: 8,
  notes: "Heard great things about this one.",
};

describe("addToWatchlistSchema", () => {
  it("accepts a valid full payload", () => {
    const result = addToWatchlistSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts a payload with only the required movieId", () => {
    const result = addToWatchlistSchema.safeParse({
      movieId: validPayload.movieId,
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid movieId format", () => {
    const result = addToWatchlistSchema.safeParse({ movieId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const result = addToWatchlistSchema.safeParse({
      ...validPayload,
      status: "INVALID_STATUS",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a rating below 1", () => {
    const result = addToWatchlistSchema.safeParse({
      ...validPayload,
      rating: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a rating above 10", () => {
    const result = addToWatchlistSchema.safeParse({
      ...validPayload,
      rating: 11,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-integer rating", () => {
    const result = addToWatchlistSchema.safeParse({
      ...validPayload,
      rating: 8.5,
    });
    expect(result.success).toBe(false);
  });

  it("rejects notes longer than 1000 characters", () => {
    const result = addToWatchlistSchema.safeParse({
      ...validPayload,
      notes: "a".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe("updateWatchListItemSchema", () => {
  it("accepts a valid update payload", () => {
    const { movieId, ...updatePayload } = validPayload;
    const result = updateWatchListItemSchema.safeParse(updatePayload);
    expect(result.success).toBe(true);
  });

  it("accepts an empty payload (no fields being updated)", () => {
    const result = updateWatchListItemSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid fields in the update payload", () => {
    const result = updateWatchListItemSchema.safeParse({ rating: 15 });
    expect(result.success).toBe(false);
  });
});
