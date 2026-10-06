import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSignUp } from "@clerk/tanstack-react-start";
import "../../styles/VerifyOtp.css";

const BussInnBrand = () => (
  <div className="otp-brand" aria-label="BussInn">
    <svg
      className="otp-brand-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m21.5,8h-.5v-2c0-2.21-1.79-4-4-4H7c-2.21,0-4,1.79-4,4v2h-.5c-.28,0-.5.22-.5.5v3c0,.28.22.5.5.5h.5v6c0,.74.41,1.37,1,1.72v1.78c0,.28.22.5.5.5h2c.28,0,.5-.22.5-.5v-1.5h10v1.5c0,.28.22.5.5.5h2c.28,0,.5-.22.5-.5v-1.78c.59-.35,1-.98,1-1.72v-6h.5c.28,0,.5-.22.5-.5v-3c0-.28-.22-.5-.5-.5Zm-2.5 10v-6h-6v-5h6v-1 12s0 0 0 0Zm-13-2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5Zm9 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5ZM5 7h6v5H5V7Z" />
    </svg>
    <span className="otp-brand-name">BussInn</span>
  </div>
);

const VerifyOtp = () => {
  const navigate = useNavigate();
  const { signUp, fetchStatus } = useSignUp();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = useRef([]);
  const isLoading = fetchStatus === "fetching" || isVerifying;
  const email = localStorage.getItem("signup_email") || "";

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimer((current) => (current > 0 ? current - 1 : 0));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const updatedOtp = [...otp];

    updatedOtp[index] = digit;
    setOtp(updatedOtp);
    setError("");
    setSuccess("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const digits = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6)
      .split("");

    if (!digits.length) return;

    setOtp(
      Array.from({ length: 6 }, (_, index) => digits[index] || "")
    );

    setError("");
    setSuccess("");

    inputRefs.current[Math.min(digits.length, 6) - 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  const handleVerify = async () => {
    if (!isOtpComplete || !signUp || isLoading) return;

    setError("");
    setSuccess("");
    setIsVerifying(true);

    try {
      const result = await signUp.verifications.verifyEmailCode({
        code: otp.join("")
      });

      if (result?.error) {
        setError(result.error.message || "Invalid verification code.");
        setIsVerifying(false);
        return;
      }

      if (signUp.status !== "complete") {
        setError(
          "Verification is complete, but another account step is required."
        );
        setIsVerifying(false);
        return;
      }

      const finalized = await signUp.finalize();

      if (finalized?.error) {
        setError(
          finalized.error.message || "Unable to complete account creation."
        );
        setIsVerifying(false);
        return;
      }

      setSuccess("Email verified successfully.");

      await navigate({
        to: "/role-selection"
      });
    } catch (verificationError) {
      console.error("OTP verification error:", verificationError);

      setError(
        verificationError?.message || "Unable to verify the code."
      );
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !signUp || isLoading) return;

    setError("");
    setSuccess("");

    try {
      await signUp.verifications.sendEmailCode();

      setTimer(60);
      setOtp(["", "", "", "", "", ""]);
      setSuccess("A new verification code has been sent.");

      window.setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (resendError) {
      console.error("Resend verification error:", resendError);

      setError(
        resendError?.message || "Unable to resend the verification code."
      );
    }
  };

  const formattedTime = `00:${String(timer).padStart(2, "0")}`;

  return (
    <main className="otp-page">
      <section className="otp-app">
        <header className="otp-header">
          <button
            type="button"
            onClick={() => navigate({ to: "/create-account" })}
            className="otp-back-button"
            disabled={isLoading}
            aria-label="Back to create account"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <BussInnBrand />
          <span className="otp-header-spacer" aria-hidden="true" />
        </header>

        <section className="otp-card">
          <div className="otp-email-icon" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3.5 7 8.5 6 8.5-6" />
            </svg>
          </div>

          <div className="otp-heading">
            <span className="otp-kicker">EMAIL VERIFICATION</span>
            <h1>Enter verification code</h1>
            <p>
              We sent a six digit code
              {email ? (
                <>
                  {" "}to <strong>{email}</strong>.
                </>
              ) : (
                " to your email address."
              )}
            </p>
          </div>

          <div className="otp-inputs-row" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={`${index}-${digit}`}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                onChange={(event) => handleChange(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className={`otp-box ${digit ? "filled" : ""}`}
                aria-label={`Verification code digit ${index + 1}`}
                disabled={isLoading}
              />
            ))}
          </div>

          {error && (
            <div className="otp-message otp-error-message" role="alert">
              <span aria-hidden="true">!</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="otp-message otp-success-message" role="status">
              <span aria-hidden="true">✓</span>
              <p>{success}</p>
            </div>
          )}

          <button
            type="button"
            className="otp-verify-button"
            onClick={handleVerify}
            disabled={!isOtpComplete || isLoading}
          >
            <span>Verify code</span>
            <span aria-hidden="true">→</span>
          </button>

          <div className="otp-resend">
            {timer > 0 ? (
              <>
                <span>Resend code in</span>
                <strong>{formattedTime}</strong>
              </>
            ) : (
              <>
                <span>Didn’t receive a code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading}
                >
                  Resend now
                </button>
              </>
            )}
          </div>
        </section>
      </section>

      {isVerifying && (
        <div className="otp-loading-overlay" role="status" aria-live="polite">
          <div className="otp-loading-card">
            <BussInnBrand />

            <div className="otp-loading-route" aria-hidden="true">
              <span className="otp-loading-line" />
              <span className="otp-loading-stop otp-loading-start" />
              <span className="otp-loading-stop otp-loading-end" />

              <span className="otp-loading-bus">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4S4 2.5 4 6v10Zm3-9h10v5H7V7Zm1 11a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Z" />
                </svg>
              </span>
            </div>

            <h2>Verifying your email</h2>
            <p>Just a moment while we secure your BussInn account.</p>

            <div className="otp-loading-progress" aria-hidden="true">
              <span />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default VerifyOtp;