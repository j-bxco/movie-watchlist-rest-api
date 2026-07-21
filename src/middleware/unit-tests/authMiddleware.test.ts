import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { authMiddleware } from "../authMiddleware.js";

// Mocks

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

vi.mock("../../config/db.js", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

// Helpers

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

// Test Suite

describe("authMiddleware", () => {
  let jwt: { verify: ReturnType<typeof vi.fn> };
  let prisma: { user: { findUnique: ReturnType<typeof vi.fn> } };

  beforeEach(async () => {
    vi.clearAllMocks();
    jwt = (await import("jsonwebtoken")).default as unknown as typeof jwt;
    const db = await import("../../config/db.js");
    prisma = db.prisma as unknown as typeof prisma;
  });

  it("returns 401 when no token is present (no header, no cookie)", async () => {
    const req = { headers: {}, cookies: {} } as Request;
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("reads the token from the Authorization: Bearer header", async () => {
    const fakeUser = { id: "user-1", name: "Julia" };
    jwt.verify.mockReturnValue({ id: "user-1" });
    prisma.user.findUnique.mockResolvedValue(fakeUser);

    const req = {
      headers: { authorization: "Bearer valid-token" },
      cookies: {},
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("valid-token", expect.any(String));
    expect(next).toHaveBeenCalledOnce();
    expect((req as any).user).toEqual(fakeUser);
  });

  it("reads the token from the jwt cookie", async () => {
    const fakeUser = { id: "user-1", name: "Julia" };
    jwt.verify.mockReturnValue({ id: "user-1" });
    prisma.user.findUnique.mockResolvedValue(fakeUser);

    const req = {
      headers: {},
      cookies: { jwt: "cookie-token" },
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith("cookie-token", expect.any(String));
    expect(next).toHaveBeenCalledOnce();
  });

  it("returns 401 when the token is invalid or expired", async () => {
    jwt.verify.mockImplementation(() => {
      throw new Error("jwt expired");
    });

    const req = {
      headers: { authorization: "Bearer bad-token" },
      cookies: {},
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringMatching(/token invalid/i) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when the user decoded from the token doesn't exist in the DB", async () => {
    jwt.verify.mockReturnValue({ id: "ghost-user" });
    prisma.user.findUnique.mockResolvedValue(null);

    const req = {
      headers: { authorization: "Bearer valid-token" },
      cookies: {},
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringMatching(/user not found/i) })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches req.user and calls next() for a valid token and existing user", async () => {
    const fakeUser = { id: "user-1", name: "Julia", email: "julia@example.com" };
    jwt.verify.mockReturnValue({ id: "user-1" });
    prisma.user.findUnique.mockResolvedValue(fakeUser);

    const req = {
      headers: { authorization: "Bearer valid-token" },
      cookies: {},
    } as unknown as Request;
    const res = mockRes();
    const next = vi.fn();

    await authMiddleware(req, res, next);

    expect((req as any).user).toEqual(fakeUser);
    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });
});
