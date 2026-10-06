import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSignUp } from "@clerk/tanstack-react-start";
import "../../styles/CreateAccount.css";

const BussInnBrand = () => (
  <div className="create-logo-pill" aria-label="BussInn">
    <svg
      className="create-logo-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m21.5,8h-.5v-2c0-2.21-1.79-4-4-4H7c-2.21,0-4,1.79-4,4v2h-.5c-.28,0-.5.22-.5.5v3c0,.28.22.5.5.5h.5v6c0 .74.41 1.37 1 1.72v1.78c0 .28.22.5.5.5h2c.28 0 .5-.22.5-.5v-1.5h10v1.5c0 .28.22.5.5.5h2c.28 0 .5-.22.5-.5v-1.78c.59-.35 1-.98 1-1.72v-6h.5c.28 0 .5-.22.5-.5v-3c0-.28-.22-.5-.5-.5Zm-2.5 10v-6h-6v-5h6v-1 12s0 0 0 0Zm-13-2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5Zm9 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5ZM5 7h6v5H5V7Z" />
    </svg>
    <span className="create-logo-title">BussInn</span>
  </div>
);

const CreateAccount = () => {
  const navigate = useNavigate();
  const { signUp, fetchStatus } = useSignUp();

  const [showPassword, setShowPassword] = useState(false);
  const [isHindi, setIsHindi] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    terms: false
  });
  const [error, setError] = useState("");

  const content = {
    en: {
      title: "Create your account",
      subtitle: "Get started with easier local journeys.",
      nameLabel: "Full name",
      emailLabel: "Email address",
      passwordLabel: "Password",
      namePlaceholder: "Enter your full name",
      emailPlaceholder: "name@example.com",
      passwordPlaceholder: "Create a password",
      pwdReqTitle: "Password requirements",
      pwdReqLen: "At least 16 characters",
      pwdReqUpper: "One uppercase letter",
      pwdReqLower: "One lowercase letter",
      pwdReqNum: "One number",
      pwdReqSpec: "One special character",
      termsPre: "I agree to the ",
      termsLink1: "Terms & Conditions",
      termsAnd: " and ",
      termsLink2: "Privacy Policy",
      termsPost: ".",
      signUpBtn: "Create account",
      signingUpBtn: "Creating account...",
      footerText: "Already have an account?",
      footerLink: "Log in",
      emptyError: "Please fill in all the fields.",
      termsError: "Please agree to the Terms & Conditions.",
      pwdError: "Please ensure your password meets all requirements.",
      authError: "Unable to create your account."
    },
    hi: {
      title: "अपना खाता बनाएँ",
      subtitle: "आसान स्थानीय सफ़र के साथ शुरुआत करें।",
      nameLabel: "पूरा नाम",
      emailLabel: "ईमेल पता",
      passwordLabel: "पासवर्ड",
      namePlaceholder: "अपना पूरा नाम दर्ज करें",
      emailPlaceholder: "name@example.com",
      passwordPlaceholder: "पासवर्ड बनाएँ",
      pwdReqTitle: "पासवर्ड की आवश्यकताएँ",
      pwdReqLen: "कम से कम 16 अक्षर",
      pwdReqUpper: "एक बड़ा अक्षर",
      pwdReqLower: "एक छोटा अक्षर",
      pwdReqNum: "एक संख्या",
      pwdReqSpec: "एक विशेष वर्ण",
      termsPre: "मैं ",
      termsLink1: "नियम और शर्तों",
      termsAnd: " और ",
      termsLink2: "गोपनीयता नीति",
      termsPost: " से सहमत हूँ।",
      signUpBtn: "खाता बनाएँ",
      signingUpBtn: "खाता बनाया जा रहा है...",
      footerText: "पहले से खाता है?",
      footerLink: "लॉग इन करें",
      emptyError: "कृपया सभी फ़ील्ड भरें।",
      termsError: "कृपया नियमों और शर्तों से सहमत हों।",
      pwdError: "कृपया पासवर्ड की सभी आवश्यकताएँ पूरी करें।",
      authError: "खाता बनाने में समस्या हुई।"
    }
  };

  const t = isHindi ? content.hi : content.en;
  const isCreatingAccount = fetchStatus === "fetching";

  const validations = {
    length: form.password.length >= 16,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password)
  };

  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleChange = (key) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setForm((current) => ({
      ...current,
      [key]: value
    }));

    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError(t.emptyError);
      return;
    }

    if (!isPasswordValid) {
      setError(t.pwdError);
      return;
    }

    if (!form.terms) {
      setError(t.termsError);
      return;
    }

    if (!signUp) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    try {
      const result = await signUp.password({
        emailAddress: form.email.trim(),
        password: form.password
      });

      if (result?.error) {
        console.error("Clerk signup error:", result.error);
        setError(result.error.message || t.authError);
        return;
      }

      localStorage.setItem("signup_name", form.name.trim());
      localStorage.setItem("signup_email", form.email.trim());

      await signUp.verifications.sendEmailCode();
      navigate({ to: "/basic-details" });
    } catch (submitError) {
      console.error("Create account error:", submitError);
      setError(submitError?.message || t.authError);
    }
  };

  const criteria = [
    ["length", t.pwdReqLen],
    ["upper", t.pwdReqUpper],
    ["lower", t.pwdReqLower],
    ["number", t.pwdReqNum],
    ["special", t.pwdReqSpec]
  ];

  const renderCriteriaIcon = (isMet) =>
    isMet ? (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="create-criteria-icon"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ) : (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="create-criteria-icon"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
      </svg>
    );

  return (
    <main className="create-page">
      <section className="create-app">
        <div className="create-top-bar">
          <button
            type="button"
            className="create-lang-button"
            onClick={() => {
              setIsHindi((current) => !current);
              setError("");
            }}
            aria-label={
              isHindi ? "Switch language to English" : "भाषा हिंदी में बदलें"
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="create-language-icon"
              aria-hidden="true"
            >
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            <span>{isHindi ? "HI / EN" : "EN / HI"}</span>
          </button>
        </div>

        <header className="create-header">
          <BussInnBrand />
        </header>

        <div className="create-card-wrap">
          <section className="create-card">
            <div className="create-card-heading">
              <span className="create-card-kicker">JOIN BUSSINN</span>
              <h1 className="create-card-title">{t.title}</h1>
              <p className="create-card-subtitle">{t.subtitle}</p>
            </div>

            <form className="create-form" onSubmit={handleSubmit}>
              <div className="create-field">
                <label htmlFor="create-name">{t.nameLabel}</label>
                <input
                  id="create-name"
                  type="text"
                  className={error && !form.name.trim() ? "has-error" : ""}
                  placeholder={t.namePlaceholder}
                  value={form.name}
                  onChange={handleChange("name")}
                  autoComplete="name"
                  disabled={isCreatingAccount}
                  required
                />
              </div>

              <div className="create-field">
                <label htmlFor="create-email">{t.emailLabel}</label>
                <input
                  id="create-email"
                  type="email"
                  className={error && !form.email.trim() ? "has-error" : ""}
                  placeholder={t.emailPlaceholder}
                  value={form.email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                  disabled={isCreatingAccount}
                  required
                />
              </div>

              <div className="create-field">
                <label htmlFor="create-password">{t.passwordLabel}</label>
                <div className="create-password-wrap">
                  <input
                    id="create-password"
                    type={showPassword ? "text" : "password"}
                    className={error && !isPasswordValid ? "has-error" : ""}
                    placeholder={t.passwordPlaceholder}
                    value={form.password}
                    onChange={handleChange("password")}
                    autoComplete="new-password"
                    disabled={isCreatingAccount}
                    required
                  />
                  <button
                    type="button"
                    className="create-password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    disabled={isCreatingAccount}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="2.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M3 3l18 18M10.6 6.2A10 10 0 0 1 12 6c6.1 0 9.5 6 9.5 6a15 15 0 0 1-3.1 3.6M6.2 6.8C3.8 8.3 2.5 12 2.5 12s3.4 6 9.5 6c1.1 0 2.1-.2 3-.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="create-password-rules">
                <p className="create-rules-title">{t.pwdReqTitle}</p>
                <div className="create-rules-grid">
                  {criteria.map(([key, label]) => (
                    <div
                      className={`create-rule ${validations[key] ? "is-met" : ""}`}
                      key={key}
                    >
                      {renderCriteriaIcon(validations[key])}
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <label className="create-terms">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={handleChange("terms")}
                  disabled={isCreatingAccount}
                />
                <span>
                  {t.termsPre}
                  <a href="#terms">{t.termsLink1}</a>
                  {t.termsAnd}
                  <a href="#privacy">{t.termsLink2}</a>
                  {t.termsPost}
                </span>
              </label>

              {error && (
                <div className="create-error" role="alert">
                  <span className="create-error-mark" aria-hidden="true">!</span>
                  <p>{error}</p>
                </div>
              )}

              <button
                type="submit"
                className="create-submit"
                disabled={isCreatingAccount}
              >
                {isCreatingAccount ? t.signingUpBtn : t.signUpBtn}
                {!isCreatingAccount && <span aria-hidden="true">→</span>}
              </button>
            </form>

            <p className="create-login-prompt">
              {t.footerText}
              <Link to="/login">{t.footerLink}</Link>
            </p>
          </section>
        </div>
      </section>
    </main>
  );
};

export default CreateAccount;