import { Link } from "react-router-dom";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">

        {/* BRAND */}
        <div className="footer-brand">
          <h3>FitPredict</h3>
          <p>
            Intelligent fitness insights powered by data-driven
            analytics. Train smarter, optimize nutrition,
            and achieve measurable results.
          </p>
        </div>

        {/* LINKS */}
        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Sign Up</Link></li>
          </ul>
        </div>

        {/* CONTACT */}
        <div className="footer-contact">
          <h4>Contact</h4>
          <p>📧 support@fitpredict.com</p>
          <p>📞 +91 98765 43210</p>
          <p>📍 India</p>
        </div>

      </div>

      {/* COPYRIGHT */}
      <div className="footer-bottom">
        © {new Date().getFullYear()} FitPredict. Built with passion for smarter fitness.
      </div>
    </footer>
  );
};

export default Footer;
