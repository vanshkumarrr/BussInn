import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useSignUp } from "@clerk/tanstack-react-start";
import "../../styles/VerifyOtp.css";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const { signUp, fetchStatus } = useSignUp();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const [timer, setTimer] = useState(60);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isLoading = fetchStatus === "fetching";

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const newOtp = [...otp];
    newOtp[index] = digit;

    setOtp(newOtp);
    setError("");

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isOtpComplete = otp.every(
    (digit) => digit !== ""
  );

  /*
   * Verify the real Clerk email verification code
   */
  const handleVerify = async () => {
    if (!isOtpComplete || !signUp) return;

    setError("");
    setSuccess("");

    const code = otp.join("");

    try {
      const result =
        await signUp.verifications.verifyEmailCode({
          code,
        });

      if (result?.error) {
        console.error(
          "Clerk verification error:",
          result.error
        );

        setError(
          result.error.message ||
            "Invalid verification code."
        );

        return;
      }

      /*
       * If email verification is complete,
       * Clerk should now be ready to create the session.
       */
      if (signUp.status === "complete") {
        const finalizeResult =
          await signUp.finalize();

        if (finalizeResult?.error) {
          console.error(
            "Clerk finalize error:",
            finalizeResult.error
          );

          setError(
            finalizeResult.error.message ||
              "Unable to complete account creation."
          );

          return;
        }

        setSuccess(
          "Email verified successfully!"
        );

        /*
         * Account is now authenticated through Clerk.
         */
        navigate({
          to: "/role-selection",
        });

        return;
      }

      /*
       * If Clerk requires another step,
       * don't pretend the account is complete.
       */
      setError(
        "Verification completed, but another verification step is required."
      );
    } catch (error) {
      console.error(
        "OTP verification error:",
        error
      );

      setError(
        error?.message ||
          "Unable to verify the code."
      );
    }
  };

  /*
   * Resend verification code
   */
  const handleResend = async () => {
    if (timer > 0 || !signUp) return;

    setError("");
    setSuccess("");

    try {
      await signUp.verifications.sendEmailCode();

      setTimer(60);

      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      setSuccess(
        "A new verification code has been sent."
      );

      inputRefs.current[0]?.focus();
    } catch (error) {
      console.error(
        "Resend verification error:",
        error
      );

      setError(
        error?.message ||
          "Unable to resend the verification code."
      );
    }
  };

  const formattedTime = `00:${
    timer < 10 ? `0${timer}` : timer
  }`;

  return (
    <div className="mobile-page-container">
      <div className="app-content otp-layout">

        {/* Header */}
        <header className="otp-header">

          <button
            type="button"
            onClick={() =>
              navigate({
                to: "/create-account",
              })
            }
            className="btn-back"
            disabled={isLoading}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line
                x1="19"
                y1="12"
                x2="5"
                y2="12"
              />

              <polyline points="12 19 5 12 12 5" />
            </svg>
          </button>

          <h1 className="brand-title">
            BussInn
          </h1>

          <div className="header-placeholder" />
        </header>

        <div className="otp-content">

          {/* Email Icon */}
          <div className="icon-circle">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />

              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="otp-title">
            Verify OTP
          </h2>

          <p className="otp-subtitle">
            We've sent a 6-digit code to your E-Mail.
          </p>

          {/* OTP Inputs */}
          <div className="otp-inputs-row">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={
                  index === 0
                    ? "one-time-code"
                    : "off"
                }
                maxLength={1}
                value={digit}
                onChange={(e) =>
                  handleChange(
                    index,
                    e.target.value
                  )
                }
                onKeyDown={(e) =>
                  handleKeyDown(index, e)
                }
                className={`otp-box ${
                  digit ? "filled" : ""
                }`}
                aria-label={`OTP digit ${
                  index + 1
                }`}
                disabled={isLoading}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="error-message-container">
              <p className="error-text">
                {error}
              </p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="success-message-container">
              <p className="success-text">
                {success}
              </p>
            </div>
          )}

          {/* Verify */}
          <button
            type="button"
            className="btn-verify"
            onClick={handleVerify}
            disabled={
              !isOtpComplete || isLoading
            }
          >
            {isLoading
              ? "Verifying..."
              : "Verify"}
          </button>

          {/* Resend */}
          <div className="resend-container">
            <span className="resend-text">
              Resend Code
            </span>

            {timer > 0 ? (
              <span className="timer-text">
                {formattedTime}
              </span>
            ) : (
              <button
                type="button"
                className="btn-resend-active"
                onClick={handleResend}
                disabled={isLoading}
              >
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