import express from 'express';
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import { globalLimiter } from './middleware/rateLimitMiddleware.js';

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

export default app;