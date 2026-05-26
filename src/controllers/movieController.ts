import type { Request, Response } from 'express';
import { prisma } from '../config/db.js'

const getMovieById = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) return res.status(400).json({ error: "Invalid movie ID" });

    const movie = await prisma.movie.findUnique({
        where: { id }
    });

    if (!movie) return res.status(404).json({ error: "Movie not found" });

    return res.status(200).json({ status: "success", data: { movie } });
};

const getAllMovies = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [movies, totalCount] = await Promise.all([
        prisma.movie.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        prisma.movie.count()
    ]);

    return res.status(200).json({
        status: "success",
        data: {
            movies,
            pagination: {
                totalItems: totalCount,
                totalPages: Math.ceil(totalCount / limit),
                currentPage: page,
                limit
            }
        }
    });
};

const addMovie = async (req: Request, res: Response) => {
    const { title, overview, releaseYear, genres, runtime, posterUrl } = req.body 

    if (req.user === undefined) {
        return res.status(401).json({ error: "Not authorized" });
    }

    const movie = await prisma.movie.create({
        data: {
            title,
            overview,
            releaseYear,
            genres,
            runtime,
            posterUrl,
            createdBy: req.user.id
        }
    });

    return res.status(201).json({ 
        status: "success",
        data: { movie }
     });
};

const updateMovieDetails = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, overview, releaseYear, genres, runtime, posterUrl } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Invalid movie ID" });
    }

    const movie = await prisma.movie.findUnique({
        where: { id }
    });

    if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
    }

    if (req.user === undefined) {
        return res.status(401).json({ error: "Not authorized" });
    }

    if (movie.createdBy !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to update this movie" });
    }

    const updatedMovie = await prisma.movie.update({
        where: { id },
        data: {
            title,
            overview,
            releaseYear,
            genres,
            runtime,
            posterUrl
        }
    });

    return res.status(200).json({
        status: "success",
        data: { updatedMovie }
    });
};

const deleteMovie = async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
        return res.status(400).json({ error: "Invalid movie ID" });
    }

    const movie = await prisma.movie.findUnique({
        where: { id }
    });

    if (!movie) {
        return res.status(404).json({ error: "Movie not found" });
    }

    if (req.user === undefined) {
        return res.status(401).json({ error: "Not authorized" });
    }

    if (movie.createdBy !== req.user.id) {
        return res.status(403).json({ error: "Not authorized to delete this movie" });
    }

    await prisma.movie.delete({
        where: { id }
    });

    return res.status(200).json({ 
        status: "success",
        data: { movie }
    });
};

export { getMovieById, getAllMovies, addMovie, updateMovieDetails, deleteMovie };