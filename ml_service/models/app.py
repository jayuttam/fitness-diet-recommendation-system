from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  # allow Node backend to call Flask

# ===============================
# Load ML models (SAFE METHOD)
# ===============================
try:
    calorie_model = joblib.load("calorie_model.pkl")
    diet_model = joblib.load("diet_model.pkl")
    workout_model = joblib.load("workout_model.pkl")
except Exception as e:
    print("❌ Error loading models:", e)
    raise e

# ===============================
# Encoders (must match training)
# ===============================
gender_map = {"male": 0, "female": 1}
activity_map = {"low": 0, "moderate": 1, "high": 2}
goal_map = {"weight_loss": 0, "muscle_gain": 1, "maintenance": 2}

# ===============================
# Health Check (optional but useful)
# ===============================
@app.route("/", methods=["GET"])
def health():
    return jsonify({"status": "ML service running"})


# ===============================
# Prediction Endpoint
# ===============================
@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.json

        # Validate required fields
        required_fields = [
            "age",
            "height_cm",
            "weight_kg",
            "gender",
            "activity_level",
            "goal",
            "bmi",
        ]

        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing field: {field}"}), 400

        # Prepare feature vector
        features = np.array([[
            data["age"],
            data["height_cm"],
            data["weight_kg"],
            gender_map[data["gender"]],
            activity_map[data["activity_level"]],
            goal_map[data["goal"]],
            data["bmi"],
        ]])

        # Predictions
        calories = calorie_model.predict(features)[0]
        diet = diet_model.predict(features)[0]
        workout = workout_model.predict(features)[0]

        return jsonify({
            "calories": int(calories),
            "diet_type": int(diet),
            "workout_type": int(workout),
        })

    except KeyError as e:
        return jsonify({"error": f"Invalid value: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": "Prediction failed", "details": str(e)}), 500


# ===============================
# Run Flask App
# ===============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
