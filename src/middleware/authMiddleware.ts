import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import type { Request, Response, NextFunction } from 'express';

// Read token from request and check if token is valid
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => { 
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1]; // Split Authorization value to 2 elements in arrary ("Bearer", <token>) then get the 2nd element (<token>)
        console.log("Token found in headers: ", token);
    } else if (req.cookies?.jwt) {
        token = req.cookies.jwt;
        console.log("Token found in cookies: ", token);
    }

    if (!token) {
        return res.status(401).json({ error: "Not authorized, token missing" });
    }

    try { 
        // Verify token and get user ID
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({ error: "Not authorized, user not found" });
        }

        console.log("Decoded user ID:", decoded.id);
        req.user = user;

        next(); 
    } catch (error) { 
        console.error("Token verification failed:", error);
        return res.status(401).json({ error: "Not authorized, token invalid" });
    }
};