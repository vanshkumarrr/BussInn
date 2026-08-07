import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import "../../styles/BasicDetails.css";

const BasicDetails = () => {
  const navigate = useNavigate();
  
  // 1. Global Language State (Reads from localStorage, persists across app)
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  const [form, setForm] = useState({ name: "", phone: "", city: "" });
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  // Translation Dictionary
  const content = {
    en: {
      welcome: "Welcome To BussInn",
      subtitle: "Let's get your profile set up so you can start riding.",
      nameLabel: "Full Name",
      phoneLabel: "Phone Number",
      cityLabel: "City",
      cityPlaceholder: "e.g. Mumbai",
      codeHint: "We'll send a code to confirm your number.",
      termsPre: "I agree to the ",
      termsLink1: "Terms & Conditions",
      termsAnd: " and the ",
      termsLink2: "Privacy Policy",
      termsPost: ", and consent to receive service updates from BussInn.",
      verifyBtn: "Verify Now",
      emptyError: "Please fill in all details correctly.",
      termsError: "Please accept the Terms & Conditions to continue."
    },
    hi: {
      welcome: "BussInn में आपका स्वागत है",
      subtitle: "राइडिंग शुरू करने के लिए आइए आपकी प्रोफ़ाइल सेट अप करें।",
      nameLabel: "पूरा नाम",
      phoneLabel: "फ़ोन नंबर",
      cityLabel: "शहर",
      cityPlaceholder: "जैसे मुंबई",
      codeHint: "हम आपके नंबर की पुष्टि करने के लिए एक कोड भेजेंगे।",
      termsPre: "मैं ",
      termsLink1: "नियम और शर्तों",
      termsAnd: " और ",
      termsLink2: "गोपनीयता नीति",
      termsPost: " से सहमत हूँ, और BussInn से सेवा अपडेट प्राप्त करने की सहमति देता हूँ।",
      verifyBtn: "अभी सत्यापित करें",
      emptyError: "कृपया सभी विवरण सही ढंग से भरें।",
      termsError: "जारी रखने के लिए कृपया नियम और शर्तों को स्वीकार करें।"
    }
  };

  const t = isHindi ? content.hi : content.en;

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    if (error) setError("");
  };

  const handlePhoneChange = (e) => {
    const numericValue = e.target.value.replace(/\D/g, "");
    if (numericValue.length <= 10) {
      setForm({ ...form, phone: numericValue });
    }
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.name.trim() || form.phone.length < 10 || !form.city.trim()) {
      setError(t.emptyError);
      return;
    }
    
    if (!accepted) {
      setError(t.termsError);
      return;
    }

    localStorage.setItem("signupPhone", form.phone);
    localStorage.setItem("bussinn_signup_name", form.name);

    navigate({ to: "/verify-otp" });
  };

  return (
    <div className="mobile-page-container">
      <div className="app-content">
        
        {/* Header with Global Language Toggle */}
        <header className="brand-header">
          <h1 className="brand-title">BussInn</h1>
          <button 
            className="btn-lang-pill"
            onClick={toggleLanguage}
            title="Change Language"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            EN / HI
          </button>
        </header>

        {/* Welcome Section */}
        <div className="welcome-section">
          <h2 className="welcome-title">{t.welcome}</h2>
          <p className="welcome-subtitle">{t.subtitle}</p>
        </div>

        {/* Form Section */}
        <form className="profile-form" onSubmit={handleSubmit}>
          
          {/* Full Name Input */}
          <div className="input-group">
            <label htmlFor="name" className="input-label">{t.nameLabel}</label>
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
            <label htmlFor="phone" className="input-label">{t.phoneLabel}</label>
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
            <label htmlFor="city" className="input-label">{t.cityLabel}</label>
            <input
              type="text"
              id="city"
              placeholder={t.cityPlaceholder}
              value={form.city}
              onChange={handleChange("city")}
              className="form-input"
            />
          </div>

          <p className="info-text">{t.codeHint}</p>

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
              {t.termsPre}<a href="/help" className="terms-link">{t.termsLink1}</a>{t.termsAnd}<a href="/help" className="terms-link">{t.termsLink2}</a>{t.termsPost}
            </label>
          </div>

          {/* Action Section */}
          <div className="action-section">
            {error && <p className="error-message">{error}</p>}
            
            <button type="submit" className="verify-button">
              {t.verifyBtn}
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