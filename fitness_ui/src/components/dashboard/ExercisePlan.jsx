import { useState, useEffect } from "react";
import API from "../../utils/api";
import './ExercisePlan.css';

const EXERCISE_PLANS = {
  0: { // Light (workout_type: 0)
    name: "Light Intensity",
    description: "Gentle workouts focused on mobility, recovery, and building foundational fitness habits.",
    frequency: "3-4 days / week",
    duration: "30-45 mins",
    focus: "Recovery & Mobility",
    schedule: [
      {
        day: "Monday",
        type: "Active Recovery",
        focus: "Full body mobility",
        exercises: [
          { name: "Walking", sets: "20 min", reps: "-", rest: "-", notes: "Brisk pace, outdoors if possible" },
          { name: "Dynamic Stretching", sets: "2", reps: "10 each", rest: "30s", notes: "Arm circles, leg swings, torso twists" },
          { name: "Light Core", sets: "2", reps: "12-15", rest: "45s", notes: "Plank, bird-dog, dead bug" }
        ],
        duration: "40 min",
        intensity: "Low"
      },
      {
        day: "Wednesday",
        type: "Resistance Training",
        focus: "Full body strength",
        exercises: [
          { name: "Bodyweight Squats", sets: "3", reps: "12-15", rest: "60s", notes: "Focus on form, no weight" },
          { name: "Push-ups (modified)", sets: "3", reps: "8-12", rest: "60s", notes: "Knees or wall push-ups" },
          { name: "Bent-over Rows", sets: "3", reps: "12-15", rest: "60s", notes: "Light dumbbells or resistance bands" },
          { name: "Glute Bridges", sets: "3", reps: "15-20", rest: "45s", notes: "Hold at top for 2 seconds" }
        ],
        duration: "45 min",
        intensity: "Low-Moderate"
      },
      {
        day: "Friday",
        type: "Cardio & Flexibility",
        focus: "Endurance and flexibility",
        exercises: [
          { name: "Stationary Bike", sets: "25 min", reps: "-", rest: "-", notes: "Moderate pace, consistent resistance" },
          { name: "Static Stretching", sets: "Hold 30s", reps: "2 each", rest: "-", notes: "Hamstrings, quads, chest, back" },
          { name: "Foam Rolling", sets: "1 min", reps: "each area", rest: "-", notes: "Focus on tight spots" }
        ],
        duration: "35 min",
        intensity: "Low"
      },
      {
        day: "Saturday",
        type: "Active Rest Day",
        focus: "Gentle movement",
        exercises: [
          { name: "Yoga/Stretching", sets: "30 min", reps: "-", rest: "-", notes: "Follow along video" },
          { name: "Light Walking", sets: "15 min", reps: "-", rest: "-", notes: "Leisurely pace" }
        ],
        duration: "45 min",
        intensity: "Very Low"
      }
    ],
    benefits: [
      "Improved joint mobility",
      "Reduced injury risk",
      "Sustainable habit building",
      "Better recovery"
    ],
    tips: [
      "Focus on form over intensity",
      "Listen to your body",
      "Stay consistent with schedule",
      "Increase gradually over weeks"
    ]
  },
  
  1: { // Moderate (workout_type: 1)
    name: "Moderate Intensity",
    description: "Balanced workout program combining strength, cardio, and flexibility for overall fitness.",
    frequency: "4-5 days / week",
    duration: "45-60 mins",
    focus: "Balanced Fitness",
    schedule: [
      {
        day: "Monday",
        type: "Upper Body Strength",
        focus: "Chest, back, shoulders",
        exercises: [
          { name: "Bench Press", sets: "4", reps: "8-12", rest: "90s", notes: "Barbell or dumbbell" },
          { name: "Pull-ups/Lat Pulldowns", sets: "4", reps: "8-12", rest: "90s", notes: "Assisted if needed" },
          { name: "Overhead Press", sets: "3", reps: "10-12", rest: "75s", notes: "Standing or seated" },
          { name: "Dumbbell Rows", sets: "3", reps: "12-15", rest: "60s", notes: "Focus on back squeeze" },
          { name: "Tricep Dips", sets: "3", reps: "12-15", rest: "60s", notes: "Bench or parallel bars" }
        ],
        duration: "55 min",
        intensity: "Moderate"
      },
      {
        day: "Tuesday",
        type: "Cardio Conditioning",
        focus: "Heart health & endurance",
        exercises: [
          { name: "Treadmill Run", sets: "30 min", reps: "-", rest: "-", notes: "Interval: 3 min run, 1 min walk" },
          { name: "Rowing Machine", sets: "10 min", reps: "-", rest: "-", notes: "Moderate pace, focus on form" },
          { name: "Jump Rope", sets: "5", reps: "1 min", rest: "30s", notes: "Focus on rhythm" }
        ],
        duration: "45 min",
        intensity: "Moderate-High"
      },
      {
        day: "Wednesday",
        type: "Lower Body Strength",
        focus: "Legs and core",
        exercises: [
          { name: "Barbell Squats", sets: "4", reps: "8-12", rest: "90s", notes: "Depth to parallel" },
          { name: "Romanian Deadlifts", sets: "3", reps: "10-12", rest: "75s", notes: "Focus on hamstrings" },
          { name: "Walking Lunges", sets: "3", reps: "12 each leg", rest: "60s", notes: "Bodyweight or light dumbbells" },
          { name: "Leg Press", sets: "3", reps: "12-15", rest: "60s", notes: "Controlled movement" },
          { name: "Calf Raises", sets: "4", reps: "15-20", rest: "45s", notes: "Full range of motion" }
        ],
        duration: "50 min",
        intensity: "Moderate"
      },
      {
        day: "Thursday",
        type: "Active Recovery",
        focus: "Mobility & flexibility",
        exercises: [
          { name: "Dynamic Warm-up", sets: "10 min", reps: "-", rest: "-", notes: "Full body movements" },
          { name: "Yoga Flow", sets: "30 min", reps: "-", rest: "-", notes: "Focus on mobility poses" },
          { name: "Foam Rolling", sets: "10 min", reps: "-", rest: "-", notes: "All major muscle groups" }
        ],
        duration: "50 min",
        intensity: "Low"
      },
      {
        day: "Friday",
        type: "Full Body Circuit",
        focus: "Metabolic conditioning",
        exercises: [
          { name: "Kettlebell Swings", sets: "4", reps: "15", rest: "45s", notes: "Focus on hip hinge" },
          { name: "Push-ups", sets: "4", reps: "15", rest: "45s", notes: "Full range" },
          { name: "Bodyweight Squats", sets: "4", reps: "20", rest: "45s", notes: "Tempo: 2 down, 1 up" },
          { name: "Plank", sets: "4", reps: "45s", rest: "30s", notes: "Maintain straight line" },
          { name: "Burpees", sets: "4", reps: "10", rest: "45s", notes: "Moderate pace" }
        ],
        duration: "40 min",
        intensity: "Moderate-High"
      },
      {
        day: "Saturday",
        type: "Outdoor Activity",
        focus: "Enjoyable movement",
        exercises: [
          { name: "Hiking", sets: "60 min", reps: "-", rest: "-", notes: "Nature trail if possible" },
          { name: "Sports", sets: "45 min", reps: "-", rest: "-", notes: "Basketball, tennis, soccer" }
        ],
        duration: "60 min",
        intensity: "Variable"
      }
    ],
    benefits: [
      "Improved cardiovascular health",
      "Increased muscle tone",
      "Better body composition",
      "Enhanced energy levels"
    ],
    tips: [
      "Progressive overload each week",
      "Mix cardio and strength",
      "Include rest days",
      "Track progress weekly"
    ]
  },
  
  2: { // Intense (workout_type: 2)
    name: "High Intensity",
    description: "Advanced training program focused on maximum fat loss, muscle building, and performance.",
    frequency: "5-6 days / week",
    duration: "60-75 mins",
    focus: "Performance & Transformation",
    schedule: [
      {
        day: "Monday",
        type: "Strength - Push",
        focus: "Chest, shoulders, triceps",
        exercises: [
          { name: "Barbell Bench Press", sets: "5", reps: "5-8", rest: "120s", notes: "Heavy weight, spotter recommended" },
          { name: "Incline Dumbbell Press", sets: "4", reps: "8-10", rest: "90s", notes: "45-degree angle" },
          { name: "Military Press", sets: "4", reps: "6-8", rest: "90s", notes: "Standing strict form" },
          { name: "Weighted Dips", sets: "4", reps: "8-12", rest: "75s", notes: "Add weight if possible" },
          { name: "Tricep Pushdowns", sets: "4", reps: "12-15", rest: "60s", notes: "Drop sets on last set" },
          { name: "Lateral Raises", sets: "4", reps: "12-15", rest: "60s", notes: "Light weight, perfect form" }
        ],
        duration: "70 min",
        intensity: "High"
      },
      {
        day: "Tuesday",
        type: "HIIT Cardio",
        focus: "Fat burning",
        exercises: [
          { name: "Sprint Intervals", sets: "10", reps: "30s sprint", rest: "90s", notes: "Maximum effort sprints" },
          { name: "Battle Ropes", sets: "5", reps: "45s", rest: "45s", notes: "Double waves, alternating waves" },
          { name: "Assault Bike", sets: "5", reps: "1 min", rest: "1 min", notes: "All-out effort" },
          { name: "Burpees", sets: "5", reps: "20", rest: "60s", notes: "Complete each rep fully" }
        ],
        duration: "50 min",
        intensity: "Very High"
      },
      {
        day: "Wednesday",
        type: "Strength - Pull",
        focus: "Back, biceps",
        exercises: [
          { name: "Deadlifts", sets: "5", reps: "3-5", rest: "180s", notes: "Focus on form, heavy weight" },
          { name: "Pull-ups", sets: "5", reps: "AMRAP", rest: "120s", notes: "Weighted if possible" },
          { name: "Barbell Rows", sets: "4", reps: "8-10", rest: "90s", notes: "Explosive pull, controlled lower" },
          { name: "Face Pulls", sets: "4", reps: "15-20", rest: "60s", notes: "Shoulder health focus" },
          { name: "Barbell Curls", sets: "4", reps: "8-12", rest: "75s", notes: "Strict form, no swing" },
          { name: "Hammer Curls", sets: "3", reps: "12-15", rest: "60s", notes: "Superset with barbell curls" }
        ],
        duration: "75 min",
        intensity: "High"
      },
      {
        day: "Thursday",
        type: "Conditioning",
        focus: "Metabolic work",
        exercises: [
          { name: "EMOM Circuit", sets: "20 min", reps: "Every minute", rest: "-", notes: "10 cal row, 15 KB swings, 10 box jumps" },
          { name: "Farmer's Walk", sets: "5", reps: "50m", rest: "90s", notes: "Heavy weight, maintain posture" },
          { name: "Sled Push", sets: "5", reps: "40m", rest: "120s", notes: "Heavy load, explosive pushes" }
        ],
        duration: "60 min",
        intensity: "Very High"
      },
      {
        day: "Friday",
        type: "Strength - Legs",
        focus: "Quads, hamstrings, glutes",
        exercises: [
          { name: "Back Squats", sets: "5", reps: "5-8", rest: "150s", notes: "Below parallel, heavy weight" },
          { name: "Front Squats", sets: "4", reps: "6-8", rest: "120s", notes: "Clean grip or cross-arm" },
          { name: "Leg Press", sets: "4", reps: "10-12", rest: "90s", notes: "Deep range, slow negative" },
          { name: "Romanian Deadlifts", sets: "4", reps: "8-10", rest: "90s", notes: "Focus on hamstring stretch" },
          { name: "Walking Lunges", sets: "3", reps: "20 total", rest: "75s", notes: "Heavy dumbbells" },
          { name: "Leg Extensions", sets: "4", reps: "15-20", rest: "60s", notes: "Burnout sets" }
        ],
        duration: "75 min",
        intensity: "High"
      },
      {
        day: "Saturday",
        type: "Active Recovery / Weak Points",
        focus: "Mobility & lagging muscles",
        exercises: [
          { name: "Mobility Drills", sets: "20 min", reps: "-", rest: "-", notes: "Hip, shoulder, ankle mobility" },
          { name: "Weak Point Training", sets: "30 min", reps: "-", rest: "-", notes: "Focus on individual needs" },
          { name: "Light Cardio", sets: "20 min", reps: "-", rest: "-", notes: "Steady state, zone 2" }
        ],
        duration: "70 min",
        intensity: "Low-Moderate"
      }
    ],
    benefits: [
      "Maximum fat loss",
      "Significant muscle growth",
      "Improved athletic performance",
      "Enhanced metabolic rate"
    ],
    tips: [
      "Ensure proper nutrition for recovery",
      "Prioritize sleep (7-9 hours)",
      "Listen to body for overtraining signs",
      "Consider professional guidance"
    ]
  }
};

const ExercisePlan = () => {
  const token = localStorage.getItem("token");
  const [mlResult, setMlResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [activeTab, setActiveTab] = useState("schedule");

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  /* ========= FETCH USER DATA ========= */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await API.get(
          "\/api/users/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUserInfo(res.data);
        
        // Get ML data from either field
        if (res.data.ml && Object.keys(res.data.ml).length > 0) {
          setMlResult(res.data.ml);
        } else if (res.data.mlResult && Object.keys(res.data.mlResult).length > 0) {
          setMlResult(res.data.mlResult);
        }
        
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  /* ========= GET WORKOUT TYPE FROM ML ========= */
  const getWorkoutType = () => {
    if (!mlResult) return 1; // Default to Moderate
    
    // Check both possible field names
    const workoutType = mlResult.workout_type !== undefined ? mlResult.workout_type : 
                       mlResult.workoutType !== undefined ? mlResult.workoutType : 1;
    
    // Ensure it's 0, 1, or 2
    return workoutType === 0 ? 0 : workoutType === 2 ? 2 : 1;
  };

  /* ========= CALCULATE BMI ========= */
  const calculateBMI = () => {
    if (!userInfo?.height || !userInfo?.weight) return 22; // Default
    
    const heightInMeters = userInfo.height / 100;
    return (userInfo.weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your personalized exercise plan...</p>
      </div>
    );
  }

  const workoutType = getWorkoutType();
  const plan = EXERCISE_PLANS[workoutType];
  const bmi = calculateBMI();
  const userGoal = userInfo?.goal || "maintenance";

  // Filter schedule for selected day
  const daySchedule = plan.schedule.find(day => day.day === selectedDay) || plan.schedule[0];

  return (
    <div className="exercise-plan-container">
      {/* HEADER */}
      <div className="exercise-plan-header">
        <div>
          <h1 className="page-title">Personalized Exercise Plan</h1>
          <p className="page-subtitle">
            AI-generated workout program based on your fitness profile
          </p>
        </div>
        <div className="exercise-plan-meta">
          <div className="meta-item">
            <span className="meta-label">Intensity Level</span>
            <span className="meta-value">{plan.name}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Frequency</span>
            <span className="meta-value">{plan.frequency}</span>
          </div>
          <div className="meta-item">
            <span className="meta-label">Session Duration</span>
            <span className="meta-value">{plan.duration}</span>
          </div>
        </div>
      </div>

      {/* PLAN OVERVIEW */}
      <div className="card plan-overview-card">
        <h3 className="section-title">Program Overview</h3>
        <div className="overview-content">
          <p className="plan-description">{plan.description}</p>
          <div className="overview-stats">
            <div className="stat">
              <div className="stat-label">Primary Focus</div>
              <div className="stat-value">{plan.focus}</div>
            </div>
            <div className="stat">
              <div className="stat-label">Recommended For</div>
              <div className="stat-value">
                {workoutType === 0 ? "Beginners / Recovery" :
                 workoutType === 1 ? "Intermediate / Balanced" :
                 "Advanced / Performance"}
              </div>
            </div>
            <div className="stat">
              <div className="stat-label">Your Goal</div>
              <div className="stat-value">
                {userGoal === "weight_loss" ? "Weight Loss" :
                 userGoal === "muscle_gain" ? "Muscle Gain" :
                 "Maintenance"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="card tabs-card">
        <div className="tabs-navigation">
          <button
            className={`tab-btn ${activeTab === "schedule" ? "active" : ""}`}
            onClick={() => setActiveTab("schedule")}
          >
            Weekly Schedule
          </button>
          <button
            className={`tab-btn ${activeTab === "exercises" ? "active" : ""}`}
            onClick={() => setActiveTab("exercises")}
          >
            Daily Exercises
          </button>
          <button
            className={`tab-btn ${activeTab === "guidelines" ? "active" : ""}`}
            onClick={() => setActiveTab("guidelines")}
          >
            Guidelines
          </button>
        </div>
      </div>

      {/* CONTENT BASED ON ACTIVE TAB */}
      {activeTab === "schedule" && (
        <div className="card schedule-card">
          <div className="schedule-header">
            <h3 className="section-title">Weekly Workout Schedule</h3>
            <div className="day-selector">
              {plan.schedule.map((day) => (
                <button
                  key={day.day}
                  className={`day-btn ${selectedDay === day.day ? "active" : ""}`}
                  onClick={() => setSelectedDay(day.day)}
                >
                  {day.day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="schedule-grid">
            {plan.schedule.map((day) => (
              <div key={day.day} className={`schedule-day ${selectedDay === day.day ? "active" : ""}`}>
                <div className="day-header">
                  <div className="day-name">{day.day}</div>
                  <div className="day-type">{day.type}</div>
                </div>
                <div className="day-details">
                  <div className="detail">
                    <span className="detail-label">Focus:</span>
                    <span className="detail-value">{day.focus}</span>
                  </div>
                  <div className="detail">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{day.duration}</span>
                  </div>
                  <div className="detail">
                    <span className="detail-label">Intensity:</span>
                    <span className="detail-value">{day.intensity}</span>
                  </div>
                  <div className="exercises-preview">
                    {day.exercises.slice(0, 3).map((exercise, idx) => (
                      <span key={idx} className="exercise-tag">{exercise.name}</span>
                    ))}
                    {day.exercises.length > 3 && (
                      <span className="exercise-tag">+{day.exercises.length - 3} more</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "exercises" && (
        <div className="card exercises-card">
          <div className="exercises-header">
            <h3 className="section-title">{selectedDay} Workout</h3>
            <div className="workout-meta">
              <span className="meta-badge">{daySchedule.type}</span>
              <span className="meta-badge">{daySchedule.duration}</span>
              <span className="meta-badge">{daySchedule.intensity}</span>
            </div>
          </div>
          
          <div className="exercises-table">
            <div className="table-header-row">
              <div className="exercise-col">Exercise</div>
              <div className="sets-col">Sets</div>
              <div className="reps-col">Reps</div>
              <div className="rest-col">Rest</div>
              <div className="notes-col">Notes</div>
            </div>
            
            {daySchedule.exercises.map((exercise, index) => (
              <div key={index} className="exercise-row">
                <div className="exercise-col">
                  <div className="exercise-name">{exercise.name}</div>
                  <div className="exercise-focus">{daySchedule.focus}</div>
                </div>
                <div className="sets-col">{exercise.sets}</div>
                <div className="reps-col">{exercise.reps}</div>
                <div className="rest-col">{exercise.rest}</div>
                <div className="notes-col">{exercise.notes}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "guidelines" && (
        <div className="card guidelines-card">
          <div className="guidelines-grid">
            <div className="guidelines-section">
              <h3 className="section-title">Key Benefits</h3>
              <ul className="guidelines-list">
                {plan.benefits.map((benefit, index) => (
                  <li key={index}>
                    <span className="benefit-icon">🏆</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <div className="guidelines-section">
              <h3 className="section-title">Training Tips</h3>
              <ul className="guidelines-list">
                {plan.tips.map((tip, index) => (
                  <li key={index}>
                    <span className="tip-icon">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="safety-section">
            <h3 className="section-title">Safety Guidelines</h3>
            <div className="safety-content">
              <p>
                <strong>Warm-up:</strong> Always start with 5-10 minutes of light cardio and dynamic stretching.
              </p>
              <p>
                <strong>Form First:</strong> Maintain proper form before increasing weight or intensity.
              </p>
              <p>
                <strong>Hydration:</strong> Drink water before, during, and after workouts.
              </p>
              <p>
                <strong>Listen to Your Body:</strong> Stop if you feel sharp pain or dizziness.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PROGRESSION NOTES */}
      <div className="card progression-card">
        <h3 className="section-title">Progression Strategy</h3>
        <div className="progression-content">
          <p>
            <strong>Week 1-2:</strong> Focus on learning movements and establishing consistency.
          </p>
          <p>
            <strong>Week 3-4:</strong> Increase weights by 5-10% or add 1-2 sets to exercises.
          </p>
          <p>
            <strong>Month 2:</strong> Consider adding 5 minutes to cardio sessions or increasing intensity.
          </p>
          <p>
            <strong>Ongoing:</strong> Track your progress and adjust based on results and how you feel.
          </p>
        </div>
      </div>

    </div>
  );
};

export default ExercisePlan;