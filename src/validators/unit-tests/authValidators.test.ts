import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema } from "../authValidators.js";

describe("registerSchema", () => {
  it("accepts a valid registration payload", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "JOHN@Example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("trims and lowercases the email", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "  JOHN@Example.com  ",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("john@example.com");
  });

  it("rejects a name shorter than 2 characters", () => {
    const result = registerSchema.safeParse({
      name: "J",
      email: "john@example.com",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email format", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a password shorter than 6 characters", () => {
    const result = registerSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "john@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing password", () => {
    const result = loginSchema.safeParse({ email: "john@example.com" });
    expect(result.success).toBe(false);
  });
});
