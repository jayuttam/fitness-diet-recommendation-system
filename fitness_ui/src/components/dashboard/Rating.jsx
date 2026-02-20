import { useState } from "react";
import API from "../../utils/api";
import "./Rating.css";

const Rating = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setMessage("Please select a rating ⭐");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      await API.post("/api/ratings", {
        rating,
        review,
        userId: user?._id,
      });

      setMessage("Thanks for your review! ⭐");
      setRating(0);
      setReview("");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "You already submitted a rating."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="rating-container">
        <div className="rating-form">
          <h2>Please login to submit rating 🔒</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="rating-container">
      <form className="rating-form" onSubmit={handleSubmit}>
        <h2>Rate Your Experience ⭐</h2>

        <p className="logged-user">
          Logged in as: <strong>{user.name}</strong>
        </p>

        {/* STAR RATING */}
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= (hover || rating) ? "active" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Write your review (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Review"}
        </button>

        {message && <p className="form-message">{message}</p>}
      </form>
    </div>
  );
};

export default Rating;