import { useState, useEffect } from "react";
import axios from "axios";
import {
  FaCopy,
  FaWhatsapp,
  FaEnvelope,
  FaLink,
  FaShareAlt,
  FaUserPlus,
  FaUsers,
  FaChartLine
} from "react-icons/fa";
import "./Refer.css";

const Refer = () => {
  const token = localStorage.getItem("token");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  // Simple shareable link - just uses user's email to create a unique identifier
  const getShareableId = () => {
    if (!user?.email) return "guest";
    // Create a simple hash from email
    return user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const shareableId = getShareableId();
  const referralLink = `${window.location.origin}/signup?ref=${shareableId}`;

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Hey! 👋\n\nI've been using FitPredict - it's an AI-powered fitness app that creates personalized workout and nutrition plans.\n\nJoin me here:\n${referralLink}`;
    
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };

  const shareEmail = () => {
    const subject = "Join me on FitTrack Pro";
    const body = `Hi,\n\nI've been using FitPredict and thought you might like it too. It's an AI-powered fitness app that creates personalized workout plans.\n\nYou can sign up here:\n${referralLink}\n\nBest,\n${user?.name || "Your friend"}`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareSocial = (platform) => {
    const text = `Join me on FitPredict - AI fitness app 🏋️‍♂️ ${referralLink}`;
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`
    };
    
    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  if (loading) {
    return (
      <div className="refer-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="refer-container">
      {/* Simple Header */}
      <div className="refer-header">
        <h1>Share FitPredict</h1>
        <p>Invite friends and relatives to join our fitness community</p>
      </div>

      {/* Shareable Link Card */}
      {/* <div className="share-card">
        <div className="card-header">
          <FaLink className="header-icon" />
          <h3>Your Shareable Link</h3>
        </div>
        
        <div className="link-container">
          <div className="link-preview">
            <span className="link-text">{referralLink}</span>
          </div>
          
          <button 
            className={`copy-btn ${copiedLink ? "copied" : ""}`}
            onClick={handleCopyLink}
          >
            <FaCopy />
            {copiedLink ? "Copied!" : "Copy Link"}
          </button>
        </div>
      </div> */}

      {/* Share Options */}
      <div className="share-options-card">
        <h3>Share Via</h3>
        
        <div className="share-grid">
          <button className="share-btn whatsapp" onClick={shareWhatsApp}>
            <FaWhatsapp />
            <span>WhatsApp</span>
          </button>

          <button className="share-btn email" onClick={shareEmail}>
            <FaEnvelope />
            <span>Email</span>
          </button>

          <button className="share-btn twitter" onClick={() => shareSocial('twitter')}>
            <FaShareAlt />
            <span>Twitter</span>
          </button>

          <button className="share-btn facebook" onClick={() => shareSocial('facebook')}>
            <FaShareAlt />
            <span>Facebook</span>
          </button>

          <button className="share-btn linkedin" onClick={() => shareSocial('linkedin')}>
            <FaShareAlt />
            <span>LinkedIn</span>
          </button>

          <button className="share-btn copy" onClick={handleCopyLink}>
            <FaLink />
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      {/* Simple Stats Card - Just for show
      <div className="stats-card">
        <div className="stat-item">
          <FaUsers className="stat-icon" />
          <div>
            <span className="stat-label">People you've invited</span>
            <span className="stat-value">0</span>
          </div>
        </div>
        <div className="stat-item">
          <FaUserPlus className="stat-icon" />
          <div>
            <span className="stat-label">Joined via your link</span>
            <span className="stat-value">0</span>
          </div>
        </div>
      </div> */}

      {/* How it works - Simplified */}
      <div className="how-it-works">
        <h3>How it works</h3>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <p>Share your unique link</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <p>Friend clicks and signs up</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <p>You both will able to track your self</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Refer;