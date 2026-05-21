import express from 'express';
import { config } from 'dotenv';
import { Server } from 'http';
import movieRoutes from './routes/movieRoutes.js';
import { connectDB, disconnectDB } from './config/db.js';

config();
connectDB();

const app = express();

// API Routes
app.use('/movies', movieRoutes);

const PORT = 5001;

const server: Server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections (e.g., database connection issues)
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Handle uncaught exceptions (e.g., programming errors)
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  server.close(async () => {
    await disconnectDB();
    process.exit(1);
  });
});

// Graceful shutdown on SIGINT (e.g., Ctrl+C)
process.on("SIGINT", async () => {
  console.log("Received SIGINT. Shutting down gracefully...");
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});