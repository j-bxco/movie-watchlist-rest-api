import express from "express";
import { addToWatchList, updateWatchListItem, removeFromWatchList, getAllMoviesInLoggedInUserWatchlist, getWatchListItem } from "../controllers/watchlistController.js"
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addToWatchlistSchema, updateWatchListItemSchema } from "../validators/watchlistValidators.js";
import { validateRequest } from "../middleware/validateRequest.js";
import { paginationSchema } from "../validators/paginationValidator.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", validateRequest(paginationSchema, 'query'), getAllMoviesInLoggedInUserWatchlist);
router.get("/:id", getWatchListItem);
router.post("/", validateRequest(addToWatchlistSchema, 'body'), addToWatchList);
router.put("/:id", validateRequest(updateWatchListItemSchema, 'body'), updateWatchListItem);
router.delete("/:id", removeFromWatchList);

export default router;