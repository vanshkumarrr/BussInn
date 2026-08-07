import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import "../../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isHindi, setIsHindi] = useState(false);
  
  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Translation Dictionary
  const content = {
    en: {
      subtitle: "Your city, connected.",
      welcomeTitle: "Welcome Back",
      welcomeSubtitle: "Sign in to continue",
      emailLabel: "Email Address",
      passwordLabel: "Password",
      rememberLabel: "Remember me",
      forgotLink: "Forgot?",
      signInBtn: "Sign In",
      createAccountBtn: "Create an Account",
      emptyError: "Please enter both email and password.",
      authError: "Invalid email or password."
    },
    hi: {
      subtitle: "आपका शहर, जुड़ा हुआ।",
      welcomeTitle: "वापसी पर स्वागत है",
      welcomeSubtitle: "जारी रखने के लिए साइन इन करें",
      emailLabel: "ईमेल पता",
      passwordLabel: "पासवर्ड",
      rememberLabel: "मुझे याद रखें",
      forgotLink: "भूल गए?",
      signInBtn: "साइन इन करें",
      createAccountBtn: "खाता बनाएँ",
      emptyError: "कृपया ईमेल और पासवर्ड दोनों दर्ज करें।",
      authError: "अमान्य ईमेल या पासवर्ड।"
    }
  };

  const t = isHindi ? content.hi : content.en;

const handleLogin = (e) => {
    e.preventDefault();
    
    // 1. Validation Check: If fields are empty, show error and stop
    if (!email.trim() || !password.trim()) {
      setErrorMessage(t.emptyError);
      return;
    }

    // 2. Clear any existing errors
    setErrorMessage("");
    
    // 3. Move directly to the Passenger Choice page! 
    navigate({ to: "/passenger-choice" });
  };

  // Clear error message when user starts typing again
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  return (
    <div className="mobile-page-container">
      <div className="app-content login-layout">
        
        {/* Top Action Bar (Language) */}
        <div className="login-top-bar">
          <button 
            className="btn-lang-pill"
            onClick={() => {
              setIsHindi(!isHindi);
              setErrorMessage(""); // Clear error on language switch to avoid translating old errors
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            EN / HI
          </button>
        </div>

        {/* Main Content Area */}
        <div className="login-content-wrapper">
          
          {/* Brand Header */}
          <div className="login-brand-header">
            <h1 className="login-brand-title">
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon-bus">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
              BussInn
            </h1>
            <p className="login-brand-subtitle">{t.subtitle}</p>
          </div>

          {/* Glassmorphism Login Card */}
          <div className="glass-panel login-card">
            <div className="card-header-text">
              <h2 className="card-title">{t.welcomeTitle}</h2>
              <p className="card-subtitle">{t.welcomeSubtitle}</p>
            </div>

            <form className="login-form" onSubmit={handleLogin}>
              
              {/* Email Input */}
              <div className="input-group">
                <input 
                  type="email" 
                  id="email" 
                  className={`custom-input ${errorMessage ? 'input-error' : ''}`} 
                  placeholder={t.emailLabel}
                  value={email}
                  onChange={handleInputChange(setEmail)}
                />
              </div>

              {/* Password Input */}
              <div className="input-group password-group">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  className={`custom-input ${errorMessage ? 'input-error' : ''}`} 
                  placeholder={t.passwordLabel}
                  value={password}
                  onChange={handleInputChange(setPassword)}
                />
                <button 
                  type="button" 
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="icon-eye">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="icon-eye">
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    </svg>
                  )}
                </button>
              </div>

              {/* Options Row */}
              <div className="form-options-row">
                <div className="checkbox-group">
                  <input type="checkbox" id="remember" className="custom-checkbox" />
                  <label htmlFor="remember" className="checkbox-label">{t.rememberLabel}</label>
                </div>
                <Link to="/forgot-password" className="link-forgot">{t.forgotLink}</Link>
              </div>

              {/* Error Message Display */}
              {errorMessage && (
                <div className="error-message-container">
                  <p className="error-text">{errorMessage}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="login-actions">
                <button type="submit" className="btn-primary">
                  {t.signInBtn}
                </button>
                <Link to="/create-account" className="btn-secondary">
                  {t.createAccountBtn}
                </Link>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;