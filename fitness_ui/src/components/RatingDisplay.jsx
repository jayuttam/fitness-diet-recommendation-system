import { useEffect, useState } from "react";
import axios from "axios";
import "./RatingDisplay.css";

const RatingDisplay = () => {
  const [ratings, setRatings] = useState([]);

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/ratings");
      setRatings(res.data);
    } catch (error) {
      console.error("Failed to fetch ratings");
    }
  };

  const average =
    ratings.length > 0
      ? ratings.reduce((acc, item) => acc + item.rating, 0) /
        ratings.length
      : 0;

  return (
    <div className="rating-display">
      <h2>What Our Users Say ⭐</h2>

      <div className="rating-summary">
        <div className="average">
          <span className="big-rating">{average.toFixed(1)}</span>
          <span>/ 5</span>
        </div>

        <div className="stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={
                star <= Math.round(average) ? "star active" : "star"
              }
            >
              ★
            </span>
          ))}
        </div>

        <p>{ratings.length} Reviews</p>
      </div>

      {/* Latest 3 Reviews */}
      <div className="review-list">
        {ratings.slice(0, 3).map((item) => (
          <div key={item._id} className="review-card">
            <h4>{item.user?.name}</h4>
            <div className="mini-stars">
              {[...Array(item.rating)].map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <p>{item.review}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingDisplay;