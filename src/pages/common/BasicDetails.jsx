import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import "../../styles/BasicDetails.css";

const BasicDetails = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (error) setError("");
  };

  const handlePhoneChange = (e) => {
    // Replace any non-numeric character with an empty string
    const numericValue = e.target.value.replace(/\D/g, "");
    
    // Limit to exactly 10 digits
    if (numericValue.length <= 10) {
      setForm({ ...form, phone: numericValue });
    }
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!form.name.trim() || form.phone.length < 10 || !form.city.trim()) {
      setError("Please fill in all details correctly.");
      return;
    }
    
    if (!accepted) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }

    // Save phone to local storage for the Verify OTP page to read
    localStorage.setItem("signupPhone", form.phone);

    // TODO: Save remaining user profile details to backend here

    navigate({ to: "/verify-otp" });
  };

  return (
    <div className="mobile-page-container">
      <div className="app-content">
        
        {/* Brand Header */}
        <header className="brand-header">
          <h1 className="brand-title">BussInn</h1>
        </header>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2 className="welcome-title">Welcome To BussInn</h2>
          <p className="welcome-subtitle">
            Let's get your profile set up so you can start riding.
          </p>
        </div>

        {/* Form Section */}
        <form className="profile-form" onSubmit={handleSubmit}>
          
          {/* Full Name Input */}
          <div className="input-group">
            <label htmlFor="name" className="input-label">Full Name</label>
            <input
              type="text"
              id="name"
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange("name")}
              className="form-input"
            />
          </div>

          {/* Phone Number Input */}
          <div className="input-group">
            <label htmlFor="phone" className="input-label">Phone Number</label>
            <div className="phone-input-wrapper">
              <div className="country-code">+91</div>
              <input
                type="tel"
                id="phone"
                placeholder="00000 00000"
                value={form.phone}
                onChange={handlePhoneChange}
                maxLength={10}
                className="form-input phone-number-field"
              />
            </div>
          </div>

          {/* City Input */}
          <div className="input-group">
            <label htmlFor="city" className="input-label">City</label>
            <input
              type="text"
              id="city"
              placeholder="e.g. Mumbai"
              value={form.city}
              onChange={handleChange("city")}
              className="form-input"
            />
          </div>

          <p className="info-text">We'll send a code to confirm your number.</p>

          {/* Terms and Conditions Checkbox */}
          <div className="terms-container">
            <input
              type="checkbox"
              id="terms"
              checked={accepted}
              onChange={(e) => {
                setAccepted(e.target.checked);
                if (error) setError("");
              }}
              className="custom-checkbox"
            />
            <label htmlFor="terms" className="terms-label">
              I agree to the <a href="/help" className="terms-link">Terms & Conditions</a> and the <a href="/help" className="terms-link">Privacy Policy</a>, and consent to receive service updates from BussInn.
            </label>
          </div>

          {/* Action Section */}
          <div className="action-section">
            {error && <p className="error-message">{error}</p>}
            
            <button type="submit" className="verify-button">
              Verify Now
              <svg 
                className="shield-icon" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                <path d="M9 12l2 2 4-4"></path>
              </svg>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default BasicDetails;