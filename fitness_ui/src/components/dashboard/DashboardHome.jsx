import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./DashboardHome.css";

const DashboardHome = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasAIData, setHasAIData] = useState(false);
  const [dailyLogs, setDailyLogs] = useState([]);
  const [todayLog, setTodayLog] = useState(null);
  const [stats, setStats] = useState({
    streak: 0,
    totalWorkouts: 0,
    totalCaloriesBurned: 0,
    avgSleep: 7,
    waterIntake: 0
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  /* ========= FETCH DASHBOARD DATA ========= */
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        
        // Fetch user profile
        const profileRes = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setUser(profileRes.data);

        // Fetch daily logs from the correct endpoint
        try {
          const logsRes = await axios.get(
            "http://localhost:5000/api/users/daily-logs", // UPDATED ENDPOINT
            {
              headers: { Authorization: `Bearer ${token}` },
              params: { _t: Date.now() } // Force fresh data
            }
          );
          
          // Handle the response structure from DailyLogPage API
          const logsData = logsRes.data.logs || [];
          const summary = logsRes.data.summary || {};
          
          // Sort logs by date descending (most recent first)
          const sortedLogs = [...logsData].sort((a, b) => 
            new Date(b.day) - new Date(a.day)
          );
          
          setDailyLogs(sortedLogs);
          
          // Calculate stats from logs
          calculateStats(sortedLogs, summary);
        } catch (logError) {
          console.log("No daily logs found or error:", logError.message);
          setDailyLogs([]);
          calculateStats([]);
        }

        // Try to fetch today's log separately
        try {
          const todayRes = await axios.get(
            "http://localhost:5000/api/users/daily-logs/today",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (todayRes.data.exists && todayRes.data.log) {
            setTodayLog(todayRes.data.log);
          } else {
            setTodayLog(null);
          }
        } catch (todayError) {
          console.log("No today's log found:", todayError.message);
          setTodayLog(null);
        }

        // Process ML data
        processMLData(profileRes.data);

      } catch (error) {
        console.error("Dashboard fetch error:", error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchDashboardData();
  }, [token, navigate, refreshTrigger]);

  /* ========= REFRESH FUNCTIONS ========= */
  const refreshDashboardData = useCallback(() => {
    setRefreshing(true);
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const refreshLogsOnly = useCallback(async () => {
    if (!token) return;
    
    try {
      setRefreshing(true);
      
      // Refresh both logs and today's log
      const [logsRes, todayRes] = await Promise.all([
        axios.get(
          "http://localhost:5000/api/users/daily-logs",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { _t: Date.now() }
          }
        ),
        axios.get(
          "http://localhost:5000/api/users/daily-logs/today",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
      ]);
      
      // Handle logs response
      const logsData = logsRes.data.logs || [];
      const summary = logsRes.data.summary || {};
      
      const sortedLogs = [...logsData].sort((a, b) => 
        new Date(b.day) - new Date(a.day)
      );
      
      setDailyLogs(sortedLogs);
      calculateStats(sortedLogs, summary);
      
      // Handle today's log response
      if (todayRes.data.exists && todayRes.data.log) {
        setTodayLog(todayRes.data.log);
      } else {
        setTodayLog(null);
      }
      
      // Show success feedback
      setTimeout(() => setRefreshing(false), 500);
    } catch (error) {
      console.log("Error refreshing logs:", error.message);
      setRefreshing(false);
    }
  }, [token]);

  /* ========= CALCULATE STATS FROM LOGS ========= */
  const calculateStats = useCallback((logs, summary = {}) => {
    if (!logs || logs.length === 0) {
      setStats({
        streak: 0,
        totalWorkouts: 0,
        totalCaloriesBurned: 0,
        avgSleep: 7,
        waterIntake: 0
      });
      return;
    }

    // Ensure logs are sorted by date descending
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(b.day) - new Date(a.day)
    );

    const totalWorkouts = sortedLogs.length;
    const totalCaloriesBurned = sortedLogs.reduce((sum, log) => sum + (log.burned || 0), 0);
    const streak = calculateStreak(sortedLogs);
    
    // Use average from summary if available, otherwise calculate
    const avgSleep = 7; // Default, since sleep data isn't in your DailyLog API
    
    const recentLog = sortedLogs[0];
    const recentWater = 0; // Water intake not in your DailyLog API

    console.log("Calculating stats from logs:", {
      totalWorkouts,
      totalCaloriesBurned,
      streak,
      logsCount: sortedLogs.length,
      recentLogDate: recentLog?.day
    });

    setStats({
      streak,
      totalWorkouts,
      totalCaloriesBurned,
      avgSleep: avgSleep.toFixed(1),
      waterIntake: recentWater
    });
  }, []);

  /* ========= CALCULATE LOGIN STREAK ========= */
  const calculateStreak = (logs) => {
    if (!logs || logs.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    // Check consecutive days from today backwards
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasLog = logs.some(log => {
        const logDate = new Date(log.day);
        logDate.setHours(0, 0, 0, 0);
        return logDate.toISOString().split('T')[0] === dateStr;
      });
      
      if (hasLog) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  /* ========= PROCESS ML DATA ========= */
  const processMLData = (userData) => {
    let mlData = null;
    
    // Check multiple possible ML data locations
    if (userData.mlResult && Object.keys(userData.mlResult).length > 0) {
      mlData = userData.mlResult;
    } else if (userData.ml && Object.keys(userData.ml).length > 0) {
      mlData = userData.ml;
    } else if (userData.ai_recommendations) {
      mlData = userData.ai_recommendations;
    }
    
    if (mlData) {
      // Clean and structure ML data
      const cleanML = {
        calories: mlData.calories ?? mlData.recommended_calories ?? 
                 mlData.calorie_prediction ?? mlData.daily_calories ?? 2000,
        diet_type: mlData.diet_type ?? mlData.dietType ?? 1,
        workout_type: mlData.workout_type ?? mlData.workoutType ?? 1,
        is_valid: true,
        source: "ai_model"
      };
      
      setMlResult(cleanML);
      setHasAIData(true);
    } else {
      // Generate calculated recommendations
      generateCalculatedRecommendations(userData);
    }
  };

  /* ========= GENERATE CALCULATED RECOMMENDATIONS ========= */
  const generateCalculatedRecommendations = (userData) => {
    if (!userData.height || !userData.weight) {
      setMlResult(null);
      setHasAIData(false);
      return;
    }

    // Calculate age
    const age = userData.dob ? 
      new Date().getFullYear() - new Date(userData.dob).getFullYear() : 30;
    
    // Calculate BMR (Mifflin-St Jeor Equation)
    const bmr = userData.gender === "female"
      ? 10 * userData.weight + 6.25 * userData.height - 5 * age - 161
      : 10 * userData.weight + 6.25 * userData.height - 5 * age + 5;
    
    // Activity multipliers
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9
    };
    
    const activity = userData.activityLevel || 'moderate';
    let calories = Math.round(bmr * (activityMultipliers[activity] || 1.55));
    
    // Adjust for goal
    if (userData.goal === 'weight_loss') calories -= 500;
    else if (userData.goal === 'muscle_gain') calories += 300;
    
    // Determine diet type
    let diet_type;
    if (userData.goal === 'weight_loss') diet_type = 0; // Low Carb
    else if (userData.goal === 'muscle_gain') diet_type = 2; // High Protein
    else diet_type = 1; // Balanced
    
    // Determine workout intensity
    let workout_type;
    if (activity === 'sedentary') workout_type = 0; // Light
    else if (activity === 'light') workout_type = 1; // Moderate
    else workout_type = 2; // Intense
    
    const calculatedML = {
      calories: calories,
      diet_type: diet_type,
      workout_type: workout_type,
      bmr: Math.round(bmr),
      tdee: Math.round(bmr * (activityMultipliers[activity] || 1.55)),
      is_calculated: true,
      source: "calculated"
    };
    
    setMlResult(calculatedML);
    setHasAIData(true);
  };

  /* ========= CALCULATIONS ========= */
  const bmi = useMemo(() => {
    if (!user?.height || !user?.weight) return 0;
    const heightInMeters = user.height / 100;
    return (user.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }, [user]);

  const bmiStatus = useMemo(() => {
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return { text: "Underweight", color: "#ffc107", class: "underweight" };
    if (bmiNum < 25) return { text: "Healthy", color: "#28a745", class: "healthy" };
    if (bmiNum < 30) return { text: "Overweight", color: "#fd7e14", class: "overweight" };
    return { text: "Obese", color: "#dc3545", class: "obese" };
  }, [bmi]);

  const bmiPercentage = useMemo(() => {
    const bmiNum = parseFloat(bmi);
    if (bmiNum <= 18.5) return (bmiNum / 18.5) * 25;
    if (bmiNum <= 25) return 25 + ((bmiNum - 18.5) / 6.5) * 25;
    if (bmiNum <= 30) return 50 + ((bmiNum - 25) / 5) * 25;
    return Math.min(100, 75 + ((bmiNum - 30) / 10) * 25);
  }, [bmi]);

  /* ========= ML LABEL MAPS ========= */
  const dietMap = ["Low Carb", "Balanced", "High Protein"];
  const workoutMap = ["Light", "Moderate", "Intense"];
  const goalMap = {
    weight_loss: "Weight Loss",
    muscle_gain: "Muscle Gain", 
    maintenance: "Maintenance"
  };

  /* ========= TRIGGER AI GENERATION ========= */
  const generateAIPlan = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await axios.post(
        "http://localhost:5000/api/ml/predict",
        {
          height: user.height,
          weight: user.weight,
          age: user.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : 30,
          gender: user.gender || 'male',
          activity_level: user.activityLevel || 'moderate',
          goal: user.goal || 'weight_loss'
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      if (response.data) {
        const newMLResult = {
          calories: response.data.calories || response.data.recommended_calories,
          diet_type: response.data.diet_type,
          workout_type: response.data.workout_type,
          is_valid: true,
          source: "ai_model"
        };
        
        setMlResult(newMLResult);
        setHasAIData(true);
        
        // Update user profile with new ML data
        try {
          await axios.patch(
            "http://localhost:5000/api/users/update-ml",
            { mlResult: newMLResult },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (updateError) {
          console.log("Could not update ML data:", updateError.message);
        }
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("Could not generate AI plan. Using calculated recommendations.");
      generateCalculatedRecommendations(user);
    } finally {
      setLoading(false);
    }
  };

  /* ========= GET TODAY'S DATE ========= */
  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /* ========= CALCULATE PROGRESS PERCENTAGE ========= */
  const calculateProgressPercentage = (current, target) => {
    if (!current || !target || target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  /* ========= CALCULATE TODAY'S PROGRESS ========= */
  const getTodayProgress = () => {
    if (!todayLog) return {};
    
    return {
      caloriesIntake: todayLog.intake || 0,
      caloriesBurned: todayLog.burned || 0,
      workoutMinutes: todayLog.workout || 0,
      steps: todayLog.steps || 0,
      netCalories: todayLog.netCalories || 0
    };
  };

  /* ========= LOADING STATE ========= */
  if (loading && !refreshing) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your personalized dashboard...</p>
      </div>
    );
  }

  const todayProgress = getTodayProgress();

  return (
    <div className="dashboard-home">
      {/* Header with Date and Greeting */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="greeting-section">
            <h1>Welcome back, <span className="user-name">{user?.name || "User"}</span>! 👋</h1>
            <p className="greeting-subtitle">{getTodayDate()}</p>
            {todayLog && (
              <p className="today-log-status">
                ✅ Today's log completed • {todayLog.intake} kcal intake • {todayLog.burned} kcal burned
              </p>
            )}
          </div>
          
          <div className="header-actions">
            <button 
              onClick={refreshDashboardData}
              className="refresh-header-btn"
              disabled={refreshing}
              title="Refresh all data"
            >
              {refreshing ? (
                <span className="refreshing-spinner"></span>
              ) : (
                <>
                  <span className="refresh-icon">↻</span>
                  Refresh
                </>
              )}
            </button>
            {mlResult?.source === "calculated" && (
              <span className="plan-badge calculated">
                <span className="badge-icon">📊</span>
                Calculated Plan
              </span>
            )}
            {mlResult?.source === "ai_model" && (
              <span className="plan-badge ai">
                <span className="badge-icon">🤖</span>
                AI Generated
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        
        {/* Profile Summary Card */}
        <div className="dashboard-card profile-summary">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">👤</span>
              Profile Summary
            </h2>
            <Link to="profile" className="edit-link">
              Edit Profile
            </Link>
          </div>
          
          <div className="profile-stats">
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">Age</span>
                <span className="stat-value">
                  {user?.dob
                    ? new Date().getFullYear() - new Date(user.dob).getFullYear()
                    : "—"} <span className="stat-unit">yrs</span>
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Height</span>
                <span className="stat-value">
                  {user?.height || "—"} <span className="stat-unit">cm</span>
                </span>
              </div>
            </div>
            
            <div className="stat-row">
              <div className="stat-item">
                <span className="stat-label">Weight</span>
                <span className="stat-value">
                  {user?.weight || "—"} <span className="stat-unit">kg</span>
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Goal</span>
                <span className={`stat-value goal-${user?.goal || 'none'}`}>
                  {goalMap[user?.goal] || 'Not Set'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bmi-section">
            <div className="bmi-display">
              <h3 className="bmi-title">Body Mass Index</h3>
              <div className="bmi-value">{bmi || "—"}</div>
              <span className={`bmi-status ${bmiStatus.class}`}>
                {bmiStatus.text}
              </span>
            </div>
            <div className="bmi-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${bmiPercentage}%`,
                    backgroundColor: bmiStatus.color
                  }}
                ></div>
              </div>
              <div className="progress-labels">
                <span>Underweight</span>
                <span>Healthy</span>
                <span>Overweight</span>
                <span>Obese</span>
              </div>
            </div>
          </div>
        </div>

        {/* Fitness Plan Card */}
        <div className="dashboard-card fitness-plan">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">🎯</span>
              Your Fitness Plan
            </h2>
            {!hasAIData && user?.height && user?.weight && (
              <button 
                onClick={generateAIPlan}
                className="generate-ai-btn"
                disabled={loading}
              >
                {loading ? (
                  <span className="ai-loading-spinner"></span>
                ) : (
                  <>
                    <span className="btn-icon">🤖</span>
                    Generate AI Plan
                  </>
                )}
              </button>
            )}
          </div>

          {hasAIData ? (
            <div className="plan-details">
              <div className="plan-main">
                <div className="calorie-display">
                  <span className="calorie-label">Daily Calorie Target</span>
                  <div className="calorie-value">
                    {mlResult?.calories || "—"}
                    <span className="calorie-unit">kcal</span>
                  </div>
                  {mlResult?.bmr && (
                    <div className="metabolic-info">
                      <span className="metabolic-label">BMR: {mlResult.bmr} kcal</span>
                      <span className="metabolic-label">TDEE: {mlResult.tdee} kcal</span>
                    </div>
                  )}
                </div>
                
                <div className="plan-grid">
                  <div className="plan-item">
                    <span className="plan-item-label">Diet Type</span>
                    <span className="plan-item-value">
                      {dietMap[mlResult?.diet_type] || "Balanced"}
                    </span>
                    <span className="plan-item-icon">🥗</span>
                  </div>
                  
                  <div className="plan-item">
                    <span className="plan-item-label">Workout Intensity</span>
                    <span className="plan-item-value">
                      {workoutMap[mlResult?.workout_type] || "Moderate"}
                    </span>
                    <span className="plan-item-icon">💪</span>
                  </div>
                  
                  <div className="plan-item">
                    <span className="plan-item-label">Recommended Protein</span>
                    <span className="plan-item-value">
                      {mlResult?.calories ? Math.round((mlResult.calories * 0.3) / 4) : "—"}g
                    </span>
                    <span className="plan-item-icon">🍗</span>
                  </div>
                  
                  <div className="plan-item">
                    <span className="plan-item-label">Activity Level</span>
                    <span className="plan-item-value">
                      {user?.activityLevel ? user.activityLevel.charAt(0).toUpperCase() + user.activityLevel.slice(1) : "Moderate"}
                    </span>
                    <span className="plan-item-icon">🏃</span>
                  </div>
                </div>
              </div>
              
              {mlResult?.source === "calculated" && (
                <div className="calculated-note">
                  <div className="note-icon">💡</div>
                  <div className="note-content">
                    <strong>Want AI Precision?</strong>
                    <p>This plan is calculated using standard formulas. For personalized AI recommendations, ensure your ML backend is running.</p>
                  </div>
                </div>
              )}
              
              <div className="plan-actions">
                <Link to="diet" className="plan-action-btn primary">
                  View Diet Plan
                </Link>
                <Link to="exercise" className="plan-action-btn secondary">
                  View Workout Plan
                </Link>
              </div>
            </div>
          ) : (
            <div className="no-plan">
              <div className="no-plan-icon">📊</div>
              <h3>No Fitness Plan Yet</h3>
              <p>
                {user?.height && user?.weight 
                  ? "Generate an AI-powered fitness plan tailored just for you!"
                  : "Complete your profile to enable AI recommendations."}
              </p>
              {(!user?.height || !user?.weight) && (
                <Link to="profile" className="complete-profile-btn">
                  Complete Your Profile
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Today's Progress Card */}
        <div className="dashboard-card today-progress">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">📅</span>
              Today's Progress
              {todayLog && <span className="status-badge completed">✓ Logged</span>}
            </h2>
            <div className="card-header-actions">
              <button 
                onClick={refreshLogsOnly}
                className="refresh-small-btn"
                disabled={refreshing}
                title="Refresh today's data"
              >
                {refreshing ? "↻" : "↻"}
              </button>
              <Link to="daily-log" className="view-all-link">
                {todayLog ? "Edit Log" : "Log Today"}
              </Link>
            </div>
          </div>
          
          {todayLog ? (
            <div className="today-stats">
              <div className="today-stat">
                <div className="today-stat-icon">🍎</div>
                <div className="today-stat-content">
                  <span className="today-stat-label">Calories Intake</span>
                  <span className="today-stat-value">{todayLog.intake} kcal</span>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${calculateProgressPercentage(todayLog.intake, mlResult?.calories || 2000)}%` }}
                    ></div>
                  </div>
                  <span className="today-stat-target">Target: {mlResult?.calories || 2000} kcal</span>
                </div>
              </div>
              
              <div className="today-stat">
                <div className="today-stat-icon">🔥</div>
                <div className="today-stat-content">
                  <span className="today-stat-label">Calories Burned</span>
                  <span className="today-stat-value">{todayLog.burned} kcal</span>
                  <div className="today-stat-subtext">Active energy</div>
                </div>
              </div>
              
              <div className="today-stat">
                <div className="today-stat-icon">⚖️</div>
                <div className="today-stat-content">
                  <span className="today-stat-label">Net Calories</span>
                  <span className={`today-stat-value ${todayLog.netCalories > 0 ? 'positive' : 'negative'}`}>
                    {todayLog.netCalories > 0 ? '+' : ''}{todayLog.netCalories} kcal
                  </span>
                  <div className="today-stat-subtext">
                    {todayLog.netCalories > 0 ? "Surplus" : "Deficit"}
                  </div>
                </div>
              </div>
              
              <div className="today-stat">
                <div className="today-stat-icon">🏃</div>
                <div className="today-stat-content">
                  <span className="today-stat-label">Workout</span>
                  <span className="today-stat-value">{todayLog.workout || 0} min</span>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${calculateProgressPercentage(todayLog.workout || 0, 30)}%` }}
                    ></div>
                  </div>
                  <span className="today-stat-target">Target: 30 min</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-today-log">
              <div className="no-log-icon">📝</div>
              <h3>No Log for Today</h3>
              <p>Log your daily activities to track your progress!</p>
              <Link to="daily-log" className="log-today-btn">
                Log Today's Activity
              </Link>
            </div>
          )}
        </div>

        {/* Progress Tracking Card */}
        <div className="dashboard-card activity-progress">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">📊</span>
              Progress Tracking
              <span className="data-status">({dailyLogs.length} logs)</span>
            </h2>
            <div className="card-header-actions">
              <button 
                onClick={refreshLogsOnly}
                className="refresh-small-btn"
                disabled={refreshing}
                title="Refresh progress"
              >
                {refreshing ? "↻" : "↻"}
              </button>
              <Link to="visualization" className="view-reports-link">
                View Analytics
              </Link>
            </div>
          </div>
          
          <div className="progress-stats">
            <div className="progress-stat">
              <div className="progress-stat-icon">🔥</div>
              <div className="progress-stat-content">
                <div className="progress-stat-header">
                  <span className="progress-stat-label">Log Streak</span>
                  <span className="progress-stat-value">{stats.streak} days</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${Math.min(100, (stats.streak / 7) * 100)}%` }}
                  ></div>
                </div>
                <span className="progress-stat-target">Target: 7 days</span>
              </div>
            </div>
            
            <div className="progress-stat">
              <div className="progress-stat-icon">📝</div>
              <div className="progress-stat-content">
                <div className="progress-stat-header">
                  <span className="progress-stat-label">Total Logs</span>
                  <span className="progress-stat-value">{stats.totalWorkouts}</span>
                </div>
                <div className="progress-stat-subtext">
                  {stats.totalWorkouts > 0 ? "Keep tracking!" : "Start logging!"}
                </div>
              </div>
            </div>
            
            <div className="progress-stat">
              <div className="progress-stat-icon">⚡</div>
              <div className="progress-stat-content">
                <div className="progress-stat-header">
                  <span className="progress-stat-label">Calories Burned</span>
                  <span className="progress-stat-value">
                    {stats.totalCaloriesBurned >= 1000 
                      ? `${Math.round(stats.totalCaloriesBurned / 1000)}K` 
                      : stats.totalCaloriesBurned}
                  </span>
                </div>
                <div className="progress-stat-subtext">
                  Total energy spent
                </div>
              </div>
            </div>
            
            <div className="progress-stat">
              <div className="progress-stat-icon">🏋️</div>
              <div className="progress-stat-content">
                <div className="progress-stat-header">
                  <span className="progress-stat-label">Workout Minutes</span>
                  <span className="progress-stat-value">
                    {dailyLogs.reduce((sum, log) => sum + (log.workout || 0), 0)}
                  </span>
                </div>
                <div className="progress-stat-subtext">
                  Total active time
                </div>
              </div>
            </div>
          </div>
          
          <div className="progress-actions">
            <Link to="daily-log" className="log-now-btn">
              {todayLog ? "Update Log" : "Log Today"}
            </Link>
            <button 
              onClick={refreshLogsOnly}
              className="refresh-logs-btn"
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>
        </div>

        {/* Recent Activity Logs */}
        <div className="dashboard-card recent-logs">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">📝</span>
              Recent Activity Logs
              <span className="logs-count">({dailyLogs.length})</span>
            </h2>
            <div className="card-header-actions">
              <button 
                onClick={refreshLogsOnly}
                className="refresh-small-btn"
                disabled={refreshing}
                title="Refresh logs"
              >
                {refreshing ? "↻" : "↻"}
              </button>
              <Link to="daily-log" className="view-all-link">
                View All
              </Link>
            </div>
          </div>
          
          {dailyLogs.length > 0 ? (
            <div className="logs-list">
              {dailyLogs.slice(0, 5).map((logItem) => (
                <div key={logItem._id} className="log-item">
                  <div className="log-date">
                    {new Date(logItem.day).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="log-details">
                    <div className="log-metrics">
                      <span className="log-metric">
                        <span className="metric-icon">🍎</span>
                        {logItem.intake} kcal
                      </span>
                      <span className="log-metric">
                        <span className="metric-icon">🔥</span>
                        {logItem.burned} kcal
                      </span>
                      <span className="log-metric">
                        <span className="metric-icon">🏃</span>
                        {logItem.workout || 0} min
                      </span>
                      <span className="log-metric">
                        <span className="metric-icon">👣</span>
                        {logItem.steps || 0} steps
                      </span>
                    </div>
                    {logItem.notes && (
                      <div className="log-notes">
                        📝 {logItem.notes.substring(0, 30)}...
                      </div>
                    )}
                  </div>
                  <div className="log-net">
                    <span className={`net-value ${logItem.netCalories > 0 ? 'positive' : 'negative'}`}>
                      {logItem.netCalories > 0 ? '+' : ''}{logItem.netCalories}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-logs">
              <div className="no-logs-icon">📋</div>
              <h3>No Activity Logs Yet</h3>
              <p>Start tracking your daily fitness activities to see your progress!</p>
              <Link to="daily-log" className="start-logging-btn">
                Start Logging
              </Link>
            </div>
          )}
          
          {dailyLogs.length > 5 && (
            <div className="logs-footer">
              <Link to="daily-log" className="view-more-logs">
                View {dailyLogs.length - 5} more logs →
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">⚡</span>
              Quick Actions
            </h2>
          </div>
          
          <div className="actions-grid">
            <Link to="daily-log" className="action-card log-activity">
              <div className="action-card-icon">📝</div>
              <div className="action-card-content">
                <h3>Log Activity</h3>
                <p>Track your workouts & meals</p>
              </div>
            </Link>
            
            <Link to="diet" className="action-card diet-plan">
              <div className="action-card-icon">🥗</div>
              <div className="action-card-content">
                <h3>Diet Plan</h3>
                <p>View personalized meal plans</p>
              </div>
            </Link>
            
            <Link to="exercise" className="action-card workout-plan">
              <div className="action-card-icon">💪</div>
              <div className="action-card-content">
                <h3>Workout Plan</h3>
                <p>View exercise routines</p>
              </div>
            </Link>
            
            <Link to="visualization" className="action-card view-progress">
              <div className="action-card-icon">📊</div>
              <div className="action-card-content">
                <h3>View Progress</h3>
                <p>Charts & analytics</p>
              </div>
            </Link>
            
            <Link to="nutritionist" className="action-card nutrition">
              <div className="action-card-icon">👩‍⚕️</div>
              <div className="action-card-content">
                <h3>Nutritionist</h3>
                <p>Connect with experts</p>
              </div>
            </Link>
            
            <Link to="refer" className="action-card refer">
              <div className="action-card-icon">🎁</div>
              <div className="action-card-content">
                <h3>Refer & Earn</h3>
                <p>Share with friends</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Upcoming Goals */}
        {mlResult && (
          <div className="dashboard-card upcoming-goals">
            <div className="card-header">
              <h2 className="card-title">
                <span className="card-icon">🏆</span>
                Weekly Goals
              </h2>
              <button 
                onClick={refreshLogsOnly}
                className="refresh-small-btn"
                disabled={refreshing}
                title="Refresh goals"
              >
                {refreshing ? "↻" : "↻"}
              </button>
            </div>
            
            <div className="goals-list">
              <div className="goal-item">
                <div className="goal-checkbox">
                  <div className={`checkbox ${stats.streak >= 7 ? 'checked' : ''}`}>
                    {stats.streak >= 7 ? '✓' : ''}
                  </div>
                </div>
                <div className="goal-content">
                  <h3>Complete 7-day log streak</h3>
                  <p>Current: {stats.streak} days • Target: 7 days</p>
                  <div className="goal-progress">
                    <div 
                      className="goal-progress-bar" 
                      style={{ width: `${Math.min(100, (stats.streak / 7) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="goal-item">
                <div className="goal-checkbox">
                  <div className={`checkbox ${todayProgress.caloriesIntake >= (mlResult.calories * 0.9) ? 'checked' : ''}`}>
                    {todayProgress.caloriesIntake >= (mlResult.calories * 0.9) ? '✓' : ''}
                  </div>
                </div>
                <div className="goal-content">
                  <h3>Reach calorie target (90%)</h3>
                  <p>Target: {mlResult.calories} kcal daily</p>
                  <div className="goal-progress">
                    <div 
                      className="goal-progress-bar" 
                      style={{ width: `${calculateProgressPercentage(todayProgress.caloriesIntake, mlResult.calories)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="goal-item">
                <div className="goal-checkbox">
                  <div className={`checkbox ${todayProgress.workoutMinutes >= 30 ? 'checked' : ''}`}>
                    {todayProgress.workoutMinutes >= 30 ? '✓' : ''}
                  </div>
                </div>
                <div className="goal-content">
                  <h3>30 min daily workout</h3>
                  <p>Current: {todayProgress.workoutMinutes} min • Target: 30 min</p>
                  <div className="goal-progress">
                    <div 
                      className="goal-progress-bar" 
                      style={{ width: `${calculateProgressPercentage(todayProgress.workoutMinutes, 30)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="goals-progress-summary">
              <span>Overall Progress</span>
              <span className="overall-progress">
                {Math.round(
                  (stats.streak/7 * 100 + 
                   calculateProgressPercentage(todayProgress.caloriesIntake, mlResult.calories) + 
                   calculateProgressPercentage(todayProgress.workoutMinutes, 30)
                  ) / 3
                )}%
              </span>
            </div>
          </div>
        )}

        {/* Rating & Feedback Section */}
        <div className="dashboard-card rating-section">
          <div className="card-header">
            <h2 className="card-title">
              <span className="card-icon">⭐</span>
              Rate Your Experience
            </h2>
          </div>
          <div className="rating-content">
            <p>Help us improve by sharing your feedback!</p>
            <Link to="rating" className="rating-btn">
              Leave Feedback →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;