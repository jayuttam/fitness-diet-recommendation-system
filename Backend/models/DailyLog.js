// backend/models/DailyLog.js
import mongoose from "mongoose";

const dailyLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  intake: {
    type: Number,
    required: true,
    min: 0
  },
  burned: {
    type: Number,
    required: true,
    min: 0
  },
  workout: {
    type: Number,
    default: 0,
    min: 0
  },
  steps: {
    type: Number,
    default: 0,
    min: 0
  },
  notes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true  // This adds createdAt and updatedAt automatically
});

// Compound index to ensure one log per user per day
dailyLogSchema.index({ user: 1, date: 1 }, { unique: true });

const DailyLog = mongoose.model("DailyLog", dailyLogSchema);
export default DailyLog;