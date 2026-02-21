import express from "express";
import mongoose from "mongoose";
import Rating from "../models/Rating.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    console.log("Incoming rating:", req.body);

    const { rating, review, userId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    // ✅ Prevent ObjectId crash
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid userId",
      });
    }

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
    console.error("Rating POST Error:", error);

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;