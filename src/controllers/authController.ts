import type { Request, Response } from 'express';
import { prisma } from '../config/db.js'
import * as bcrypt from 'bcrypt-ts';


const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body 

    // Check if user already exists
    const userExists = await prisma.user.findUnique({
        where: { email: email }
    })

    if (userExists) {
        return res.status(400).json({ error: "User with this email already exists" });
    }

    // Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    return res.status(201).json({ 
        status: "success",
        data: {
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        }
     });
};

export { register };