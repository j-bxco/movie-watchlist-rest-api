import { Prisma } from "../generated/prisma/client.js";
import type { Request, Response, NextFunction, ErrorRequestHandler } from "express";

// 404 Not Found - Handles non-existent routes
const notFound = (req: Request, res: Response, next: NextFunction) => {
    const error = new Error(`Not Found - ${req.originalUrl}`) as Error & { statusCode: number };;
    error.statusCode = 404;
    next(error);
};

// Global error handler - Handles all errors and sends appropriate responses
export const errorHandler: ErrorRequestHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
): void => {
    // Define default values safely
    let statusCode = err.statusCode || 500;
    let status = err.status || "error";
    let message = err.message || "Something went wrong";

    // Handle Prisma validation errors
    if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = 400;
        message = "Invalid data provided";
    }

    // Handle Prisma known request errors (Unique / Foreign Key constraints, Not Found)
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle Prisma unique constraint violations
        if (err.code === "P2002") {
            // Type assertion or optional chaining to safely read target fields from Prisma metadata
            const target = (err.meta?.target as string[])?.[0];
            const field = target || "field";
            statusCode = 400;
            message = `${field} already exists`;
        }

        // Handle record not found
        if (err.code === "P2025") {
            statusCode = 404;
            message = "Record not found";
        }

        // Handle Prisma foreign key constraint violations
        if (err.code === "P2003") {
            statusCode = 400;
            message = "Invalid reference: related record does not exist";
        }
    }

    // Send error response
    res.status(statusCode).json({
        status,
        message,
        // Only include stack trace in development
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};
