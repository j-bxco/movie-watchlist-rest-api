import type { Request, Response } from 'express';
import { prisma } from '../config/db.js'

const addToWatchList = async (req: Request, res: Response) => {
    const { userId, movieId, status, rating, notes } = req.body 

    // Check if movie exists
    const movie = await prisma.movie.findUnique({
        where: { id: movieId }
    })

    if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
    }

    // Check if movie is already in watchlist
    const existsInWatchlist = await prisma.watchlistItem.findUnique({
        where: { userId_movieId: { userId, movieId } }
    })

    if (existsInWatchlist) {
        return res.status(400).json({ error: "Movie is already in watchlist" });
    }

    const watchlistItem = await prisma.watchlistItem.create({
        data: {
            userId,
            movieId,
            status: status || "TO_WATCH",
            rating,
            notes
        }
    });

    return res.status(201).json({ 
        status: "success",
        data: { watchlistItem }
     });
};

export { addToWatchList };