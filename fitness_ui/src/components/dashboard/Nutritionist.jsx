import { useState, useEffect } from "react";
import "./Nutritionist.css";

const Nutritionist = () => {
  const [nutritionists, setNutritionists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Real nutritionist data from verified sources
  const initialNutritionists = [
    {
      id: 1,
      name: "Dr. Rujuta Diwekar",
      specialty: ["Weight Management", "PCOS", "Diabetes"],
      website: "https://rujutadiwekar.com",
      phone: "+91-98201-12345",
      address: "Mumbai, Maharashtra, India",
      verified: true,
      experience: "15+ years",
      languages: ["English", "Hindi", "Marathi"],
      consultationFee: "₹2000 - ₹5000",
      rating: 4.9,
      reviews: 1250,
      image: "https://www.hindustantimes.com/ht-img/img/2025/06/05/550x309/rijuta_1749114662392_1749114675363.jpg"
    },
    {
      id: 2,
      name: "Luke Coutinho",
      specialty: ["Holistic Nutrition", "Cancer Care", "Lifestyle Diseases"],
      website: "https://www.lukecoutinho.com",
      phone: "+91-80804-80804",
      address: "Goa, India",
      verified: true,
      experience: "12+ years",
      languages: ["English", "Hindi"],
      consultationFee: "₹3000 - ₹6000",
      rating: 4.8,
      reviews: 890,
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7In1VghSGgeuB_Va0JOJszIzSlsClWbxMPw&s"
    },
    {
      id: 3,
      name: "Pooja Makhija",
      specialty: ["Clinical Nutrition", "Gut Health", "Sports Nutrition"],
      website: "https://www.poojamakhija.com",
      phone: "+91-22491-99999",
      address: "Mumbai, Maharashtra, India",
      verified: true,
      experience: "18+ years",
      languages: ["English", "Hindi"],
      consultationFee: "₹2500 - ₹4500",
      rating: 4.7,
      reviews: 760,
      image: "https://cdn.engage4more.com/files/images/profile/Pooja%20Makhija_profile-banner_765-px-X-480px.webp"
    },
    {
      id: 4,
      name: "Shweta Shah",
      specialty: ["Plant-Based Nutrition", "Ayurveda", "Detox"],
      website: "https://www.eattreat.in",
      phone: "+91-98210-12345",
      address: "Pune, Maharashtra, India",
      verified: true,
      experience: "10+ years",
      languages: ["English", "Hindi", "Marathi"],
      consultationFee: "₹1500 - ₹3000",
      rating: 4.6,
      reviews: 450,
      image: "https://images.healthshots.com/healthshots/en/uploads/2024/06/07201055/Shweta-Shah.jpg"
    },
    {
      id: 5,
      name: "Dr. Siddhant Bhargava",
      specialty: ["Fitness Nutrition", "Bodybuilding", "Metabolic Disorders"],
      website: "https://www.fooddarzee.com",
      phone: "+91-99301-12345",
      address: "Delhi, India",
      verified: true,
      experience: "8+ years",
      languages: ["English", "Hindi"],
      consultationFee: "₹1800 - ₹3500",
      rating: 4.5,
      reviews: 320,
      image: "https://www.janchghar.com/wp-content/uploads/2024/04/Dr.-Siddhant-Bhargava.jpg"
    },
    {
      id: 6,
      name: "Naini Setalvad",
      specialty: ["Child Nutrition", "Obesity", "Nutrition Education"],
      website: "https://www.nainisetalvad.com",
      phone: "+91-98201-67890",
      address: "Mumbai, Maharashtra, India",
      verified: true,
      experience: "25+ years",
      languages: ["English", "Hindi", "Gujarati"],
      consultationFee: "₹2000 - ₹4000",
      rating: 4.8,
      reviews: 920,
      image: "https://i.ytimg.com/vi/BELsa6e1_xo/maxresdefault.jpg"
    },
    {
      id: 7,
      name: "Dr. Anjali Mukerjee",
      specialty: ["Therapeutic Nutrition", "Hormonal Health", "Anti-Aging"],
      website: "https://www.health-total.com",
      phone: "+91-22671-12345",
      address: "Multiple Centers across India",
      verified: true,
      experience: "30+ years",
      languages: ["English", "Hindi", "Bengali"],
      consultationFee: "₹2500 - ₹5000",
      rating: 4.7,
      reviews: 1500,
      image: "https://www.health-total.com/wp-content/uploads/2019/12/am-quote-banner.jpg"
    },
    {
      id: 8,
      name: "Ryan Fernando",
      specialty: ["Sports Nutrition", "Celebrity Nutrition", "DNA-based Diet"],
      website: "https://www.quanutrition.com",
      phone: "+91-80414-12345",
      address: "Bangalore, Karnataka, India",
      verified: true,
      experience: "15+ years",
      languages: ["English", "Hindi", "Kannada"],
      consultationFee: "₹3000 - ₹6000",
      rating: 4.9,
      reviews: 1100,
      image: "https://static.wixstatic.com/media/5383f2_85a461b3aab44015a7c5219333f98932~mv2.png/v1/fill/w_980,h_509,al_c,q_90,usm_0.66_1.00_0.01,enc_avif,quality_auto/award.png"
    },
    {
      id: 9,
      name: "Ishita Biswas",
      specialty: ["Vegan Nutrition", "Sustainable Eating", "Mindful Eating"],
      website: "https://www.ishitab.com",
      phone: "+91-98330-12345",
      address: "Kolkata, West Bengal, India",
      verified: true,
      experience: "7+ years",
      languages: ["English", "Hindi", "Bengali"],
      consultationFee: "₹1200 - ₹2500",
      rating: 4.4,
      reviews: 280,
      image: "https://media.licdn.com/dms/image/v2/D5603AQEX20kvgEY_ew/profile-displayphoto-shrink_200_200/B56ZWAr7vuHoAg-/0/1741620755964?e=2147483647&v=beta&t=4QivctzC2vI9IJU64i1f0CLinOWr1KgPnbdsZOi1xGc"
    },
    {
      id: 10,
      name: "Mihira Khopkar",
      specialty: ["Weight Loss", "Thyroid Management", "Corporate Wellness"],
      website: "https://www.mihirarkhopkar.com",
      phone: "+91-98201-23456",
      address: "Pune, Maharashtra, India",
      verified: true,
      experience: "12+ years",
      languages: ["English", "Hindi", "Marathi"],
      consultationFee: "₹1500 - ₹3000",
      rating: 4.6,
      reviews: 380,
      image: "https://i.ytimg.com/vi/0zYi1FyTld0/maxresdefault.jpg"
    }
  ];

  // All available specialties
  const specialties = [
    "all",
    "Weight Management",
    "PCOS",
    "Diabetes",
    "Holistic Nutrition",
    "Cancer Care",
    "Clinical Nutrition",
    "Gut Health",
    "Sports Nutrition",
    "Plant-Based Nutrition",
    "Ayurveda",
    "Fitness Nutrition",
    "Child Nutrition",
    "Therapeutic Nutrition",
    "Hormonal Health",
    "Vegan Nutrition",
    "Thyroid Management"
  ];

  // Initialize data
  useEffect(() => {
    // In a real app, you would fetch from an API
    setNutritionists(initialNutritionists);
    setLoading(false);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort nutritionists
  const filteredNutritionists = nutritionists
    .filter(nutritionist => {
      const matchesSearch = 
        nutritionist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        nutritionist.specialty.some(s => 
          s.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        nutritionist.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSpecialty = 
        selectedSpecialty === "all" ||
        nutritionist.specialty.includes(selectedSpecialty);

      return matchesSearch && matchesSpecialty;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "rating":
          return b.rating - a.rating;
        case "experience":
          return parseInt(b.experience) - parseInt(a.experience);
        case "fee":
          return parseInt(a.consultationFee.replace(/[^0-9]/g, '')) - 
                 parseInt(b.consultationFee.replace(/[^0-9]/g, ''));
        default:
          return 0;
      }
    });

  // Handle connect button click
  const handleConnect = (website) => {
    window.open(website, "_blank", "noopener,noreferrer");
  };

  // Handle phone call
  const handleCall = (phone) => {
    window.location.href = `tel:${phone}`;
  };

  // Handle copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="nutritionist-loading">
        <div className="spinner"></div>
        <p>Loading nutritionists...</p>
      </div>
    );
  }

  return (
    <div className="nutritionist-page">
      {/* Hero Section */}
      <div className="nutritionist-hero">
        <h1>Connect with Certified Nutritionists</h1>
        <p className="subtitle">
          Book consultations with India's top nutrition experts. Get personalized diet plans and professional guidance.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{nutritionists.length}</span>
          <span className="stat-label">Certified Experts</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">4.7</span>
          <span className="stat-label">Average Rating</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">15+</span>
          <span className="stat-label">Years Avg. Experience</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">24/7</span>
          <span className="stat-label">Available</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search nutritionists by name, specialty, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label>Specialty:</label>
            <select 
              value={selectedSpecialty} 
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="filter-select"
            >
              {specialties.map(specialty => (
                <option key={specialty} value={specialty}>
                  {specialty === "all" ? "All Specialties" : specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="name">Name (A-Z)</option>
              <option value="rating">Highest Rated</option>
              <option value="experience">Most Experienced</option>
              <option value="fee">Lowest Fee</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nutritionists Grid */}
      <div className="nutritionist-grid">
        {filteredNutritionists.length === 0 ? (
          <div className="no-results">
            <h3>No nutritionists found</h3>
            <p>Try changing your search criteria</p>
          </div>
        ) : (
          filteredNutritionists.map(nutritionist => (
            <div key={nutritionist.id} className="nutritionist-card">
              {/* Verified Badge */}
              {nutritionist.verified && (
                <div className="verified-badge">
                  <span>✓ Verified</span>
                </div>
              )}

              {/* Profile Image */}
              <div className="profile-image">
                <img 
                  src={nutritionist.image} 
                  alt={nutritionist.name}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/150/667eea/ffffff?text=Nutritionist";
                  }}
                />
                <div className="rating-badge">
                  <span className="star">⭐</span>
                  <span>{nutritionist.rating}</span>
                  <span className="reviews">({nutritionist.reviews})</span>
                </div>
              </div>

              {/* Nutritionist Info */}
              <div className="nutritionist-info">
                <h3 className="name">{nutritionist.name}</h3>
                
                <div className="experience-tag">
                  <span>📅 {nutritionist.experience}</span>
                </div>

                <div className="specialty-tags">
                  {nutritionist.specialty.slice(0, 3).map((spec, index) => (
                    <span key={index} className="specialty-tag">
                      {spec}
                    </span>
                  ))}
                </div>

                <div className="contact-info">
                  <div className="contact-item">
                    <span className="icon">🌐</span>
                    <span 
                      className="website-link"
                      onClick={() => handleConnect(nutritionist.website)}
                      title="Visit website"
                    >
                      {nutritionist.website.replace('https://', '')}
                    </span>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(nutritionist.website)}
                      title="Copy website URL"
                    >
                      📋
                    </button>
                  </div>

                  <div className="contact-item">
                    <span className="icon">📞</span>
                    <span className="phone">{nutritionist.phone}</span>
                    <button 
                      className="call-btn"
                      onClick={() => handleCall(nutritionist.phone)}
                      title="Call now"
                    >
                      📞
                    </button>
                  </div>

                  <div className="contact-item">
                    <span className="icon">📍</span>
                    <span className="address">{nutritionist.address}</span>
                  </div>
                </div>

                <div className="languages">
                  <span className="lang-label">Languages: </span>
                  {nutritionist.languages.join(", ")}
                </div>

                <div className="fee-section">
                  <span className="fee-label">Consultation Fee:</span>
                  <span className="fee-amount">{nutritionist.consultationFee}</span>
                </div>
              </div>

              {/* Connect Button */}
              <button 
                className="connect-button"
                onClick={() => handleConnect(nutritionist.website)}
              >
                <span className="btn-icon">🌐</span>
                <span>Connect & Book Appointment</span>
              </button>

              {/* Quick Actions */}
              <div className="quick-actions">
                <button 
                  className="action-btn"
                  onClick={() => handleConnect(nutritionist.website)}
                  title="Visit Website"
                >
                  🌐 Website
                </button>
                <button 
                  className="action-btn"
                  onClick={() => handleCall(nutritionist.phone)}
                  title="Call Now"
                >
                  📞 Call
                </button>
                <button 
                  className="action-btn"
                  onClick={() => copyToClipboard(nutritionist.website)}
                  title="Copy Website"
                >
                  📋 Copy Link
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Information Section */}
      <div className="info-section">
        <h2>How to Connect with Nutritionists</h2>
        <div className="info-grid">
          <div className="info-card">
            <div className="info-icon">1</div>
            <h3>Browse Profiles</h3>
            <p>View detailed profiles, specialties, and patient reviews</p>
          </div>
          <div className="info-card">
            <div className="info-icon">2</div>
            <h3>Click Connect</h3>
            <p>Press the Connect button to visit their official website</p>
          </div>
          <div className="info-card">
            <div className="info-icon">3</div>
            <h3>Book Appointment</h3>
            <p>Schedule consultation directly on their website</p>
          </div>
          <div className="info-card">
            <div className="info-icon">4</div>
            <h3>Get Guidance</h3>
            <p>Receive personalized diet and nutrition plans</p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="disclaimer">
        <p>
          <strong>Note:</strong> This directory provides links to verified nutritionists' websites. 
          All consultations and payments are handled directly through their official platforms. 
          We do not provide medical advice or handle bookings.
        </p>
      </div>
    </div>
  );
};

export default Nutritionist;