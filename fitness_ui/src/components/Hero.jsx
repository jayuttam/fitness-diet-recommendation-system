import { useNavigate } from "react-router-dom";
import fitnessHero from "../assets/fitnessHero.png";
import "./Hero.css";
import { useEffect, useState } from "react";

const Hero = () => {
  const navigate = useNavigate();

  const texts = [
    "Powered by Intelligent Data.",
    "Driven by Predictive Insights.",
    "Built for Real Results."
  ];

  const [displayText, setDisplayText] = useState("");
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const typingSpeed = 60;

    const type = () => {
      if (charIndex < texts[textIndex].length) {
        setDisplayText((prev) => prev + texts[textIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      } else {
        setTimeout(() => {
          setDisplayText("");
          setCharIndex(0);
          setTextIndex((prev) => (prev + 1) % texts.length);
        }, 1500);
      }
    };

    const timer = setTimeout(type, typingSpeed);
    return () => clearTimeout(timer);

  }, [charIndex, textIndex]);

  // Auth check
  const isLoggedIn = !!localStorage.getItem("token");

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="hero-section" id="home">
      <div className="hero-content">

        <div className="hero-text">
          <h1>
            Smarter Fitness.
            <br />
            <span className="typing-text">{displayText}</span>
          </h1>

          <p>
            Transform your workouts, optimize your nutrition, and
            achieve measurable results with predictive insights
            tailored to your goals.
          </p>

          <button
            className="hero-btn"
            onClick={handleGetStarted}
          >
            {isLoggedIn ? "Go to Dashboard" : "Get Started"}
          </button>
        </div>

        <div className="hero-visual">
          <div className="hero-image-box">
            <img
              src={fitnessHero}
              alt="FitPredict analytics dashboard"
            />
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
