import "./About.css";
import about from "../assets/about.png";

const About = () => {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        {/* TEXT */}
        <div className="about-text">
          <h2>About FitPredict</h2>
          <p>
            FitPredict is an intelligent fitness platform built to help you make
            smarter, data-driven health decisions. By combining proven fitness
            principles with predictive analytics, we transform raw workout data
            into actionable insights that actually improve performance.
          </p>

          <p>
            Whether you're just starting your fitness journey or striving to
            optimize peak performance, FitPredict adapts to your goals, tracks
            meaningful progress, and provides personalized recommendations that
            keep you consistent and motivated.
          </p>
        </div>

        {/* VISUAL */}
        <div className="about-visual">
          <div className="about-image-box">
            <img src= {about} alt="Fitness ML Dashboard" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
