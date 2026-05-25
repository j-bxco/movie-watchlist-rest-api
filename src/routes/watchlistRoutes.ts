import express from "express";
import { addToWatchList } from "../controllers/watchlistController.js"

const router = express.Router();

router.post("/", addToWatchList);

export default router;