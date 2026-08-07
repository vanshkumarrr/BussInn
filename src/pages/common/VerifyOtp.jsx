import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import "../../styles/VerifyOtp.css";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef([]);
  const [timer, setTimer] = useState(38); // Starting at 38s to match the image

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => (prevTimer > 0 ? prevTimer - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index, value) => {
    // Only allow numeric input
    const digit = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus the next input field if a digit was entered
    if (digit && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Auto-focus the previous input field on backspace if current field is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

const handleVerify = () => {
    if (!isOtpComplete) return;
    
    // TODO: Verify OTP with backend here
    
    // Move directly to the Role Selection page!
    navigate({ to: "/role-selection" });
  };
  const handleResend = () => {
    if (timer === 0) {
      // TODO: Trigger backend resend OTP logic here
      setTimer(60); // Reset timer to 60 seconds
    }
  };

  // Format timer as MM:SS
  const formattedTime = `00:${timer < 10 ? `0${timer}` : timer}`;

  return (
    <div className="mobile-page-container">
      <div className="app-content otp-layout">
        
        {/* Header with Back Button and Brand */}
        <header className="otp-header">
          <button onClick={() => navigate({ to: "/basic-details" })} className="btn-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 className="brand-title">BussInn</h1>
          <div className="header-placeholder"></div> {/* Balances the flexbox */}
        </header>

        <div className="otp-content">
          {/* Circular Icon */}
          <div className="icon-circle">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </div>

          {/* Text Details */}
          <h2 className="otp-title">Verify OTP</h2>
          <p className="otp-subtitle">
            We've sent a 4-digit code to your E-Mail.
          </p>

          {/* OTP Input Boxes */}
          <div className="otp-inputs-row">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`otp-box ${digit ? 'filled' : ''}`}
                aria-label={`OTP digit ${i + 1}`}
              />
            ))}
          </div>

          {/* Verify Button */}
          <button 
            type="button" 
            className="btn-verify" 
            onClick={handleVerify}
            disabled={!isOtpComplete}
          >
            Verify
          </button>

          {/* Resend Code Timer */}
          <div className="resend-container">
            <span className="resend-text">Resend Code</span>
            {timer > 0 ? (
              <span className="timer-text">{formattedTime}</span>
            ) : (
              <button className="btn-resend-active" onClick={handleResend}>
                Now
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyOtp;