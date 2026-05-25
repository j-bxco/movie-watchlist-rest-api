import { z } from "zod";

const watchlistItems = {
    status: z.enum(["TO_WATCH", "WATCHING", "COMPLETED", "DROPPED"], {
        message: "Status must be one of: TO_WATCH, WATCHING, COMPLETED, DROPPED",
    }).optional(),
    rating: z.coerce
        .number()
        .int("Rating must be an integer")
        .min(1, "Rating must be between 1 and 10")
        .max(10, "Rating must be between 1 and 10")
        .optional(),
    notes: z.string().max(1000, "Notes must be at most 1000 characters").optional(),
};

const addToWatchlistSchema = z.object({
    movieId: z.uuid({ message: "Invalid movie ID format" }),
    ...watchlistItems,
});

const updateWatchListItemSchema = z.object(watchlistItems);

export { addToWatchlistSchema, updateWatchListItemSchema };