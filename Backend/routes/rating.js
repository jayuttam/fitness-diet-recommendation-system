import express from "express";
import Rating from "../models/Rating.js";

const router = express.Router();

/*
  CREATE RATING (Login Based)
*/
router.post("/", async (req, res) => {
  try {
    const { rating, review, userId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ user: userId });

    if (existingRating) {
      return res.status(400).json({
        message: "You have already submitted a rating.",
      });
    }

    const newRating = await Rating.create({
      user: userId,
      rating,
      review,
    });

    res.status(201).json(newRating);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/*
  GET ALL RATINGS
*/
router.get("/", async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(ratings);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;  // 🔥 VERY IMPORTANT