import express from "express";
import { getMLPrediction } from "../controllers/mlController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/predict", protect, getMLPrediction);

export default router;
