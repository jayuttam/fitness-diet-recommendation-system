// controllers/dailyLogController.js
import DailyLog from "../models/DailyLog.js";
import User from "../models/User.js";

// Save daily log
export const saveDailyLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, intake, burned, workout, steps, notes } = req.body;

    // Validate required fields
    if (!date || intake === undefined || burned === undefined) {
      return res.status(400).json({
        message: "Date, calories intake, and calories burned are required"
      });
    }

    // Check if log already exists for this date
    const existingLog = await DailyLog.findOne({
      user: userId,
      date: new Date(date)
    });

    let dailyLog;

    if (existingLog) {
      // Update existing log
      existingLog.intake = intake;
      existingLog.burned = burned;
      existingLog.workout = workout || 0;
      existingLog.steps = steps || 0;
      existingLog.notes = notes || "";
      await existingLog.save();
      dailyLog = existingLog;
    } else {
      // Create new log
      dailyLog = new DailyLog({
        user: userId,
        date: new Date(date),
        intake: parseInt(intake),
        burned: parseInt(burned),
        workout: parseInt(workout) || 0,
        steps: parseInt(steps) || 0,
        notes: notes || ""
      });
      await dailyLog.save();

      // Link to user
      await User.findByIdAndUpdate(userId, {
        $push: { dailyLogs: dailyLog._id }
      });
    }

    // Calculate net calories
    const netCalories = dailyLog.intake - dailyLog.burned;

    res.status(200).json({
      message: existingLog ? "Log updated successfully" : "Log saved successfully",
      log: {
        ...dailyLog.toObject(),
        netCalories,
        day: dailyLog.date.toISOString().slice(0, 10)
      }
    });

  } catch (error) {
    console.error("Error saving daily log:", error);
    res.status(500).json({ message: "Failed to save log" });
  }
};

// Get user's daily logs
export const getUserLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    let query = { user: userId };

    // Filter by date range if provided
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const logs = await DailyLog.find(query)
      .sort({ date: -1 })
      .limit(30); // Get last 30 logs

    // Calculate totals and statistics
    const totalLogs = logs.length;
    const totalIntake = logs.reduce((sum, log) => sum + log.intake, 0);
    const totalBurned = logs.reduce((sum, log) => sum + log.burned, 0);
    const totalNet = totalIntake - totalBurned;
    const avgIntake = totalLogs > 0 ? Math.round(totalIntake / totalLogs) : 0;
    const avgBurned = totalLogs > 0 ? Math.round(totalBurned / totalLogs) : 0;

    res.status(200).json({
      logs: logs.map(log => ({
        ...log.toObject(),
        netCalories: log.intake - log.burned,
        day: log.date.toISOString().slice(0, 10)
      })),
      summary: {
        totalLogs,
        totalIntake,
        totalBurned,
        totalNet,
        avgIntake,
        avgBurned
      }
    });

  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

// Get today's log
export const getTodayLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const log = await DailyLog.findOne({
      user: userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (log) {
      res.status(200).json({
        log: {
          ...log.toObject(),
          netCalories: log.intake - log.burned,
          day: log.date.toISOString().slice(0, 10)
        },
        exists: true
      });
    } else {
      res.status(200).json({
        log: null,
        exists: false,
        message: "No log found for today"
      });
    }

  } catch (error) {
    console.error("Error fetching today's log:", error);
    res.status(500).json({ message: "Failed to fetch today's log" });
  }
};

// Get log by date
export const getLogByDate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.params;

    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const log = await DailyLog.findOne({
      user: userId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    });

    if (log) {
      res.status(200).json({
        log: {
          ...log.toObject(),
          netCalories: log.intake - log.burned,
          day: log.date.toISOString().slice(0, 10)
        },
        exists: true
      });
    } else {
      res.status(200).json({
        log: null,
        exists: false,
        message: "No log found for this date"
      });
    }

  } catch (error) {
    console.error("Error fetching log by date:", error);
    res.status(500).json({ message: "Failed to fetch log" });
  }
};

// Update log
export const updateLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { logId } = req.params;
    const updateData = req.body;

    const log = await DailyLog.findOneAndUpdate(
      { _id: logId, user: userId },
      updateData,
      { new: true }
    );

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    res.status(200).json({
      message: "Log updated successfully",
      log: {
        ...log.toObject(),
        netCalories: log.intake - log.burned
      }
    });

  } catch (error) {
    console.error("Error updating log:", error);
    res.status(500).json({ message: "Failed to update log" });
  }
};

// Delete log
export const deleteLog = async (req, res) => {
  try {
    const userId = req.user.id;
    const { logId } = req.params;

    const log = await DailyLog.findOneAndDelete({
      _id: logId,
      user: userId
    });

    if (!log) {
      return res.status(404).json({ message: "Log not found" });
    }

    // Remove from user's logs array
    await User.findByIdAndUpdate(userId, {
      $pull: { dailyLogs: logId }
    });

    res.status(200).json({ message: "Log deleted successfully" });

  } catch (error) {
    console.error("Error deleting log:", error);
    res.status(500).json({ message: "Failed to delete log" });
  }
};