import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "male",
    },

    dob: {
      type: Date,
    },

    height: {
      type: Number,
    },

    weight: {
      type: Number,
    },

    activityLevel: {
      type: String,
      enum: ["sedentary", "light", "moderate", "active"],
      default: "moderate",
    },

    goal: {
      type: String,
      enum: ["weight_loss", "muscle_gain", "maintenance"],
      default: "weight_loss",
    },

    profilePic: {
      type: String,
    },

    // 🔥 REQUIRED FOR ML
    mlResult: {
      calories: {
        type: Number,
      },
      diet_type: {
        type: Number,
      },
      workout_type: {
        type: Number,
      },
    },
    

    // 🔥 ADD THIS FOR DAILY LOGS
    dailyLogs: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "DailyLog"
    }],
  },
  { timestamps: true }
  
);

const User = mongoose.model("User", userSchema);
export default User;