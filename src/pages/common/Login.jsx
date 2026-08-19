import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  useSignIn,
  useAuth,
  useUser,
} from "@clerk/tanstack-react-start";
import { supabase } from "../../lib/supabase";
import "../../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();

  const { signIn, fetchStatus } = useSignIn();
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  const [showPassword, setShowPassword] = useState(false);
  const [isHindi, setIsHindi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionCleared, setSessionCleared] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const ADMIN_EMAIL = "flawless4keditx@gmail.com";

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
      authError: "Invalid email or password.",
      noUserError: "No registered user found.",
      loadingText: "Signing in...",
      clearingText: "Preparing sign in..."
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
      authError: "अमान्य ईमेल या पासवर्ड।",
      noUserError: "कोई पंजीकृत उपयोगकर्ता नहीं मिला।",
      loadingText: "साइन इन हो रहा है...",
      clearingText: "साइन इन तैयार किया जा रहा है..."
    }
  };

  const t = isHindi ? content.hi : content.en;

  /*
   * CLEAR OLD CLERK SESSION
   */
 useEffect(() => {
  if (!isLoaded) return;

  if (!isSignedIn) {
    setSessionCleared(true);
    return;
  }

  const clearSession = async () => {
    try {
      await signOut();
      // Force a clean reload so Clerk's client fully
      // resets instead of relying on in-memory state
      // that may not have propagated yet.
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
  /*
   * INPUT
   */
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);

    if (errorMessage) {
      setErrorMessage("");
    }
  };

  /*
   * =========================================================
   * GET USER ROLE FROM SUPABASE
   * =========================================================
   */
  const routeUserByRole = async (clerkUserId, loggedInEmail) => {
    console.log(
      "Looking up Supabase profile:",
      clerkUserId
    );

    /*
     * ADMIN
     */
    if (
      loggedInEmail.toLowerCase() === ADMIN_EMAIL
    ) {
      localStorage.setItem(
        "bussinn_role",
        "admin"
      );

      navigate({
        to: "/admin/overview",
        replace: true
      });

      return;
    }

    /*
     * Find existing profile
     */
    const { data: profile, error } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", clerkUserId)
        .maybeSingle();

    if (error) {
      console.error(
        "Supabase profile lookup error:",
        error
      );

      throw new Error(
        "Unable to load your profile."
      );
    }

    /*
     * No profile found
     */
    if (!profile) {
      console.log(
        "No Supabase profile found for:",
        clerkUserId
      );

      /*
       * This is an EXISTING Clerk user,
       * but there is no BussInn profile yet.
       *
       * Send them to basic details only in
       * this case.
       */
      localStorage.setItem(
        "bussinn_user_email",
        loggedInEmail
      );

      navigate({
        to: "/basic-details",
        replace: true
      });

      return;
    }

    console.log(
      "Supabase profile found:",
      profile
    );

    const role =
      profile.role?.toLowerCase();

    /*
     * Save common profile information locally
     */
    localStorage.setItem(
      "bussinn_user_email",
      profile.email ||
        loggedInEmail
    );

    localStorage.setItem(
      "bussinn_role",
      role || ""
    );

    if (profile.full_name) {
      localStorage.setItem(
        "passenger_name",
        profile.full_name
      );
    }

    if (profile.phone) {
      localStorage.setItem(
        "passenger_phone",
        profile.phone
      );
    }

    /*
     * =====================================================
     * PASSENGER
     * =====================================================
     */
    if (role === "passenger") {
      navigate({
        to: "/passenger/search",
        replace: true
      });

      return;
    }

    /*
     * =====================================================
     * DRIVER
     * =====================================================
     */
    if (role === "driver") {
      navigate({
        to: "/driver/profile",
        replace: true
      });

      return;
    }

    /*
     * =====================================================
     * ADMIN
     * =====================================================
     */
    if (role === "admin") {
      navigate({
        to: "/admin/overview",
        replace: true
      });

      return;
    }

    /*
     * UNKNOWN ROLE
     */
    throw new Error(
      "Your account role has not been configured."
    );
  };

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */
  const handleLogin = async (e) => {
    e.preventDefault();

    if (isLoading) return;

    setErrorMessage("");

    if (
      !email.trim() ||
      !password.trim()
    ) {
      setErrorMessage(
        t.emptyError
      );
      return;
    }

    if (!isLoaded || !signIn) {
      setErrorMessage(
        "Authentication is still loading. Please try again."
      );
      return;
    }

setIsLoading(true);

try {
  /*
   * SAFETY NET: force sign-out if Clerk still
   * thinks a session is active, regardless of
   * our local sessionCleared state.
   */
  if (isSignedIn) {
    try {
      await signOut();
    } catch (signOutErr) {
      console.error("Forced signOut failed:", signOutErr);
    }
  }

  /*
   * CLERK LOGIN
   */
  const { error } =
    await signIn.password({
      identifier:
        email.trim().toLowerCase(),
      password
    });

      if (error) {
        console.error(
          "Clerk sign-in error:",
          error
        );

        const message =
          error.message || "";

        const lower =
          message.toLowerCase();

        if (
          lower.includes("password") ||
          lower.includes("incorrect")
        ) {
          setErrorMessage(
            "Incorrect email or password."
          );
          return;
        }

        if (
          lower.includes("not found") ||
          lower.includes("does not exist")
        ) {
          setErrorMessage(
            t.noUserError
          );
          return;
        }

        setErrorMessage(
          message || t.authError
        );

        return;
      }

      /*
       * ADDITIONAL VERIFICATION
       */
      if (
        signIn.status ===
        "needs_second_factor"
      ) {
        setErrorMessage(
          "Additional verification is required for this account."
        );
        return;
      }

      if (
        signIn.status ===
        "needs_client_trust"
      ) {
        setErrorMessage(
          "This device needs additional verification."
        );
        return;
      }

      /*
       * LOGIN NOT COMPLETE
       */
      if (
        signIn.status !== "complete"
      ) {
        console.log(
          "Clerk sign-in status:",
          signIn.status
        );

        setErrorMessage(
          `Unable to complete sign in. Status: ${signIn.status}`
        );

        return;
      }

      /*
       * FINALIZE CLERK SESSION
       */
      const finalizeResult =
        await signIn.finalize();

      if (
        finalizeResult?.error
      ) {
        setErrorMessage(
          finalizeResult.error.message ||
            "Unable to complete sign in."
        );

        return;
      }

      /*
       * Wait for Clerk user to become available.
       *
       * The actual Clerk user ID is what we use
       * to find the existing Supabase profile.
       */
      const clerkUserId =
        user?.id;

      if (!clerkUserId) {
        /*
         * Small delay because Clerk session state
         * may need a moment after finalize().
         */
        setTimeout(() => {
          window.location.reload();
        }, 500);

        return;
      }

      /*
       * =====================================================
       * FIND EXISTING USER + ROLE
       * =====================================================
       */
      await routeUserByRole(
        clerkUserId,
        email.trim()
      );

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Unable to sign in. Please try again."
      );

    } finally {
      setIsLoading(false);
    }
  };

  /*
   * CLERK LOADING
   */
  if (!isLoaded) {
    return null;
  }

  /*
   * CLEARING OLD SESSION
   */
  if (
    isSignedIn &&
    !sessionCleared
  ) {
    return (
      <div className="mobile-page-container">
        <div className="app-content login-layout">
          <div className="login-content-wrapper">

            <div className="login-brand-header">
              <h1 className="login-brand-title">
                BussInn
              </h1>

              <p className="login-brand-subtitle">
                {t.subtitle}
              </p>
            </div>

            <div className="glass-panel login-card">

              <div className="card-header-text">
                <h2 className="card-title">
                  {t.clearingText}
                </h2>

                <p className="card-subtitle">
                  Please wait...
                </p>
              </div>

            </div>

          </div>
        </div>
      </div>
    );
  }

  /*
   * LOGIN PAGE
   */
  return (
    <div className="mobile-page-container">

      <div className="app-content login-layout">

        <div className="login-top-bar">

          <button
            type="button"
            className="btn-lang-pill"
            onClick={() => {
              setIsHindi(!isHindi);
              setErrorMessage("");
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

        <div className="login-content-wrapper">

          <div className="login-brand-header">

            <h1 className="login-brand-title">

              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="icon-bus"
              >
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10z" />
              </svg>

              BussInn

            </h1>

            <p className="login-brand-subtitle">
              {t.subtitle}
            </p>

          </div>

          <div className="glass-panel login-card">

            <div className="card-header-text">

              <h2 className="card-title">
                {t.welcomeTitle}
              </h2>

              <p className="card-subtitle">
                {t.welcomeSubtitle}
              </p>

            </div>

            <form
              className="login-form"
              onSubmit={handleLogin}
            >

              <div className="input-group">

                <input
                  type="email"
                  id="email"
                  className={`custom-input ${
                    errorMessage
                      ? "input-error"
                      : ""
                  }`}
                  placeholder={t.emailLabel}
                  value={email}
                  onChange={
                    handleInputChange(
                      setEmail
                    )
                  }
                  autoComplete="email"
                  disabled={isLoading}
                />

              </div>

              <div className="input-group password-group">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  id="password"
                  className={`custom-input ${
                    errorMessage
                      ? "input-error"
                      : ""
                  }`}
                  placeholder={t.passwordLabel}
                  value={password}
                  onChange={
                    handleInputChange(
                      setPassword
                    )
                  }
                  autoComplete="current-password"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={isLoading}
                >

                  {showPassword ? (

                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="icon-eye"
                    >
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5S17 4.5 12 4.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                    </svg>

                  ) : (

                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="icon-eye"
                    >
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.55 0-3.03.3-4.38.84l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46L1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65.67.33-1.41.53-2.2.53-.79 0-1.53-.2-2.2-.53z" />
                    </svg>

                  )}

                </button>

              </div>

              <div className="form-options-row">

                <div className="checkbox-group">

                  <input
                    type="checkbox"
                    id="remember"
                    className="custom-checkbox"
                  />

                  <label
                    htmlFor="remember"
                    className="checkbox-label"
                  >
                    {t.rememberLabel}
                  </label>

                </div>

                <Link
                  to="/forgot-password"
                  className="link-forgot"
                >
                  {t.forgotLink}
                </Link>

              </div>

              {errorMessage && (
                <div className="error-message-container">

                  <p className="error-text">
                    {errorMessage}
                  </p>

                </div>
              )}

              <div className="login-actions">

                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isLoading}
                >
                  {isLoading
                    ? t.loadingText
                    : t.signInBtn}
                </button>

                <Link
                  to="/create-account"
                  className="btn-secondary"
                >
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