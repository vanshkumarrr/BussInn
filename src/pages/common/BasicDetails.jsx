import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import "../../styles/BasicDetails.css";

const BasicDetails = () => {
  const navigate = useNavigate();
  
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  const [form, setForm] = useState(() => ({
    name: localStorage.getItem("passenger_name") || localStorage.getItem("signup_name") || "",
    phone: localStorage.getItem("passenger_phone") || "",
    city: localStorage.getItem("passenger_city") || "",
  }));
  
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");

  const content = {
    en: {
      welcome: "Welcome To BussInn",
      subtitle: "Let's get your profile set up so you can start riding.",
      nameLabel: "Full Name",
      phoneLabel: "Phone Number",
      cityLabel: "City",
      cityPlaceholder: "e.g. Mumbai",
      codeHint: "We'll send a code to confirm your number.",
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
    localStorage.setItem("passenger_name", form.name);
    localStorage.setItem("passenger_phone", form.phone);
    localStorage.setItem("passenger_city", form.city);

    navigate({ to: "/verify-otp" });
  };

  return (
    <div className="mobile-page-container">
      <div className="app-content">
        <header className="brand-header">
          <h1 className="brand-title">BussInn</h1>
          <button className="btn-lang-pill" onClick={toggleLanguage}>
            EN / HI
          </button>
        </header>

        <div className="welcome-section">
          <h2 className="welcome-title">{t.welcome}</h2>
          <p className="welcome-subtitle">{t.subtitle}</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="name" className="input-label">{t.nameLabel}</label>
            <input
              type="text"
              id="name"
              value={form.name}
              onChange={handleChange("name")}
              className="form-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="phone" className="input-label">{t.phoneLabel}</label>
            <div className="phone-input-wrapper">
              <div className="country-code">+91</div>
              <input
                type="tel"
                id="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                maxLength={10}
                className="form-input phone-number-field"
              />
            </div>
          </div>

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

          <div className="terms-container">
            <input
              type="checkbox"
              id="terms"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="custom-checkbox"
            />
            <label htmlFor="terms" className="terms-label">I agree to the Terms & Conditions</label>
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="verify-button">
            {t.verifyBtn}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BasicDetails;