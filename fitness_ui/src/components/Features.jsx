import "./Features.css";

const Features = () => {
  return (
    <section className="features-section">
      <div className="features-container">
        {/* Heading */}
        <div className="features-header">
          <h2>Why Choose FitPredict?</h2>
          <p>
            Smarter training, smarter nutrition, and measurable results —
            all powered by intelligent data analysis.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="features-grid">
          <div className="feature-card">
            <h3>Personalized Recommendations</h3>
            <p>
              Adaptive insights tailored to your goals, activity levels,
              and body metrics.
            </p>
          </div>

          <div className="feature-card">
            <h3>Predictive Progress Analysis</h3>
            <p>
              Advanced forecasting models to estimate outcomes and
              optimize your performance strategy.
            </p>
          </div>

          <div className="feature-card">
            <h3>Structured Training & Nutrition</h3>
            <p>
              Goal-aligned workout and diet plans designed to maximize
              consistency and long-term growth.
            </p>
          </div>

          <div className="feature-card">
            <h3>Data Visualization Dashboard</h3>
            <p>
              Clear performance metrics and trend tracking to monitor
              real improvement over time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
