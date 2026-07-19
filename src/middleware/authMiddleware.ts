import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import type { Request, Response, NextFunction } from 'express';

// Read token from request and check if token is valid
export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => { 
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]; // Split Authorization value to 2 elements in arrary ("Bearer", <token>) then get the 2nd element (<token>)
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        res.status(401).json({ error: "Not authorized, token missing" });
        return;
    }

    try { 
        // Verify token and get user ID
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            res.status(401).json({ error: "Not authorized, user not found" });
            return;
        }

        req.user = user;

        return next(); 
    } catch (error) { 
        console.error("Token verification failed:", error);
        res.status(401).json({ error: "Not authorized, token invalid" });
        return;
    }
};