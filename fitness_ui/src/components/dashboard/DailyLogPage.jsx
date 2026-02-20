import { useState, useEffect } from "react";
import API from "../../utils/api";
import "./DailyLogPage.css";

const DailyLogPage = () => {
  const token = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [todayLog, setTodayLog] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  const [log, setLog] = useState({
    date: new Date().toISOString().slice(0, 10),
    intake: "",
    burned: "",
    workout: "",
    steps: "",
    notes: ""
  });

  /* ========= FETCH TODAY'S LOG ========= */
  const fetchTodayLog = async () => {
    try {
      const res = await API.get(
        "/api/users/daily-logs/today", // FIXED URL
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.exists && res.data.log) {
        setTodayLog(res.data.log);
        // Pre-fill form with today's data
        setLog({
          date: res.data.log.day,
          intake: res.data.log.intake.toString(),
          burned: res.data.log.burned.toString(),
          workout: res.data.log.workout?.toString() || "",
          steps: res.data.log.steps?.toString() || "",
          notes: res.data.log.notes || ""
        });
      } else {
        setTodayLog(null);
      }
    } catch (error) {
      console.error("Error fetching today's log:", error);
    }
  };

  /* ========= FETCH RECENT LOGS ========= */
  const fetchRecentLogs = async () => {
    try {
      const res = await API.get(
        "/api/users/daily-logs", // FIXED URL
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecentLogs(res.data.logs);
      setSummary(res.data.summary);
    } catch (error) {
      console.error("Error fetching recent logs:", error);
    }
  };

  useEffect(() => {
    if (token) {
      setLoading(true);
      Promise.all([fetchTodayLog(), fetchRecentLogs()])
        .finally(() => setLoading(false));
    }
  }, [token]);

  /* ========= HANDLERS ========= */
  const handleChange = (e) => {
    setLog({ ...log, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await API.post(
        "/api/users/daily-logs", // FIXED URL
        {
          ...log,
          intake: parseInt(log.intake) || 0,
          burned: parseInt(log.burned) || 0,
          workout: parseInt(log.workout) || 0,
          steps: parseInt(log.steps) || 0
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        }
      );

      alert(response.data.message);
      
      // Refresh data
      await fetchTodayLog();
      await fetchRecentLogs();

      // Reset form (keep date)
      setLog({
        date: log.date,
        intake: "",
        burned: "",
        workout: "",
        steps: "",
        notes: ""
      });

    } catch (error) {
      console.error("Error saving log:", error);
      alert(error.response?.data?.message || "Failed to save log");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLog = async (logId) => {
    if (!window.confirm("Are you sure you want to delete this log?")) return;

    try {
      await API.delete(
        `/api/users/daily-logs/${logId}`, // FIXED URL
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Log deleted successfully");
      await fetchTodayLog();
      await fetchRecentLogs();
    } catch (error) {
      console.error("Error deleting log:", error);
      alert("Failed to delete log");
    }
  };

  const handleEditLog = (logData) => {
    setLog({
      date: logData.day,
      intake: logData.intake.toString(),
      burned: logData.burned.toString(),
      workout: logData.workout?.toString() || "",
      steps: logData.steps?.toString() || "",
      notes: logData.notes || ""
    });
    // Scroll to form
    document.querySelector('.dailylog-form').scrollIntoView({ behavior: 'smooth' });
  };

  /* ========= CALCULATE NET CALORIES ========= */
  const calculateNetCalories = () => {
    const intake = parseInt(log.intake) || 0;
    const burned = parseInt(log.burned) || 0;
    return intake - burned;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your daily logs...</p>
      </div>
    );
  }

  const netCalories = calculateNetCalories();

  return (
    <div className="dailylog-container">
      {/* HEADER */}
      <div className="dailylog-header">
        <div>
          <h1 className="page-title">Daily Fitness Log</h1>
          <p className="page-subtitle">
            Track your daily calories, workouts, and progress
          </p>
        </div>
        <div className="header-meta">
          {summary && (
            <div className="meta-stats">
              <div className="meta-stat">
                <span className="stat-label">Avg. Intake</span>
                <span className="stat-value">{summary.avgIntake} kcal</span>
              </div>
              <div className="meta-stat">
                <span className="stat-label">Avg. Burned</span>
                <span className="stat-value">{summary.avgBurned} kcal</span>
              </div>
              <div className="meta-stat">
                <span className="stat-label">Total Logs</span>
                <span className="stat-value">{summary.totalLogs}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TODAY'S SUMMARY CARD */}
      {todayLog && (
        <div className="card today-summary-card">
          <div className="today-header">
            <h3 className="section-title">Today's Summary</h3>
            <span className="today-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="today-stats">
            <div className="today-stat">
              <div className="today-stat-label">Calories Intake</div>
              <div className="today-stat-value">{todayLog.intake} kcal</div>
            </div>
            <div className="today-stat">
              <div className="today-stat-label">Calories Burned</div>
              <div className="today-stat-value">{todayLog.burned} kcal</div>
            </div>
            <div className="today-stat">
              <div className="today-stat-label">Net Calories</div>
              <div className={`today-stat-value ${todayLog.netCalories > 0 ? 'positive' : 'negative'}`}>
                {todayLog.netCalories > 0 ? '+' : ''}{todayLog.netCalories} kcal
              </div>
            </div>
            <div className="today-stat">
              <div className="today-stat-label">Workout</div>
              <div className="today-stat-value">{todayLog.workout || 0} min</div>
            </div>
            <div className="today-stat">
              <div className="today-stat-label">Steps</div>
              <div className="today-stat-value">{todayLog.steps || 0}</div>
            </div>
          </div>
          <div className="today-actions">
            <button 
              className="btn-edit"
              onClick={() => handleEditLog(todayLog)}
            >
              Edit Today's Log
            </button>
            <button 
              className="btn-delete"
              onClick={() => handleDeleteLog(todayLog._id)}
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* LOG FORM */}
      <form className="card dailylog-form" onSubmit={handleSubmit}>
        <h3 className="section-title">
          {todayLog ? "Update Daily Log" : "Add Daily Log"}
        </h3>
        
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={log.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="intake">Calories Intake (kcal)</label>
            <input
              type="number"
              id="intake"
              name="intake"
              placeholder="Enter calories consumed"
              value={log.intake}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="burned">Calories Burned (kcal)</label>
            <input
              type="number"
              id="burned"
              name="burned"
              placeholder="Enter calories burned"
              value={log.burned}
              onChange={handleChange}
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="workout">Workout Minutes</label>
            <input
              type="number"
              id="workout"
              name="workout"
              placeholder="Enter workout minutes"
              value={log.workout}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group">
            <label htmlFor="steps">Steps</label>
            <input
              type="number"
              id="steps"
              name="steps"
              placeholder="Enter steps count"
              value={log.steps}
              onChange={handleChange}
              min="0"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Notes (Optional)</label>
            <textarea
              id="notes"
              name="notes"
              placeholder="Any additional notes about your day..."
              value={log.notes}
              onChange={handleChange}
              rows="3"
            />
          </div>
        </div>

        {/* NET CALORIES CALCULATOR */}
        <div className="net-calories-card">
          <div className="net-calories-label">Net Calories</div>
          <div className={`net-calories-value ${netCalories > 0 ? 'positive' : netCalories < 0 ? 'negative' : 'neutral'}`}>
            {netCalories > 0 ? '+' : ''}{netCalories} kcal
          </div>
          <div className="net-calories-explanation">
            {netCalories > 0 
              ? "Calorie surplus (weight gain)"
              : netCalories < 0 
              ? "Calorie deficit (weight loss)"
              : "Calorie maintenance"}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : todayLog ? "Update Log" : "Save Log"}
          </button>
          <button 
            type="button" 
            className="btn-secondary"
            onClick={() => {
              setLog({
                date: new Date().toISOString().slice(0, 10),
                intake: "",
                burned: "",
                workout: "",
                steps: "",
                notes: ""
              });
            }}
          >
            Clear Form
          </button>
        </div>
      </form>

      {/* RECENT LOGS */}
      <div className="card history-card">
        <div className="history-header">
          <h3 className="section-title">Recent Logs</h3>
          <button
            className="btn-toggle"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? "Hide" : "Show"} History
          </button>
        </div>

        {showHistory && (
          <>
            {recentLogs.length > 0 ? (
              <div className="logs-table">
                <div className="table-header-row">
                  <div className="date-col">Date</div>
                  <div className="intake-col">Intake</div>
                  <div className="burned-col">Burned</div>
                  <div className="net-col">Net</div>
                  <div className="workout-col">Workout</div>
                  <div className="steps-col">Steps</div>
                  <div className="actions-col">Actions</div>
                </div>

                {recentLogs.map((logItem) => (
                  <div key={logItem._id} className="log-row">
                    <div className="date-col">
                      {new Date(logItem.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="intake-col">{logItem.intake} kcal</div>
                    <div className="burned-col">{logItem.burned} kcal</div>
                    <div className={`net-col ${logItem.netCalories > 0 ? 'positive' : 'negative'}`}>
                      {logItem.netCalories > 0 ? '+' : ''}{logItem.netCalories}
                    </div>
                    <div className="workout-col">{logItem.workout || 0} min</div>
                    <div className="steps-col">{logItem.steps || 0}</div>
                    <div className="actions-col">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditLog(logItem)}
                      >
                        Edit
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteLog(logItem._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-logs">
                <p>No logs found. Start tracking your daily progress!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DailyLogPage;