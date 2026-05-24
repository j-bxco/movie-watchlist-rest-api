import jwt, { type SignOptions } from 'jsonwebtoken'; 
import type { Response } from 'express';

export const generateToken = (userId: string, res: Response): string => {
    const payload = { id: userId };
    const jwtSecret = process.env.JWT_SECRET;
    
    const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '7d') as NonNullable<SignOptions['expiresIn']>;

    if (!jwtSecret) {
        throw new Error('Missing JWT secret');
    }

    const token = jwt.sign(payload, jwtSecret, {
        expiresIn: jwtExpiresIn,
    });

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return token;
};