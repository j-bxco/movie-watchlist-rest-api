import type { Request, Response, NextFunction } from "express";

export const validateRequest = (schema: any, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const result = schema.safeParse(req[source]);
        
        if (!result.success) {
            const errorMessages = result.error.issues.map(
                (err: { path: string[]; message: string }) => 
                    `${err.path.join('.')} - ${err.message}`
            ).join(', ');
            return res.status(400).json({ message: errorMessages });
        }

        next();
    }
}