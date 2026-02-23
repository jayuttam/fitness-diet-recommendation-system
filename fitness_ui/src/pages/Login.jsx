import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import API from "../utils/api";
import loginImage from "../assets/LoginImage.png";
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
      const response = await API.post("/api/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", response.data);

      const data = response.data;

      //  Ensure token exists
      if (!data.token) {
        throw new Error("Token missing from server response");
      }

      //  Save token
      localStorage.setItem("token", data.token);

      //  Extract user
      const userData = data.user;

      // Ensure _id exists
      if (!userData?._id) {
        throw new Error("User data missing _id");
      }

      //  Save user
      localStorage.setItem("user", JSON.stringify(userData));

      // Redirect
      navigate("/dashboard");

    } catch (err) {
      console.error("Login Error:", err);

      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed. Try again."
      );
    }
  };

  return (
    <div className="auth-wrapper">
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