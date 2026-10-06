import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import "../../styles/BasicDetails.css";

const BussInnBrand = () => (
  <div className="basic-brand" aria-label="BussInn">
    <svg
      className="basic-brand-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m21.5,8h-.5v-2c0-2.21-1.79-4-4-4H7c-2.21,0-4,1.79-4,4v2h-.5c-.28,0-.5.22-.5.5v3c0,.28.22.5.5.5h.5v6c0 .74.41 1.37 1 1.72v1.78c0 .28.22.5.5.5h2c.28 0 .5-.22.5-.5v-1.5h10v1.5c0 .28.22.5.5.5h2c.28 0 .5-.22.5-.5v-1.78c.59-.35 1-.98 1-1.72v-6h.5c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5Zm-2.5 10v-6h-6v-5h6v-1 12s0 0 0 0Zm-13-2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5Zm9 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5ZM5 7h6v5H5V7Z" />
    </svg>
    <span className="basic-brand-name">BussInn</span>
  </div>
);

const BasicDetails = () => {
  const navigate = useNavigate();

  const [isHindi, setIsHindi] = useState(
    () => localStorage.getItem("bussinn_lang") === "hi"
  );
  const [form, setForm] = useState(() => ({
    name:
      localStorage.getItem("passenger_name") ||
      localStorage.getItem("signup_name") ||
      "",
    phone: localStorage.getItem("passenger_phone") || "",
    city: localStorage.getItem("passenger_city") || ""
  }));
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const content = {
    en: {
      welcome: "Complete your profile",
      subtitle: "A few details and you’re ready to get started.",
      nameLabel: "Full name",
      namePlaceholder: "Enter your full name",
      phoneLabel: "Phone number",
      phonePlaceholder: "10-digit mobile number",
      cityLabel: "City",
      cityPlaceholder: "e.g. Mumbai",
      codeHint: "We’ll send a code to verify your number.",
      termsLabel: "I agree to the Terms & Conditions",
      verifyBtn: "Verify now",
      loadingTitle: "Getting things ready",
      loadingSubtitle: "Taking you to phone verification…",
      emptyError: "Please enter your name, a valid phone number, and city.",
      termsError: "Please accept the Terms & Conditions to continue.",
      languageLabel: "EN / HI"
    },
    hi: {
      welcome: "अपनी प्रोफ़ाइल पूरी करें",
      subtitle: "कुछ जानकारी दें और शुरुआत करें।",
      nameLabel: "पूरा नाम",
      namePlaceholder: "अपना पूरा नाम दर्ज करें",
      phoneLabel: "फ़ोन नंबर",
      phonePlaceholder: "10 अंकों का मोबाइल नंबर",
      cityLabel: "शहर",
      cityPlaceholder: "जैसे मुंबई",
      codeHint: "आपके नंबर की पुष्टि के लिए हम एक कोड भेजेंगे।",
      termsLabel: "मैं नियम और शर्तों से सहमत हूँ",
      verifyBtn: "अभी सत्यापित करें",
      loadingTitle: "तैयारी हो रही है",
      loadingSubtitle: "आपको फ़ोन सत्यापन पर ले जा रहे हैं…",
      emptyError: "कृपया अपना नाम, सही फ़ोन नंबर और शहर दर्ज करें।",
      termsError: "जारी रखने के लिए कृपया नियम और शर्तें स्वीकार करें।",
      languageLabel: "HI / EN"
    }
  };

  const t = isHindi ? content.hi : content.en;

  const toggleLanguage = () => {
    const nextIsHindi = !isHindi;
    setIsHindi(nextIsHindi);
    localStorage.setItem("bussinn_lang", nextIsHindi ? "hi" : "en");
    setError("");
  };

  const handleChange = (key) => (event) => {
    setForm((current) => ({
      ...current,
      [key]: event.target.value
    }));

    if (error) setError("");
  };

  const handlePhoneChange = (event) => {
    const numericValue = event.target.value.replace(/\D/g, "").slice(0, 10);

    setForm((current) => ({
      ...current,
      phone: numericValue
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || form.phone.length !== 10 || !form.city.trim()) {
      setError(t.emptyError);
      return;
    }

    if (!accepted) {
      setError(t.termsError);
      return;
    }

    if (isVerifying) return;

    localStorage.setItem("signupPhone", form.phone);
    localStorage.setItem("bussinn_signup_name", form.name.trim());
    localStorage.setItem("passenger_name", form.name.trim());
    localStorage.setItem("passenger_phone", form.phone);
    localStorage.setItem("passenger_city", form.city.trim());

    setIsVerifying(true);

    try {
      await navigate({ to: "/verify-otp" });
    } catch (navigationError) {
      console.error("Could not open phone verification:", navigationError);
      setIsVerifying(false);
      setError("Could not open phone verification. Please try again.");
    }
  };

  return (
    <main className="basic-page">
      <section className="basic-app">
        <header className="basic-top-bar">
          <BussInnBrand />

          <button
            type="button"
            className="basic-language-button"
            onClick={toggleLanguage}
            aria-label={
              isHindi ? "Switch language to English" : "भाषा हिंदी में बदलें"
            }
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            <span>{t.languageLabel}</span>
          </button>
        </header>

        <section className="basic-card">
          <div className="basic-card-heading">
            <span className="basic-card-kicker">BUSSINN PROFILE</span>
            <h1>{t.welcome}</h1>
            <p>{t.subtitle}</p>
          </div>

          <form className="basic-form" onSubmit={handleSubmit}>
            <div className="basic-field">
              <label htmlFor="basic-name">{t.nameLabel}</label>
              <input
                id="basic-name"
                type="text"
                value={form.name}
                onChange={handleChange("name")}
                placeholder={t.namePlaceholder}
                autoComplete="name"
                disabled={isVerifying}
                required
              />
            </div>

            <div className="basic-field">
              <label htmlFor="basic-phone">{t.phoneLabel}</label>
              <div className="basic-phone-control">
                <span className="basic-country-code">+91</span>
                <input
                  id="basic-phone"
                  type="tel"
                  inputMode="numeric"
                  value={form.phone}
                  onChange={handlePhoneChange}
                  placeholder={t.phonePlaceholder}
                  autoComplete="tel-national"
                  maxLength={10}
                  disabled={isVerifying}
                  required
                />
              </div>
              <p className="basic-field-hint">{t.codeHint}</p>
            </div>

            <div className="basic-field">
              <label htmlFor="basic-city">{t.cityLabel}</label>
              <input
                id="basic-city"
                type="text"
                value={form.city}
                onChange={handleChange("city")}
                placeholder={t.cityPlaceholder}
                autoComplete="address-level2"
                disabled={isVerifying}
                required
              />
            </div>

            <label className="basic-terms">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(event) => {
                  setAccepted(event.target.checked);
                  if (error) setError("");
                }}
                disabled={isVerifying}
              />
              <span>{t.termsLabel}</span>
            </label>

            {error && (
              <p className="basic-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="basic-submit"
              disabled={isVerifying}
            >
              <span>{t.verifyBtn}</span>
              <span className="basic-submit-arrow" aria-hidden="true">→</span>
            </button>
          </form>
        </section>
      </section>

      {isVerifying && (
        <div className="verification-loading" role="status" aria-live="polite">
          <div className="verification-loading-card">
            <div className="loading-brand">
              <BussInnBrand />
            </div>

            <div className="loading-route" aria-hidden="true">
              <span className="loading-route-track" />
              <span className="loading-route-stop loading-route-stop-start" />
              <span className="loading-route-stop loading-route-stop-end" />
              <span className="loading-bus">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4S4 2.5 4 6v10Zm3-9h10v5H7V7Zm1 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
                </svg>
              </span>
            </div>

            <h2>{t.loadingTitle}</h2>
            <p>{t.loadingSubtitle}</p>

            <div className="loading-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default BasicDetails;