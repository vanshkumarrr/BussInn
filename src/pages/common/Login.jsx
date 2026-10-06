import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useSignIn, useAuth, useUser } from "@clerk/tanstack-react-start";
import { supabase } from "../../lib/supabase";
import "../../styles/Login.css";

const BussInnBrand = () => (
  <div className="login-brand-pill" aria-label="BussInn">
    <svg
      className="login-brand-icon"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m21.5,8h-.5v-2c0-2.21-1.79-4-4-4H7c-2.21,0-4,1.79-4,4v2h-.5c-.28,0-.5.22-.5.5v3c0,.28.22.5.5.5h.5v6c0,.74.41,1.37,1,1.72v1.78c0,.28.22.5.5.5h2c.28,0,.5-.22.5-.5v-1.5h10v1.5c0,.28.22.5.5.5h2c.28,0,.5-.22.5-.5v-1.78c.59-.35,1-.98,1-1.72v-6h.5c.28,0,.5-.22.5-.5v-3c0-.28-.22-.5-.5-.5Zm-2.5,10v-6h-6v-5h6v-1,12s0,0,0,0Zm-13-2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5Zm9 0c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5ZM5 7h6v5H5V7Z" />
    </svg>
    <span className="login-brand-title">BussInn</span>
  </div>
);

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useSignIn();
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [isHindi, setIsHindi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCleared, setSessionCleared] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const content = {
    en: {
      welcomeTitle: "Welcome back",
      welcomeSubtitle: "Sign in to pick up where you left off",
      emailLabel: "Email address",
      passwordLabel: "Password",
      rememberLabel: "Remember me",
      forgotLink: "Forgot password?",
      signInBtn: "Sign in",
      createAccountBtn: "Create an account",
      emptyError: "Please enter both email and password.",
      authError: "Invalid email or password.",
      noUserError: "No registered user found.",
      loadingText: "Signing in...",
      clearingText: "Preparing sign in...",
      secureNote: "A clearer way to get where you're going."
    },
    hi: {
      welcomeTitle: "वापसी पर स्वागत है",
      welcomeSubtitle: "जारी रखने के लिए साइन इन करें",
      emailLabel: "ईमेल पता",
      passwordLabel: "पासवर्ड",
      rememberLabel: "मुझे याद रखें",
      forgotLink: "पासवर्ड भूल गए?",
      signInBtn: "साइन इन करें",
      createAccountBtn: "खाता बनाएँ",
      emptyError: "कृपया ईमेल और पासवर्ड दोनों दर्ज करें।",
      authError: "अमान्य ईमेल या पासवर्ड।",
      noUserError: "कोई पंजीकृत उपयोगकर्ता नहीं मिला।",
      loadingText: "साइन इन हो रहा है...",
      clearingText: "साइन इन तैयार किया जा रहा है...",
      secureNote: "आपका सफ़र अब और आसान।"
    }
  };

  const t = isHindi ? content.hi : content.en;

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setSessionCleared(true);
      return;
    }

    const clearSession = async () => {
      try {
        await signOut();
        window.location.reload();
      } catch (error) {
        console.error("Failed to clear old Clerk session:", error);
        setErrorMessage(
          "Unable to clear the previous session. Please refresh the page."
        );
      }
    };

    clearSession();
  }, [isLoaded, isSignedIn, signOut]);

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const routeUserByRole = async (clerkUserId, loggedInEmail) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", clerkUserId)
      .maybeSingle();

    if (error) {
      console.error("Supabase profile lookup error:", error);
      throw new Error("Unable to load your profile.");
    }

    if (!profile) {
      localStorage.setItem("bussinn_user_email", loggedInEmail);
      navigate({ to: "/basic-details", replace: true });
      return;
    }

    const role = profile.role?.toLowerCase();

    localStorage.setItem(
      "bussinn_user_email",
      profile.email || loggedInEmail
    );
    localStorage.setItem("bussinn_role", role || "");

    if (profile.full_name) {
      localStorage.setItem("passenger_name", profile.full_name);
    }

    if (profile.phone) {
      localStorage.setItem("passenger_phone", profile.phone);
    }

    if (role === "passenger") {
      navigate({ to: "/passenger/search", replace: true });
      return;
    }

    if (role === "driver") {
      navigate({ to: "/driver/profile", replace: true });
      return;
    }

    if (role === "admin") {
      navigate({ to: "/admin/overview", replace: true });
      return;
    }

    throw new Error("Your account role has not been configured.");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (isLoading) return;

    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage(t.emptyError);
      return;
    }

    if (!isLoaded || !signIn) {
      setErrorMessage("Authentication is still loading. Please try again.");
      return;
    }

    setIsLoading(true);

    try {
      if (isSignedIn) {
        try {
          await signOut();
        } catch (signOutError) {
          console.error("Forced sign out failed:", signOutError);
        }
      }

      const { error } = await signIn.password({
        identifier: email.trim().toLowerCase(),
        password
      });

      if (error) {
        console.error("Clerk sign-in error:", error);

        const message = error.message || "";
        const lowerMessage = message.toLowerCase();

        if (
          lowerMessage.includes("password") ||
          lowerMessage.includes("incorrect")
        ) {
          setErrorMessage("Incorrect email or password.");
          return;
        }

        if (
          lowerMessage.includes("not found") ||
          lowerMessage.includes("does not exist")
        ) {
          setErrorMessage(t.noUserError);
          return;
        }

        setErrorMessage(message || t.authError);
        return;
      }

      if (signIn.status === "needs_second_factor") {
        setErrorMessage("Additional verification is required for this account.");
        return;
      }

      if (signIn.status === "needs_client_trust") {
        setErrorMessage("This device needs additional verification.");
        return;
      }

      if (signIn.status !== "complete") {
        setErrorMessage(
          `Unable to complete sign in. Status: ${signIn.status}`
        );
        return;
      }

      const finalizeResult = await signIn.finalize();

      if (finalizeResult?.error) {
        setErrorMessage(
          finalizeResult.error.message || "Unable to complete sign in."
        );
        return;
      }

      const clerkUserId = user?.id;

      if (!clerkUserId) {
        window.setTimeout(() => window.location.reload(), 500);
        return;
      }

      await routeUserByRole(clerkUserId, email.trim());
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(error?.message || "Unable to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <main className="mobile-page-container">
      <section className="app-content login-layout">
        <div className="login-top-bar">
          <button
            type="button"
            className="btn-lang-pill"
            onClick={() => {
              setIsHindi((current) => !current);
              setErrorMessage("");
            }}
            aria-label={
              isHindi ? "Switch language to English" : "भाषा हिंदी में बदलें"
            }
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="language-icon"
              aria-hidden="true"
            >
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            <span>{isHindi ? "HI / EN" : "EN / HI"}</span>
          </button>
        </div>

        <header className="login-header">
          <BussInnBrand />
        </header>

        <div className="login-card-wrap">
          {isSignedIn && !sessionCleared ? (
            <section className="login-card login-loading-card">
              <span className="login-loading-spinner" aria-hidden="true" />
              <h1 className="card-title">{t.clearingText}</h1>
              <p className="card-subtitle">Please wait...</p>
            </section>
          ) : (
            <section className="login-card">
              <div className="card-heading">
                <span className="card-kicker">YOUR BUSSINN ACCOUNT</span>
                <h1 className="card-title">{t.welcomeTitle}</h1>
                <p className="card-subtitle">{t.welcomeSubtitle}</p>
              </div>

              <form className="login-form" onSubmit={handleLogin}>
                <div className="input-group">
                  <label className="input-label" htmlFor="email">
                    {t.emailLabel}
                  </label>
                  <div className="input-shell">
                    <svg
                      className="input-leading-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 6.5h16v11H4z"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinejoin="round"
                      />
                      <path
                        d="m5 7.5 7 5.5 7-5.5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <input
                      type="email"
                      id="email"
                      className={`custom-input ${errorMessage ? "input-error" : ""}`}
                      placeholder="name@example.com"
                      value={email}
                      onChange={handleInputChange(setEmail)}
                      autoComplete="email"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label" htmlFor="password">
                    {t.passwordLabel}
                  </label>
                  <div className="input-shell">
                    <svg
                      className="input-leading-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="5"
                        y="10"
                        width="14"
                        height="10"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      <path
                        d="M8 10V7a4 4 0 0 1 8 0v3"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                      />
                    </svg>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className={`custom-input password-input ${errorMessage ? "input-error" : ""}`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={handleInputChange(setPassword)}
                      autoComplete="current-password"
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      className="btn-toggle-password"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      disabled={isLoading}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="icon-eye"
                        >
                          <path
                            d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinejoin="round"
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
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          className="icon-eye"
                        >
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

                <div className="form-options-row">
                  <label className="checkbox-group" htmlFor="remember">
                    <input
                      type="checkbox"
                      id="remember"
                      className="custom-checkbox"
                    />
                    <span className="checkbox-label">{t.rememberLabel}</span>
                  </label>

                  <Link to="/forgot-password" className="link-forgot">
                    {t.forgotLink}
                  </Link>
                </div>

                {errorMessage && (
                  <div className="error-message-container" role="alert">
                    <span className="error-symbol" aria-hidden="true">!</span>
                    <p className="error-text">{errorMessage}</p>
                  </div>
                )}

                <div className="login-actions">
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                  >
                    <span>{isLoading ? t.loadingText : t.signInBtn}</span>
                    {!isLoading && (
                      <span className="button-arrow" aria-hidden="true">→</span>
                    )}
                  </button>

                  <Link to="/create-account" className="btn-secondary">
                    {t.createAccountBtn}
                  </Link>
                </div>
              </form>

              <p className="login-secure-note">
                <span className="secure-note-icon" aria-hidden="true">✓</span>
                {t.secureNote}
              </p>
            </section>
          )}
        </div>
      </section>
    </main>
  );
};

export default Login;