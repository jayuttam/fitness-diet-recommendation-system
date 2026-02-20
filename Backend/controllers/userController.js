import User from "../models/User.js";
import axios from "axios";

// =======================
// GET USER PROFILE
// =======================
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// =======================
// UPDATE PROFILE + ML
// =======================
export const updateUserProfile = async (req, res) => {
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ===== SAFE PROFILE UPDATE ===== */
    /* ===== NORMALIZE ENUMS ===== */
    if (req.body.gender)
      req.body.gender = req.body.gender.toLowerCase();

    if (req.body.goal)
      req.body.goal = req.body.goal.toLowerCase().replace(" ", "_");

    if (req.body.activityLevel)
      req.body.activityLevel = req.body.activityLevel.toLowerCase();

    /* ===== SAFE PROFILE UPDATE ===== */
    if (req.body.gender !== undefined) user.gender = req.body.gender;
    if (req.body.dob !== undefined) user.dob = new Date(req.body.dob);
    if (req.body.height !== undefined) user.height = Number(req.body.height);
    if (req.body.weight !== undefined) user.weight = Number(req.body.weight);
    if (req.body.activityLevel !== undefined)
      user.activityLevel = req.body.activityLevel;
    if (req.body.goal !== undefined) user.goal = req.body.goal;
    if (req.body.profilePic !== undefined)
      user.profilePic = req.body.profilePic;


    // Save profile FIRST (never block user update)
    await user.save({ validateBeforeSave: true });


    /* ===== CHECK IF ML CAN RUN ===== */
    const canRunML =
    user.dob instanceof Date &&
    !isNaN(user.dob) &&
    Number(user.height) > 0 &&
    Number(user.weight) > 0;

  if (!canRunML) {
    return res.json({
      message: "Profile updated (ML skipped)",
      profile: user,
      ml: user.mlResult || null,
    });
  }


    /* ===== CALCULATIONS ===== */
    const age =
      new Date().getFullYear() - new Date(user.dob).getFullYear();

    const bmi = (
      user.weight / ((user.height / 100) ** 2)
    ).toFixed(1);

    /* ===== ML AUTO TRIGGER (SAFE) ===== */
    try {
      const mlResponse = await axios.post(
        "http://localhost:8000/predict",
        {
          age,
          height_cm: user.height,
          weight_kg: user.weight,
          gender: user.gender,
          activity_level: user.activityLevel,
          goal: user.goal,
          bmi,
        }
      );

      user.mlResult = {
        calories: mlResponse.data.calories,
        diet_type: mlResponse.data.diet_type,
        workout_type: mlResponse.data.workout_type,
      };

      await user.save();
    } catch (mlError) {
      console.error("ML ERROR (ignored):", mlError.message);
      // ML failure must NOT break profile update
    }

    /* ===== FINAL RESPONSE ===== */
    res.json({
      message: "Profile updated successfully",
      profile: user,
      ml: user.mlResult || null,
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    res.status(500).json({ message: "Profile update failed" });
  }
};
