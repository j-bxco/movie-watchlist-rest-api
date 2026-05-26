import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { createMovieSchema, updateMovieSchema } from "../validators/movieValidators.js";
import { addMovie, deleteMovie, getAllMovies, getMovieById, updateMovieDetails } from "../controllers/movieController.js";
import { paginationSchema } from "../validators/paginationValidator.js";

const router = express.Router();

// Public routes
router.get("/", validateRequest(paginationSchema, 'query'), getAllMovies);
router.get("/:id", getMovieById);

router.use(authMiddleware);

router.post("/", validateRequest(createMovieSchema, 'body'), addMovie);
router.put("/:id", validateRequest(updateMovieSchema, 'body'), updateMovieDetails);
router.delete("/:id", deleteMovie);

export default router;