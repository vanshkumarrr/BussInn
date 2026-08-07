import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import "../../styles/ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setError("");
    // TODO: Trigger actual backend password reset email here
    setSent(true);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  return (
    <div className="mobile-page-container">
      <div className="app-content forgot-layout">
        
        {/* Header */}
        <header className="forgot-header">
          <button onClick={() => navigate({ to: "/login" })} className="btn-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 className="brand-title">BussInn</h1>
          <div className="header-placeholder"></div>
        </header>

        <div className="forgot-content">
          {sent ? (
            /* Success State */
            <div className="state-container">
              <div className="icon-circle success-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h2 className="forgot-title">Check your email</h2>
              <p className="forgot-subtitle">
                If an account exists for <strong className="highlight-text">{email}</strong>, a password reset link has been sent.
              </p>
              
              <div className="forgot-actions mt-8">
                <Link to="/login" className="btn-primary">
                  Back to Login
                </Link>
                <button onClick={() => setSent(false)} className="btn-ghost">
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            /* Input Form State */
            <div className="state-container">
              <div className="icon-circle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h2 className="forgot-title">Forgot Password</h2>
              <p className="forgot-subtitle">
                Enter the email linked to your BussInn account and we'll send you a secure reset link.
              </p>

              <form className="forgot-form" onSubmit={handleSubmit}>
                
                {/* Email Input */}
                <div className="input-floating-group">
                  <input 
                    type="email" 
                    id="email" 
                    className={`input-floating ${error ? 'input-error' : ''}`} 
                    placeholder=" " 
                    value={email}
                    onChange={handleEmailChange}
                  />
                  <label htmlFor="email" className="label-floating">Email Address</label>
                </div>

                {/* Error Message Display */}
                {error && (
                  <div className="error-message-container">
                    <p className="error-text">{error}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="forgot-actions">
                  <button type="submit" className="btn-primary">
                    Send Reset Link
                  </button>
                </div>
              </form>

              <div className="login-footer">
                <p>
                  Remember your password? <Link to="/login" className="login-link">Log in here</Link>
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ForgotPassword;