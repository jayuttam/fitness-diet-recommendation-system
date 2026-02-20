import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    referralCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "rewarded"],
      default: "pending",
    },
    rewardPoints: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better performance
referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ referredUser: 1 });

const Referral = mongoose.model("Referral", referralSchema);
export default Referral;