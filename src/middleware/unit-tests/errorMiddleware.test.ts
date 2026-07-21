import { describe, it, expect, vi } from "vitest";
import type { Request, Response } from "express";
import { notFound, errorHandler } from "../errorMiddleware.js";
import { Prisma } from "../../generated/prisma/client.js";

function mockRes() {
  const res: Partial<Response> = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res as Response;
}

function mockReq(url: string = "/") {
  return { originalUrl: url } as Request;
}

describe("errorMiddleware", () => {
  describe("notFound", () => {
    it("creates a 404 error and passes it to next()", () => {
      const req = mockReq("/unknown-route");
      const res = mockRes();
      const next = vi.fn();

      notFound(req, res, next);

      expect(next).toHaveBeenCalledOnce();
      const errorArg = next.mock.calls[0]?.[0];
      expect(errorArg).toBeInstanceOf(Error);
      expect(errorArg.statusCode).toBe(404);
      expect(errorArg.message).toContain("Not Found - /unknown-route");
    });
  });

  describe("errorHandler", () => {
    it("handles generic errors with a 500 status", () => {
      const err = new Error("Database connection failed") as any;
      const req = mockReq();
      const res = mockRes();
      const next = vi.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "error",
          message: "Database connection failed",
        }),
      );
    });

    it("handles Prisma ClientValidationError with a 400 status", () => {
      const err = new Prisma.PrismaClientValidationError("Validation failed", {
        clientVersion: "5.0.0",
      });
      const req = mockReq();
      const res = mockRes();
      const next = vi.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid data provided",
        }),
      );
    });

    it("handles Prisma Unique Constraint Violation (P2002)", () => {
      const err = new Prisma.PrismaClientKnownRequestError(
        "Unique constraint failed",
        {
          code: "P2002",
          clientVersion: "5.0.0",
          meta: { target: ["email"] },
        },
      );
      const req = mockReq();
      const res = mockRes();
      const next = vi.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "email already exists",
        }),
      );
    });

    it("handles Prisma Record Not Found (P2025)", () => {
      const err = new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "5.0.0",
      });
      const req = mockReq();
      const res = mockRes();
      const next = vi.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Record not found",
        }),
      );
    });

    it("handles Prisma Foreign Key Constraint Violation (P2003)", () => {
      const err = new Prisma.PrismaClientKnownRequestError(
        "Foreign key constraint failed",
        {
          code: "P2003",
          clientVersion: "5.0.0",
        },
      );
      const req = mockReq();
      const res = mockRes();
      const next = vi.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Invalid reference: related record does not exist",
        }),
      );
    });
  });
});
