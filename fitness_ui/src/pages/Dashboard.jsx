import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import DashboardHome from "../components/dashboard/DashboardHome";
import Profile from "../components/dashboard/Profile";
import DietPlan from "../components/dashboard/DietPlan";
import ExercisePlan from "../components/dashboard/ExercisePlan";
import Visualization from "../components/dashboard/Visualization";
import Nutritionist from "../components/dashboard/Nutritionist";
import Rating from "../components/dashboard/Rating";
import Refer from "../components/dashboard/Refer";
import DailyLogPage from "../components/dashboard/DailyLogPage";

import "./Dashboard.css"; // ✅ IMPORTANT

const Dashboard = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      {/* Main content shell */}
      <div className="dashboard-content">
        <Routes>
          <Route index element={<DashboardHome />} />
          <Route path="profile" element={<Profile />} />
          <Route path="diet" element={<DietPlan />} />
          <Route path="exercise" element={<ExercisePlan />} />
          <Route path="visualization" element={<Visualization />} />
          <Route path="nutritionist" element={<Nutritionist />} />
          <Route path="rating" element={<Rating />} />
          <Route path="refer" element={<Refer />} />
          <Route path="daily-log" element={<DailyLogPage />} /> 
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;
