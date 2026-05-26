import type { Request, Response } from 'express';
import { prisma } from '../config/db.js'

const getAllMoviesInLoggedInUserWatchlist = async (req: Request, res: Response) => {
    if (req.user === undefined) {
        return res.status(401).json({ error: "Not authorized" });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [watchlist, totalItems] = await prisma.$transaction([
        prisma.watchlistItem.findMany({
            where: { userId: req.user.id },
            include: { movie: true }, 
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.watchlistItem.count({
            where: { userId: req.user.id }
        })
    ]);

    return res.status(200).json({
        status: "success",
        data: {
            watchlist,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages: Math.ceil(totalItems / limit)
            }
        }
    });
};

const getWatchListItem = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) return res.status(400).json({ error: "Invalid Watchlist Item ID" });

    const watchlistItem = await prisma.watchlistItem.findUnique({
        where: { id },
        include: { movie: true }
    });

    if (!watchlistItem) {
        return res.status(404).json({ error: "Watchlist item not found" });
    }

    return res.status(200).json({
        status: "success",
        data: { watchlistItem }
    });
};

const addToWatchList = async (req: Request, res: Response) => {
    const { movieId, status, rating, notes } = req.body 

    // Check if movie exists
    const movie = await prisma.movie.findUnique({
        where: { id: movieId }
    })

    if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
    }

    if (req.user === undefined) {
        return res.status(401).json({ error: "Not authorized" });
    }

    // Check if movie is already in watchlist
    const existsInWatchlist = await prisma.watchlistItem.findUnique({
        where: { 
            userId_movieId: { 
                userId: req.user.id, 
                movieId: movieId 
            } 
        }
    })

    if (existsInWatchlist) {
        return res.status(400).json({ error: "Movie is already in watchlist" });
    }

    const watchlistItem = await prisma.watchlistItem.create({
        data: {
            userId: req.user.id,
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

const updateWatchListItem = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { status, rating, notes } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Invalid watchlist item ID" });
    }

    const watchlistItem = await prisma.watchlistItem.findUnique({
        where: { id }
    });

    if (!watchlistItem) {
        return res.status(404).json({ error: "Watchlist item not found" });
    }

    if (req.user === undefined) {
        return res.status(401).json({ error: "Not authorized" });
    }

    if (watchlistItem.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to update this watchlist item" });
    }

    const updatedWatchlistItem = await prisma.watchlistItem.update({
        where: { id },
        data: {
            status,
            rating,
            notes
        }
    });

    return res.status(200).json({
        status: "success",
        data: { updatedWatchlistItem }
    });
};

const removeFromWatchList = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
        return res.status(400).json({ error: "Invalid watchlist item ID" });
    }

    const watchlistItem = await prisma.watchlistItem.findUnique({
        where: { id }
    });

    if (!watchlistItem) {
        return res.status(404).json({ error: "Watchlist item not found" });
    }

    if (req.user === undefined) {
        return res.status(401).json({ error: "Not authorized" });
    }

    if (watchlistItem.userId !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to delete this watchlist item" });
    }

    await prisma.watchlistItem.delete({
        where: { id }
    });

    return res.status(200).json({ 
        status: "success",
        data: { watchlistItem }
    });
};

export { getAllMoviesInLoggedInUserWatchlist, getWatchListItem, addToWatchList, updateWatchListItem, removeFromWatchList };