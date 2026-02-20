import { Link, useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.png";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  // TEMP auth check (replace with real auth later)
  const isLoggedIn = false;

  const handleLogout = () => {
    // later: clear token / auth state
    navigate("/login");
  };

  return (
    <nav className="navbar">
      {/* LOGO */}
      <div className="navbar-logo">
        <Link to="/"><img src = {Logo}alt= "FitPredict Logo"></img></Link>
      </div>

      {/* NAV LINKS */}
      <ul className="navbar-links">
        <li>
          <a href="#home">Home</a>
        </li>
        <li>
          <a href="#about">About</a>
        </li>
        <li>
          <a href="#contact">Contact</a>
        </li>

        {!isLoggedIn ? (
          <>
            <li>
              <Link to="/login" className="nav-link">
                Login
              </Link>
            </li>
            <li>
              <Link to="/signup" className="nav-btn">
                Sign Up
              </Link>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="nav-btn logout-btn">
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
