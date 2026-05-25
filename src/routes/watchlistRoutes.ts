import express from "express";
import { addToWatchList, updateWatchListItem, removeFromWatchList } from "../controllers/watchlistController.js"
import { authMiddleware } from "../middleware/authMiddleware.js";
import { addToWatchlistSchema, updateWatchListItemSchema } from "../validators/watchlistValidators.js";
import { validateRequest } from "../middleware/validateRequestMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", validateRequest(addToWatchlistSchema), addToWatchList);

router.put("/:id", validateRequest(updateWatchListItemSchema), updateWatchListItem);

router.delete("/:id", removeFromWatchList);

export default router;