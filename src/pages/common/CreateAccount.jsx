import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSignUp } from "@clerk/tanstack-react-start";
import "../../styles/CreateAccount.css";

const CreateAccount = () => {
  const navigate = useNavigate();
  const { signUp, fetchStatus } = useSignUp();

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isHindi, setIsHindi] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    terms: false,
  });

  const [error, setError] = useState("");

  const content = {
    en: {
      brandSubtitle: "Join the next generation of urban transit.",
      title: "Create Account",
      subtitle: "Get started with faster commutes.",
      nameLabel: "Full Name",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      pwdReqTitle: "Password must contain:",
      pwdReqLen: "At least 8 characters",
      pwdReqUpper: "1 uppercase letter",
      pwdReqLower: "1 lowercase letter",
      pwdReqNum: "1 number",
      pwdReqSpec: "1 special character",
      termsPre: "I agree to the ",
      termsLink1: "Terms & Conditions",
      termsAnd: " and ",
      termsLink2: "Privacy Policy",
      termsPost: ".",
      signUpBtn: "Sign Up",
      signingUpBtn: "Creating Account...",
      footerText: "Already have an account? ",
      footerLink: "Log In",
      emptyError: "Please fill in all the fields.",
      termsError: "Please agree to the Terms & Conditions.",
      pwdError: "Please ensure your password meets all requirements.",
      authError: "Unable to create your account.",
    },

    hi: {
      brandSubtitle: "शहरी पारगमन की अगली पीढ़ी में शामिल हों।",
      title: "खाता बनाएँ",
      subtitle: "तेज़ आवागमन के साथ शुरुआत करें।",
      nameLabel: "पूरा नाम",
      emailLabel: "ईमेल पता",
      passwordLabel: "पासवर्ड",
      pwdReqTitle: "पासवर्ड में होना चाहिए:",
      pwdReqLen: "कम से कम 8 अक्षर",
      pwdReqUpper: "1 बड़ा अक्षर (Uppercase)",
      pwdReqLower: "1 छोटा अक्षर (Lowercase)",
      pwdReqNum: "1 संख्या (Number)",
      pwdReqSpec: "1 विशेष वर्ण (Special Char)",
      termsPre: "मैं ",
      termsLink1: "नियम और शर्तों",
      termsAnd: " और ",
      termsLink2: "गोपनीयता नीति",
      termsPost: " से सहमत हूँ।",
      signUpBtn: "साइन अप करें",
      signingUpBtn: "खाता बनाया जा रहा है...",
      footerText: "क्या आपके पास पहले से खाता है? ",
      footerLink: "लॉग इन करें",
      emptyError: "कृपया सभी फ़ील्ड भरें।",
      termsError: "कृपया नियमों और शर्तों से सहमत हों।",
      pwdError:
        "कृपया सुनिश्चित करें कि आपका पासवर्ड सभी आवश्यकताओं को पूरा करता है।",
      authError: "खाता बनाने में समस्या हुई।",
    },
  };

  const t = isHindi ? content.hi : content.en;

  const isCreatingAccount = fetchStatus === "fetching";

  // Password validation
  const validations = {
    length: form.password.length >= 8,
    upper: /[A-Z]/.test(form.password),
    lower: /[a-z]/.test(form.password),
    number: /[0-9]/.test(form.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
  };

  const isPasswordValid = Object.values(validations).every(Boolean);

  const handleChange = (key) => (e) => {
    setForm({
      ...form,
      [key]:
        e.target.type === "checkbox"
          ? e.target.checked
          : e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Basic validation
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password
    ) {
      setError(t.emptyError);
      return;
    }

    // Password validation
    if (!isPasswordValid) {
      setError(t.pwdError);
      return;
    }

    // Terms validation
    if (!form.terms) {
      setError(t.termsError);
      return;
    }

    if (!signUp) {
      setError("Authentication is still loading. Please try again.");
      return;
    }

    try {
      /*
       * Create Clerk signup
       */
      const result = await signUp.password({
        emailAddress: form.email.trim(),
        password: form.password,
      });

      if (result?.error) {
        console.error("Clerk signup error:", result.error);

        setError(
          result.error.message || t.authError
        );

        return;
      }

      /*
       * Store the user's name locally for now.
       *
       * Later we will move this information into
       * Clerk publicMetadata / Supabase profile table.
       */
      localStorage.setItem(
        "signup_name",
        form.name.trim()
      );

      localStorage.setItem(
        "signup_email",
        form.email.trim()
      );

      /*
       * Ask Clerk to send the email verification code.
       */
      await signUp.verifications.sendEmailCode();

      /*
       * Move to the real OTP verification page.
       */
      navigate({
        to: "/basic-details",
      });

    } catch (error) {
      console.error("Create account error:", error);

      setError(
        error?.message || t.authError
      );
    }
  };

  const renderCriteriaIcon = (isMet) => {
    return isMet ? (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="criteria-icon met"
      >
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    ) : (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="criteria-icon unmet"
      >
        <circle cx="12" cy="12" r="4" />
      </svg>
    );
  };

  return (
    <div className="mobile-page-container">
      <div className="app-content create-layout">

        {/* Top Action Bar */}
        <div className="top-bar">
          <button
            type="button"
            className="btn-lang-pill"
            onClick={() => {
              setIsHindi(!isHindi);
              setError("");
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="icon-small"
            >
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>

            EN / HI
          </button>
        </div>

        {/* Main Content */}
        <div className="create-content-wrapper">

          {/* Brand Header */}
          <div className="brand-header">
            <h1 className="brand-title">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="icon-bus"
              >
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34-1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5 1.5 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z" />
              </svg>

              BussInn
            </h1>

            <p className="brand-subtitle">
              {t.brandSubtitle}
            </p>
          </div>

          {/* Form Card */}
          <div className="form-card">

            <div className="card-header-text">
              <h2 className="card-title">
                {t.title}
              </h2>

              <p className="card-subtitle">
                {t.subtitle}
              </p>
            </div>

            <form
              className="create-form"
              onSubmit={handleSubmit}
            >

              {/* Full Name */}
              <div className="input-floating-group">
                <input
                  type="text"
                  id="name"
                  className={`input-floating ${
                    error && !form.name
                      ? "input-error"
                      : ""
                  }`}
                  placeholder=" "
                  value={form.name}
                  onChange={handleChange("name")}
                  disabled={isCreatingAccount}
                />

                <label
                  htmlFor="name"
                  className="label-floating"
                >
                  {t.nameLabel}
                </label>
              </div>

              {/* Email */}
              <div className="input-floating-group">
                <input
                  type="email"
                  id="email"
                  className={`input-floating ${
                    error && !form.email
                      ? "input-error"
                      : ""
                  }`}
                  placeholder=" "
                  value={form.email}
                  onChange={handleChange("email")}
                  autoComplete="email"
                  disabled={isCreatingAccount}
                />

                <label
                  htmlFor="email"
                  className="label-floating"
                >
                  {t.emailLabel}
                </label>
              </div>

              {/* Password */}
              <div className="input-floating-group password-group">
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="password"
                  className={`input-floating ${
                    error && !isPasswordValid
                      ? "input-error"
                      : ""
                  }`}
                  placeholder=" "
                  value={form.password}
                  onChange={handleChange("password")}
                  autoComplete="new-password"
                  disabled={isCreatingAccount}
                />

                <label
                  htmlFor="password"
                  className="label-floating"
                >
                  {t.passwordLabel}
                </label>

                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                  disabled={isCreatingAccount}
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="icon-eye"
                    >
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5 9.27-7.5 11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="icon-eye"
                    >
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Criteria */}
              <div className="password-criteria-box">
                <p className="criteria-title">
                  {t.pwdReqTitle}
                </p>

                <div className="criteria-grid">
                  <div
                    className={`criteria-item ${
                      validations.length ? "met" : ""
                    }`}
                  >
                    {renderCriteriaIcon(
                      validations.length
                    )}
                    {t.pwdReqLen}
                  </div>

                  <div
                    className={`criteria-item ${
                      validations.upper ? "met" : ""
                    }`}
                  >
                    {renderCriteriaIcon(
                      validations.upper
                    )}
                    {t.pwdReqUpper}
                  </div>

                  <div
                    className={`criteria-item ${
                      validations.lower ? "met" : ""
                    }`}
                  >
                    {renderCriteriaIcon(
                      validations.lower
                    )}
                    {t.pwdReqLower}
                  </div>

                  <div
                    className={`criteria-item ${
                      validations.number ? "met" : ""
                    }`}
                  >
                    {renderCriteriaIcon(
                      validations.number
                    )}
                    {t.pwdReqNum}
                  </div>

                  <div
                    className={`criteria-item ${
                      validations.special ? "met" : ""
                    }`}
                  >
                    {renderCriteriaIcon(
                      validations.special
                    )}
                    {t.pwdReqSpec}
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="terms-container">
                <input
                  type="checkbox"
                  id="terms"
                  className="custom-checkbox"
                  checked={form.terms}
                  onChange={handleChange("terms")}
                  disabled={isCreatingAccount}
                />

                <label
                  htmlFor="terms"
                  className="terms-label"
                >
                  {t.termsPre}

                  <a
                    href="#"
                    className="terms-link"
                  >
                    {t.termsLink1}
                  </a>

                  {t.termsAnd}

                  <a
                    href="#"
                    className="terms-link"
                  >
                    {t.termsLink2}
                  </a>

                  {t.termsPost}
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="error-message-container">
                  <p className="error-text">
                    {error}
                  </p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="btn-primary"
                disabled={isCreatingAccount}
              >
                {isCreatingAccount
                  ? t.signingUpBtn
                  : t.signUpBtn}
              </button>
            </form>

            {/* Footer */}
            <div className="form-footer">
              <p className="footer-text">
                {t.footerText}

                <Link
                  to="/login"
                  className="footer-link"
                >
                  {t.footerLink}
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;