import { useState } from "react";
import API from "../utils/api";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    description: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/contact", formData);

      alert("Message sent successfully! 🚀");

      // Reset form
      setFormData({
        fullName: "",
        email: "",
        description: "",
      });
    } catch (error) {
      alert("Something went wrong ❌");
      console.error(error);
    }
  };

  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">

        {/* LEFT INFO */}
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>
            Whether you have a question, feedback, or need support —
            our team is here to help.
          </p>

          <div className="contact-details">
            <p><strong>Email:</strong> support@fitpredict.com</p>
            <p><strong>Phone:</strong> +91 98765 43210</p>
            <p><strong>Location:</strong> India</p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="contact-form-box">
          <form className="contact-form" onSubmit={handleSubmit}>

            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="How can we help you?"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>

            <button type="submit" className="contact-btn">
              Send Message
            </button>

          </form>
        </div>

      </div>
    </section>
  );
};

export default Contact;