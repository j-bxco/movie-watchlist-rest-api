import pg from 'pg';
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"]
    : ["error"]
});

const connectDB = async () => {
    try {
        await prisma.$connect();
        console.log("Connected to the database via Prisma.");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        process.exit(1);
    }
};

const disconnectDB = async () => {
    try {
        await prisma.$disconnect();
        await pool.end();
        console.log("Disconnected from the database via Prisma.");
    } catch (error) {
        console.error("Error disconnecting from the database:", error);
    }
};

export { prisma, connectDB, disconnectDB };