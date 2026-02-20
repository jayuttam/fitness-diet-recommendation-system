import { useState, useMemo, useEffect, useCallback } from "react";
import API from "../../utils/api";
import { FiCamera } from "react-icons/fi";
import "./Profile.css";

const Profile = () => {
  const token = localStorage.getItem("token");

  const [avatar, setAvatar] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "male",
    dob: "",
    height: "",
    weight: "",
    activityLevel: "moderate",
    goal: "weight_loss",
    profilePic: "",
  });

  /* ========= FETCH PROFILE ========= */
  const fetchProfile = async () => {
    try {
      const res = await API.get(
        "/api/users/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFormData(res.data);
      setAvatar(res.data.profilePic || null);

      // Set ML results from either field
      if (res.data.ml && Object.keys(res.data.ml).length > 0) {
        setMlResult(res.data.ml);
      } else if (res.data.mlResult && Object.keys(res.data.mlResult).length > 0) {
        setMlResult(res.data.mlResult);
      } else {
        setMlResult(null);
      }
    } catch (err) {
      console.error(err.response?.data?.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
  }, [token]);

  /* ========= HANDLERS ========= */
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setHasChanged(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      setFormData({ ...formData, profilePic: reader.result });
      setHasChanged(true);
    };
    reader.readAsDataURL(file);
  };

  /* ========= CALCULATIONS ========= */
  const age = useMemo(() => {
    if (!formData.dob) return 0;
    const dob = new Date(formData.dob);
    const today = new Date();
    let years = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) years--;
    return years;
  }, [formData.dob]);

  const bmi = useMemo(() => {
    if (!formData.height || !formData.weight) return 0;
    const h = formData.height / 100;
    return (formData.weight / (h * h)).toFixed(1);
  }, [formData.height, formData.weight]);

  const bmiStatus =
    bmi < 18.5
      ? "Underweight"
      : bmi < 24.9
      ? "Normal"
      : bmi < 29.9
      ? "Overweight"
      : "Obese";

  const activityFactor = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
  };

  const calories = useMemo(() => {
    if (!formData.height || !formData.weight) return 0;

    const bmr =
      formData.gender === "male"
        ? 10 * formData.weight + 6.25 * formData.height - 5 * age + 5
        : 10 * formData.weight + 6.25 * formData.height - 5 * age - 161;

    let tdee = bmr * activityFactor[formData.activityLevel];
    if (formData.goal === "weight_loss") tdee -= 500;
    if (formData.goal === "muscle_gain") tdee += 300;

    return Math.round(tdee);
  }, [formData, age]);

  /* ========= GENERATE AI PREDICTIONS ========= */
  const generateAIPredictions = useCallback(async () => {
    // Only generate if we have required data
    if (!formData.height || !formData.weight || !formData.dob) {
      return null;
    }

    setGeneratingAI(true);
    try {
      const response = await API.post(
        "/api/ml/predict",
        {
          age,
          height: formData.height,
          weight: formData.weight,
          gender: formData.gender,
          activityLevel: formData.activityLevel,
          goal: formData.goal,
          bmi: parseFloat(bmi)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update ML results
      if (response.data.ml) {
        setMlResult(response.data.ml);
        return response.data.ml;
      } else if (response.data.mlResult) {
        setMlResult(response.data.mlResult);
        return response.data.mlResult;
      }
    } catch (error) {
      console.error("AI generation error:", error);
    } finally {
      setGeneratingAI(false);
    }
    return null;
  }, [formData, age, bmi, token]);

  /* ========= AUTO-GENERATE AI WHEN DATA CHANGES ========= */
  useEffect(() => {
    // Check if important fitness data has changed
    const fitnessFieldsChanged = 
      formData.height && 
      formData.weight && 
      formData.dob && 
      hasChanged;

    // Auto-generate AI predictions when fitness data is complete and has changed
    if (fitnessFieldsChanged) {
      const timer = setTimeout(() => {
        generateAIPredictions();
      }, 1000); // 1 second delay to avoid too many API calls

      return () => clearTimeout(timer);
    }
  }, [formData.height, formData.weight, formData.dob, formData.gender, formData.activityLevel, formData.goal, hasChanged, generateAIPredictions]);

  /* ========= SAVE PROFILE ========= */
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First, generate AI predictions if data has changed
      let mlData = null;
      if (hasChanged) {
        mlData = await generateAIPredictions();
      }

      // Prepare data to save
      const dataToSave = { ...formData };
      if (mlData) {
        dataToSave.ml = mlData;
      }

      const res = await API.put(
        "/api/users/profile",
        dataToSave,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update with any ML data returned from save
      if (res.data.ml) {
        setMlResult(res.data.ml);
      } else if (res.data.mlResult) {
        setMlResult(res.data.mlResult);
      }

      setHasChanged(false);
      alert("Profile updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ========= CHECK IF AI SHOULD BE GENERATED ========= */
  const shouldShowAI = useMemo(() => {
    return formData.height && formData.weight && formData.dob;
  }, [formData.height, formData.weight, formData.dob]);

  return (
    <div>
      <h1 className="page-title">Profile</h1>
      <p className="page-subtitle">
        {generatingAI ? "Generating AI recommendations..." : "Your fitness data is calculated automatically"}
      </p>

      <form className="card" onSubmit={handleSave}>
        {/* AVATAR */}
        <div className="profile-avatar-row mb-4">
          <div className="profile-avatar-box">
            {avatar ? (
              <img src={avatar} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">
                {formData.name?.charAt(0) || "U"}
              </div>
            )}

            <label className="avatar-upload-btn">
              <FiCamera />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="profile-avatar-text">
            <h3>Profile Photo</h3>
            <p className="text-muted">
              Upload a clear photo for your profile.
            </p>
          </div>
        </div>

        {/* BASIC INFO */}
        <h3 className="mb-2">Basic Information</h3>
        <div className="grid-2 mb-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
          />

          <input type="email" value={formData.email} disabled />

          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <input
            type="date"
            name="dob"
            value={formData.dob?.slice(0, 10) || ""}
            onChange={handleChange}
          />
        </div>

        {/* FITNESS INFO */}
        <h3 className="mb-2">Fitness Details</h3>
        <div className="grid-2 mb-4">
          <input
            type="number"
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="Height (cm)"
          />

          <input
            type="number"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="Weight (kg)"
          />

          <select
            name="activityLevel"
            value={formData.activityLevel}
            onChange={handleChange}
          >
            <option value="sedentary">Sedentary</option>
            <option value="light">Lightly Active</option>
            <option value="moderate">Moderately Active</option>
            <option value="active">Very Active</option>
          </select>

          <select name="goal" value={formData.goal} onChange={handleChange}>
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        {/* SUMMARY */}
        <h3 className="mb-2">Your Fitness Summary</h3>
        <div className="grid-3 mb-4">
          <div className="card">
            <p className="text-muted">Age</p>
            <p className="text-value">{age} years</p>
          </div>

          <div className="card">
            <p className="text-muted">BMI</p>
            <p className="text-value">{bmi}</p>
            <small>{bmiStatus}</small>
          </div>

          <div className="card">
            <p className="text-muted">Daily Calories</p>
            <p className="text-value">{calories} kcal</p>
          </div>
        </div>

        {/* AI RECOMMENDATIONS */}
        {shouldShowAI && (
          <>
            <h3 className="mb-2">
              AI Recommendations 
              {generatingAI && <span style={{ fontSize: '12px', color: '#666', marginLeft: '8px' }}>(updating...)</span>}
            </h3>
            
            {mlResult ? (
              <div className="grid-3 mb-4">
                <div className="card">
                  <p className="text-muted">Recommended Calories</p>
                  <p className="text-value">
                    {mlResult.calories || mlResult.recommended_calories || "-"} kcal
                  </p>
                </div>

                <div className="card">
                  <p className="text-muted">Diet Type</p>
                  <p className="text-value">
                    {mlResult.diet_type === 0
                      ? "Low Carb"
                      : mlResult.diet_type === 1
                      ? "Balanced"
                      : mlResult.diet_type === 2
                      ? "High Protein"
                      : "Custom"}
                  </p>
                </div>

                <div className="card">
                  <p className="text-muted">Workout Intensity</p>
                  <p className="text-value">
                    {mlResult.workout_type === 0
                      ? "Light"
                      : mlResult.workout_type === 1
                      ? "Moderate"
                      : mlResult.workout_type === 2
                      ? "Intense"
                      : "Custom"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: '20px', textAlign: 'center' }}>
                <p className="text-muted">
                  {generatingAI ? "Generating AI recommendations..." : "AI recommendations will appear here"}
                </p>
                <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                  Fill in all fitness details to generate personalized AI recommendations
                </p>
              </div>
            )}
          </>
        )}

        <button className="btn" disabled={loading || generatingAI}>
          {loading ? "Saving..." : generatingAI ? "Generating AI..." : "Save Changes"}
        </button>

        {hasChanged && (
          <p style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '8px' }}>
            AI recommendations will update automatically when you save
          </p>
        )}
      </form>
    </div>
  );
};

export default Profile;