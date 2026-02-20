import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { FiX } from "react-icons/fi";
import axios from "axios";
import loginImage from "../assets/loginImage.png";   
import "./Auth.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      // 🔐 Save token & user
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Try again."
      );
    }
  };

  return (
    <div className="auth-wrapper">
      {/* LEFT SIDE - FORM */}
      <div className="auth-left">
        <div className="auth-card">
          <button
            className="close-btn"
            onClick={() => navigate("/")}
          >
            <FiX size={20} />
          </button>
          <h2>Log in to FitPredict</h2>
          <p className="auth-subtitle">
            Access your personalized dashboard
          </p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            <button type="submit" className="auth-btn">
              Log In
            </button>
          </form>

          <p className="auth-footer">
            Don’t have an account?{" "}
            <Link to="/signup" className="auth-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - IMAGE */}
      <div className="auth-right">
        <img
          src={loginImage}
          alt="Fitness Dashboard Illustration"
        />
      </div>
    </div>
  );
};

export default Login;
