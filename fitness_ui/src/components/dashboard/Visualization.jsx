import { useEffect, useState } from "react";
import API from "../../utils/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from "recharts";
import "./Visualization.css";

const Visualization = () => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [mlResult, setMlResult] = useState(null);
  const [timeRange, setTimeRange] = useState("7days");
  const [activeChart, setActiveChart] = useState("calories");
  const [stats, setStats] = useState({
    totalIntake: 0,
    totalBurned: 0,
    avgIntake: 0,
    avgBurned: 0,
    totalSteps: 0,
    totalWorkout: 0,
    avgSteps: 0,
    avgWorkout: 0
  });

  /* ========= FETCH USER DATA ========= */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile with ML data
        const userRes = await API.get(
          "/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        setUserInfo(userRes.data);
        
        // Get ML data from either field
        if (userRes.data.ml && Object.keys(userRes.data.ml).length > 0) {
          setMlResult(userRes.data.ml);
        } else if (userRes.data.mlResult && Object.keys(userRes.data.mlResult).length > 0) {
          setMlResult(userRes.data.mlResult);
        }

        // Fetch daily logs
        const logsRes = await API.get(
          "/api/users/daily-logs",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        setLogs(logsRes.data.logs || []);
        
        // Calculate statistics
        calculateStats(logsRes.data.logs || []);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  /* ========= CALCULATE STATISTICS ========= */
  const calculateStats = (logData) => {
    if (logData.length === 0) return;

    const totalIntake = logData.reduce((sum, log) => sum + (log.intake || 0), 0);
    const totalBurned = logData.reduce((sum, log) => sum + (log.burned || 0), 0);
    const totalSteps = logData.reduce((sum, log) => sum + (log.steps || 0), 0);
    const totalWorkout = logData.reduce((sum, log) => sum + (log.workout || 0), 0);

    setStats({
      totalIntake,
      totalBurned,
      avgIntake: Math.round(totalIntake / logData.length),
      avgBurned: Math.round(totalBurned / logData.length),
      totalSteps,
      totalWorkout,
      avgSteps: Math.round(totalSteps / logData.length),
      avgWorkout: Math.round(totalWorkout / logData.length)
    });
  };

  /* ========= FILTER DATA BY TIME RANGE ========= */
  const getFilteredData = () => {
    if (!logs.length) return [];
    
    const now = new Date();
    let filtered = [...logs];
    
    switch (timeRange) {
      case "7days":
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = logs.filter(log => new Date(log.day) >= weekAgo);
        break;
      case "30days":
        const monthAgo = new Date(now.setDate(now.getDate() - 30));
        filtered = logs.filter(log => new Date(log.day) >= monthAgo);
        break;
      case "90days":
        const quarterAgo = new Date(now.setDate(now.getDate() - 90));
        filtered = logs.filter(log => new Date(log.day) >= quarterAgo);
        break;
      default:
        break;
    }
    
    return filtered
      .sort((a, b) => new Date(a.day) - new Date(b.day))
      .map(log => ({
        ...log,
        date: new Date(log.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        netCalories: log.intake - log.burned,
        goalAchieved: log.netCalories < 0 ? "Under Goal" : "Over Goal"
      }));
  };

  /* ========= PREPARE CHART DATA ========= */
  const filteredData = getFilteredData();
  
  // Calories comparison data
  const caloriesComparison = filteredData.map(log => ({
    date: log.date,
    intake: log.intake,
    burned: log.burned,
    net: log.netCalories
  }));

  // Steps data
  const stepsData = filteredData.map(log => ({
    date: log.date,
    steps: log.steps,
    target: 10000 // Daily step target
  }));

  // Workout data
  const workoutData = filteredData.map(log => ({
    date: log.date,
    minutes: log.workout,
    intensity: log.workout > 60 ? "High" : log.workout > 30 ? "Medium" : "Low"
  }));

  // Pie chart data for macro distribution
  const macroData = mlResult ? [
    { name: 'Protein', value: mlResult.diet_type === 2 ? 40 : mlResult.diet_type === 0 ? 35 : 30 },
    { name: 'Carbs', value: mlResult.diet_type === 0 ? 20 : mlResult.diet_type === 2 ? 35 : 45 },
    { name: 'Fats', value: mlResult.diet_type === 0 ? 45 : mlResult.diet_type === 2 ? 25 : 25 }
  ] : [
    { name: 'Protein', value: 30 },
    { name: 'Carbs', value: 45 },
    { name: 'Fats', value: 25 }
  ];

  // Colors for charts
  const COLORS = ['#667eea', '#f5576c', '#4facfe', '#1dd1a1'];
  const PIE_COLORS = ['#667eea', '#f5576c', '#4facfe'];

  /* ========= GET RECOMMENDATION STATUS ========= */
  const getRecommendationStatus = () => {
    if (!mlResult || logs.length < 3) return null;
    
    const recentAvgIntake = filteredData.slice(-7).reduce((sum, log) => sum + log.intake, 0) / Math.min(7, filteredData.length);
    const mlTarget = mlResult.calories || stats.avgIntake;
    
    const diff = recentAvgIntake - mlTarget;
    const percentageDiff = (diff / mlTarget) * 100;
    
    if (percentageDiff > 10) return { status: "above", message: "You're consuming more than recommended" };
    if (percentageDiff < -10) return { status: "below", message: "You're consuming less than recommended" };
    return { status: "onTrack", message: "You're on track with recommendations" };
  };

  const recommendation = getRecommendationStatus();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your fitness dashboard...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="empty-dashboard">
        <div className="empty-icon">📊</div>
        <h2>No Activity Data Yet</h2>
        <p>Start logging your daily activities to see progress visualizations</p>
        <p className="empty-tip">Go to Daily Log page to add your first entry</p>
      </div>
    );
  }

  return (
    <div className="visualization-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Fitness Dashboard</h1>
          <p className="page-subtitle">
            AI-powered insights and progress tracking
          </p>
        </div>
        
        <div className="time-range-selector">
          <button 
            className={`time-btn ${timeRange === "7days" ? "active" : ""}`}
            onClick={() => setTimeRange("7days")}
          >
            7 Days
          </button>
          <button 
            className={`time-btn ${timeRange === "30days" ? "active" : ""}`}
            onClick={() => setTimeRange("30days")}
          >
            30 Days
          </button>
          <button 
            className={`time-btn ${timeRange === "90days" ? "active" : ""}`}
            onClick={() => setTimeRange("90days")}
          >
            90 Days
          </button>
          <button 
            className={`time-btn ${timeRange === "all" ? "active" : ""}`}
            onClick={() => setTimeRange("all")}
          >
            All Time
          </button>
        </div>
      </div>

      {/* AI RECOMMENDATIONS CARD */}
      {mlResult && (
        <div className="card ai-recommendations-card">
          <div className="ai-card-header">
            <h3 className="section-title">AI Recommendations</h3>
            <span className="ai-badge">🤖 Powered by ML</span>
          </div>
          
          <div className="ai-recommendations-grid">
            <div className="ai-recommendation">
              <div className="ai-label">Calorie Target</div>
              <div className="ai-value">{mlResult.calories || stats.avgIntake} kcal/day</div>
              {recommendation && (
                <div className={`ai-status ${recommendation.status}`}>
                  {recommendation.message}
                </div>
              )}
            </div>
            
            <div className="ai-recommendation">
              <div className="ai-label">Diet Type</div>
              <div className="ai-value">
                {mlResult.diet_type === 0 ? "Low Carb" : 
                 mlResult.diet_type === 1 ? "Balanced" : 
                 mlResult.diet_type === 2 ? "High Protein" : "Custom"}
              </div>
              <div className="ai-macro-chart">
                <div className="macro-bar protein" style={{ width: `${macroData[0].value}%` }}></div>
                <div className="macro-bar carbs" style={{ width: `${macroData[1].value}%` }}></div>
                <div className="macro-bar fats" style={{ width: `${macroData[2].value}%` }}></div>
              </div>
            </div>
            
            <div className="ai-recommendation">
              <div className="ai-label">Workout Intensity</div>
              <div className="ai-value">
                {mlResult.workout_type === 0 ? "Light" : 
                 mlResult.workout_type === 1 ? "Moderate" : 
                 mlResult.workout_type === 2 ? "Intense" : "Custom"}
              </div>
              <div className="workout-suggestion">
                Suggested: {mlResult.workout_type === 0 ? "3-4 days/week" : 
                          mlResult.workout_type === 1 ? "4-5 days/week" : 
                          "5-6 days/week"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS SUMMARY */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-label">Total Calories Burned</div>
            <div className="stat-value">{stats.totalBurned.toLocaleString()} kcal</div>
            <div className="stat-change">Avg: {stats.avgBurned} kcal/day</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">🍎</div>
          <div className="stat-content">
            <div className="stat-label">Total Calories Intake</div>
            <div className="stat-value">{stats.totalIntake.toLocaleString()} kcal</div>
            <div className="stat-change">Avg: {stats.avgIntake} kcal/day</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-content">
            <div className="stat-label">Net Calories</div>
            <div className={`stat-value ${stats.avgIntake - stats.avgBurned > 0 ? "positive" : "negative"}`}>
              {(stats.avgIntake - stats.avgBurned).toLocaleString()} kcal/day
            </div>
            <div className="stat-change">
              {stats.avgIntake - stats.avgBurned > 0 ? "Surplus" : "Deficit"}
            </div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">👣</div>
          <div className="stat-content">
            <div className="stat-label">Total Steps</div>
            <div className="stat-value">{stats.totalSteps.toLocaleString()}</div>
            <div className="stat-change">Avg: {stats.avgSteps} steps/day</div>
          </div>
        </div>
      </div>

      {/* CHART NAVIGATION */}
      <div className="chart-navigation">
        <button 
          className={`chart-btn ${activeChart === "calories" ? "active" : ""}`}
          onClick={() => setActiveChart("calories")}
        >
          Calories Trend
        </button>
        <button 
          className={`chart-btn ${activeChart === "steps" ? "active" : ""}`}
          onClick={() => setActiveChart("steps")}
        >
          Steps Progress
        </button>
        <button 
          className={`chart-btn ${activeChart === "workout" ? "active" : ""}`}
          onClick={() => setActiveChart("workout")}
        >
          Workout Minutes
        </button>
        <button 
          className={`chart-btn ${activeChart === "macros" ? "active" : ""}`}
          onClick={() => setActiveChart("macros")}
        >
          Macronutrients
        </button>
      </div>

      {/* DYNAMIC CHART DISPLAY */}
      <div className="chart-container">
        {activeChart === "calories" && (
          <div className="card chart-card">
            <h3 className="chart-title">Calories Intake vs Burned</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={caloriesComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Calories (kcal)', angle: -90, position: 'insideLeft' }} />
                <Tooltip 
                  formatter={(value) => [`${value} kcal`, ""]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Area type="monotone" dataKey="intake" stackId="1" stroke="#667eea" fill="#667eea" fillOpacity={0.6} name="Calories Intake" />
                <Area type="monotone" dataKey="burned" stackId="2" stroke="#f5576c" fill="#f5576c" fillOpacity={0.6} name="Calories Burned" />
                <Line type="monotone" dataKey="net" stroke="#1dd1a1" strokeWidth={2} dot={false} name="Net Calories" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === "steps" && (
          <div className="card chart-card">
            <h3 className="chart-title">Daily Steps vs Target</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stepsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Steps', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="steps" fill="#4facfe" name="Steps Taken" />
                <Line type="monotone" dataKey="target" stroke="#ff6b6b" strokeWidth={2} dot={false} name="Daily Target (10,000)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === "workout" && (
          <div className="card chart-card">
            <h3 className="chart-title">Workout Intensity & Duration</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workoutData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis label={{ value: 'Minutes', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="minutes" fill="#feca57" name="Workout Minutes">
                  {workoutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.intensity === "High" ? "#ff6b6b" : entry.intensity === "Medium" ? "#feca57" : "#1dd1a1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === "macros" && mlResult && (
          <div className="card chart-card">
            <h3 className="chart-title">Recommended Macronutrient Distribution</h3>
            <div className="macro-chart-container">
              <div className="pie-chart">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={macroData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {macroData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="macro-details">
                <h4>Macronutrient Breakdown</h4>
                {macroData.map((macro, index) => (
                  <div key={macro.name} className="macro-detail">
                    <div className="macro-color" style={{ background: PIE_COLORS[index] }}></div>
                    <div className="macro-name">{macro.name}</div>
                    <div className="macro-percentage">{macro.value}%</div>
                    <div className="macro-grams">
                      {Math.round(((mlResult.calories || 2000) * macro.value / 100) / (macro.name === 'Protein' ? 4 : macro.name === 'Carbs' ? 4 : 9))}g
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PROGRESS INSIGHTS */}
      <div className="card insights-card">
        <h3 className="section-title">Progress Insights</h3>
        <div className="insights-grid">
          <div className="insight">
            <div className="insight-icon">📈</div>
            <div className="insight-content">
              <h4>Consistency Score</h4>
              <p>{filteredData.length > 0 ? Math.min(100, Math.round((filteredData.length / (timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90)) * 100)) : 0}%</p>
              <small>Based on log frequency</small>
            </div>
          </div>
          
          <div className="insight">
            <div className="insight-icon">🎯</div>
            <div className="insight-content">
              <h4>Goal Alignment</h4>
              <p>{userInfo?.goal === "weight_loss" ? 
                (stats.avgIntake - stats.avgBurned < 0 ? "On Track" : "Needs Adjustment") :
                userInfo?.goal === "muscle_gain" ?
                (stats.avgIntake - stats.avgBurned > 300 ? "On Track" : "Needs More Calories") :
                "Maintaining"}
              </p>
              <small>Based on your fitness goal</small>
            </div>
          </div>
          
          <div className="insight">
            <div className="insight-icon">⚡</div>
            <div className="insight-content">
              <h4>Activity Level</h4>
              <p>{stats.avgWorkout > 60 ? "Very Active" : stats.avgWorkout > 30 ? "Active" : "Moderate"}</p>
              <small>{stats.avgWorkout} min/day average</small>
            </div>
          </div>
          
          <div className="insight">
            <div className="insight-icon">💪</div>
            <div className="insight-content">
              <h4>Improvement Trend</h4>
              <p>{filteredData.length >= 7 ? 
                (filteredData.slice(-7).reduce((sum, log) => sum + log.steps, 0) / 7 > stats.avgSteps ? "Positive" : "Needs Work") :
                "Not Enough Data"}
              </p>
              <small>Based on recent performance</small>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Styles */}
      <style jsx>{`
        .visualization-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          flex-wrap: wrap;
          gap: 20px;
        }

        .time-range-selector {
          display: flex;
          gap: 10px;
          background: white;
          padding: 10px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }

        .time-btn {
          padding: 8px 16px;
          border: none;
          background: none;
          color: #666;
          cursor: pointer;
          border-radius: 6px;
          font-size: 14px;
          transition: all 0.2s ease;
        }

        .time-btn:hover {
          background: #f8f9fa;
          color: #333;
        }

        .time-btn.active {
          background: #667eea;
          color: white;
        }

        .ai-recommendations-card {
          margin-bottom: 20px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .ai-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .ai-badge {
          background: rgba(255,255,255,0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
        }

        .ai-recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .ai-recommendation {
          background: rgba(255,255,255,0.1);
          padding: 15px;
          border-radius: 8px;
        }

        .ai-label {
          font-size: 12px;
          opacity: 0.8;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .ai-value {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .ai-status {
          font-size: 12px;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }

        .ai-status.above { background: rgba(255,107,107,0.2); }
        .ai-status.below { background: rgba(255,193,7,0.2); }
        .ai-status.onTrack { background: rgba(40,167,69,0.2); }

        .ai-macro-chart {
          display: flex;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 10px;
          background: rgba(255,255,255,0.1);
        }

        .macro-bar {
          height: 100%;
          transition: width 0.3s ease;
        }

        .macro-bar.protein { background: #667eea; }
        .macro-bar.carbs { background: #f5576c; }
        .macro-bar.fats { background: #4facfe; }

        .workout-suggestion {
          font-size: 12px;
          opacity: 0.8;
          margin-top: 5px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          border-radius: 10px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 28px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border-radius: 50%;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin-bottom: 4px;
        }

        .stat-value.positive { color: #28a745; }
        .stat-value.negative { color: #dc3545; }

        .stat-change {
          font-size: 12px;
          color: #666;
        }

        .chart-navigation {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          overflow-x: auto;
          padding-bottom: 10px;
        }

        .chart-btn {
          padding: 10px 20px;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 20px;
          color: #495057;
          cursor: pointer;
          font-size: 14px;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .chart-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .chart-btn.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }

        .chart-container {
          margin-bottom: 20px;
        }

        .chart-card {
          padding: 20px;
        }

        .chart-title {
          margin-bottom: 20px;
          color: #333;
          font-size: 18px;
        }

        .macro-chart-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          align-items: center;
        }

        @media (max-width: 768px) {
          .macro-chart-container {
            grid-template-columns: 1fr;
          }
        }

        .macro-details {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .macro-detail {
          display: grid;
          grid-template-columns: 20px 1fr 60px 80px;
          gap: 15px;
          align-items: center;
          padding: 10px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .macro-color {
          width: 20px;
          height: 20px;
          border-radius: 4px;
        }

        .macro-name {
          font-weight: 600;
          color: #333;
        }

        .macro-percentage {
          font-weight: 700;
          color: #667eea;
        }

        .macro-grams {
          font-size: 12px;
          color: #666;
        }

        .insights-card {
          margin-bottom: 20px;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
        }

        .insight {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .insight-icon {
          font-size: 24px;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f9fa;
          border-radius: 10px;
        }

        .insight-content h4 {
          margin: 0 0 5px 0;
          color: #333;
          font-size: 16px;
        }

        .insight-content p {
          margin: 0 0 5px 0;
          font-size: 18px;
          font-weight: 700;
          color: #667eea;
        }

        .insight-content small {
          color: #666;
          font-size: 12px;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-dashboard {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon {
          font-size: 60px;
          margin-bottom: 20px;
        }

        .empty-dashboard h2 {
          color: #333;
          margin-bottom: 10px;
        }

        .empty-dashboard p {
          color: #666;
          margin-bottom: 5px;
        }

        .empty-tip {
          color: #667eea;
          font-weight: 500;
          margin-top: 20px;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
          }

          .time-range-selector {
            width: 100%;
            justify-content: center;
          }

          .ai-recommendations-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .chart-navigation {
            flex-wrap: wrap;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Visualization;