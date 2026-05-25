import express from "express";
import { addToWatchList, updateWatchListItem, removeFromWatchList } from "../controllers/watchlistController.js"
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addToWatchList);

router.put("/:id", updateWatchListItem);

router.delete("/:id", removeFromWatchList);

export default router;