import axios from "axios";
import User from "../models/User.js";

export const getMLPrediction = async (req, res) => {
  try {
    const userId = req.user.id;

    // Log incoming data
    console.log("=== ML PREDICTION REQUEST ===");
    console.log("User ID:", userId);
    console.log("Request body:", req.body);

    const {
      age,
      height,
      weight,
      gender,
      activityLevel,
      goal,
      bmi,
    } = req.body;

    /* ===== CALL PYTHON ML API ===== */
    console.log("Calling Python ML API...");
    const response = await axios.post("https://fitness-ml-service.onrender.com/", {
      age: parseInt(age),
      height_cm: parseFloat(height),
      weight_kg: parseFloat(weight),
      gender: gender,
      activity_level: activityLevel,
      goal: goal,
      bmi: parseFloat(bmi),
    });

    console.log("Python ML API Response:", response.data);
    const mlResult = response.data;

    /* ===== VALIDATE ML RESULT ===== */
    if (!mlResult || Object.keys(mlResult).length === 0) {
      console.error("Empty ML result from Python API");
      return res.status(500).json({ 
        message: "ML API returned empty result",
        mlResult: null 
      });
    }

    // Ensure all required fields exist
    const validatedML = {
      calories: mlResult.calories || mlResult.recommended_calories || 2000,
      diet_type: mlResult.diet_type !== undefined ? mlResult.diet_type : 1,
      workout_type: mlResult.workout_type !== undefined ? mlResult.workout_type : 1,
      generated_at: new Date(),
      source: "ai_model"
    };

    console.log("Validated ML Result:", validatedML);

    /* ===== SAVE ML RESULT TO DB ===== */
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Save to ml field (not mlResult based on your frontend debug)
    user.ml = validatedML;
    
    // Also save to mlResult for compatibility
    user.mlResult = validatedML;

    await user.save();

    console.log("Saved to database for user:", userId);
    console.log("Saved data structure:", user.ml);

    /* ===== SEND RESPONSE ===== */
    res.status(200).json({
      message: "ML prediction generated & saved successfully",
      ml: validatedML,
      mlResult: validatedML, // Send both for compatibility
      success: true
    });

  } catch (error) {
    console.error("=== ML ERROR DETAILS ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    if (error.response) {
      console.error("Python API response error:", error.response.data);
      console.error("Python API status:", error.response.status);
    }
    
    // Return fallback data if ML fails
    const fallbackML = {
      calories: 2000,
      diet_type: 1,
      workout_type: 1,
      generated_at: new Date(),
      source: "fallback",
      error: error.message
    };

    // Try to save fallback to user
    try {
      const user = await User.findById(req.user.id);
      if (user) {
        user.ml = fallbackML;
        user.mlResult = fallbackML;
        await user.save();
      }
    } catch (saveError) {
      console.error("Failed to save fallback:", saveError.message);
    }

    res.status(200).json({
      message: "Using fallback recommendations",
      ml: fallbackML,
      mlResult: fallbackML,
      warning: "ML model failed, using calculated values"
    });
  }
};