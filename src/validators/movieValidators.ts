import { z } from "zod";

const movieBaseSchema = z.object({
  title: z.string().trim().min(1, "Movie title is required"),
  releaseYear: z.coerce
    .number()
    .int("Release year must be an integer")
    .min(1888, "Release year must be a valid year")
    .max(new Date().getFullYear() + 10, "Release year must be a valid year"),
  overview: z.string().trim().optional(),
  genres: z
    .array(z.string(), { message: "All genres must be strings" })
    .optional(),
  runtime: z.coerce
    .number()
    .int("Runtime must be an integer")
    .positive("Runtime must be a positive number (in minutes)")
    .optional(),
  posterUrl: z.string().url("Poster URL must be a valid URL").optional(),
});

const createMovieSchema = movieBaseSchema;

const updateMovieSchema = movieBaseSchema.partial();

export { createMovieSchema, updateMovieSchema };