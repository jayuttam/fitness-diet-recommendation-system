import express from "express";
import multer from "multer";
import {
  getUserProfile,
  updateUserProfile,
} from "../controllers/userController.js";
import {
  saveDailyLog,
  getUserLogs,
  getTodayLog,
  getLogByDate,
  updateLog,
  deleteLog
} from "../controllers/dailyLogController.js"; // Add this import
import protect from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer(); // 🔥 REQUIRED

// User Profile Routes
router.get("/profile", protect, getUserProfile);
router.put(
  "/profile",
  protect,
  upload.none(), // 🔥 THIS FIXES req.body
  updateUserProfile
);

// Daily Log Routes - Add these
router.post("/daily-logs", protect, saveDailyLog);
router.get("/daily-logs", protect, getUserLogs);
router.get("/daily-logs/today", protect, getTodayLog);
router.get("/daily-logs/:date", protect, getLogByDate);
router.put("/daily-logs/:logId", protect, updateLog);
router.delete("/daily-logs/:logId", protect, deleteLog);

export default router;