import express from "express";
import "dotenv/config";

const router = express.Router();

// Define your movie routes here
router.get("/hello", (req, res) => {
  res.json({ message: "Welcome to the Movie Watchlist API!" });
});

export default router;