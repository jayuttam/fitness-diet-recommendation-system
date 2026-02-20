import { NavLink, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiUser,
  FiActivity,
  FiTrendingUp,
  FiLogOut,
  FiBarChart2,
  FiUsers,
  FiStar
} from "react-icons/fi";
import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">FitPredict</div>

      {/* PROFILE */}
      <NavLink to="/dashboard/profile" className="sidebar-profile">
        <div className="profile-avatar">
          <FiUser />
        </div>
        <div className="profile-info">
          <span className="profile-name">{user?.name || "User"}</span>
          <span className="profile-role">Fitness Member</span>
        </div>
      </NavLink>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" end>
          <FiHome /> Dashboard
        </NavLink>

        <NavLink to="/dashboard/profile">
          <FiUser /> Profile
        </NavLink>

        <NavLink to="/dashboard/diet">
          <FiActivity /> Diet Plan
        </NavLink>

        <NavLink to="/dashboard/exercise">
          <FiTrendingUp /> Exercise Plan
        </NavLink>

        <NavLink to="/dashboard/daily-log">
          <FiTrendingUp /> Log Daily Activity
        </NavLink>

        <NavLink to="/dashboard/visualization">
          <FiBarChart2 /> Visualize Progress
        </NavLink>

        <NavLink to="/dashboard/nutritionist">
          <FiUsers /> Nutritionist
        </NavLink>

        <NavLink to="/dashboard/rating">
          <FiStar /> Rate Us
        </NavLink>

        <NavLink to="/dashboard/refer">
          <FiUsers /> Refer a Friend
        </NavLink>
      </nav>

      <button className="sidebar-link logout-link" onClick={handleLogout}>
        <FiLogOut /> Logout
      </button>
    </aside>
  );
};

export default Sidebar;
