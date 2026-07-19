import express from 'express';
import { Server } from 'http';
import { connectDB, disconnectDB } from './config/db.js';
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import { globalLimiter } from './middleware/rateLimitMiddleware.js';

connectDB();

const app = express();

// Body parsing middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);

// API Routes
app.use('/auth', authRoutes);
app.use('/movies', movieRoutes);
app.use('/watchlist', watchlistRoutes);

// Error handling middlewares
app.use(notFound);
app.use(errorHandler);

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