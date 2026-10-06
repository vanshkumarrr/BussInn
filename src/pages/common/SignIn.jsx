import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useSignIn } from "@clerk/tanstack-react-start";
import "../../styles/Login.css";

const SignIn = () => {
  const navigate = useNavigate();
  const { signIn, isLoaded, setActive } = useSignIn();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      // Attempt to sign in with Clerk
      const result = await signIn.create({
        identifier: email.trim(),
        password,
      });

      // Strictly check if the sign-in session is fully complete
      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });

        // Special Admin Override requested
        if (email.trim().toLowerCase() === "flawless4keditx@gmail.com") {
          navigate({ to: "/admin/overview" });
          return;
        }

        // Check user role from session metadata or default to passenger dashboard
        const role = result.createdSessionId?.publicMetadata?.role || "passenger";
        navigate({
          to: role === "driver" ? "/driver/dashboard" : "/passenger/dashboard",
        });
      } else {
        // If Clerk requires extra steps (e.g. MFA or unverified email), block random logins
        console.warn("Sign-in incomplete status:", result.status);
        setError("Invalid email or password. No registered user found.");
      }
    } catch (err) {
      console.error("Sign in error:", err);
      // Catch specific Clerk error codes for non-existent users or incorrect credentials
      const errorCode = err?.errors?.[0]?.code;
      if (
        errorCode === "form_identifier_not_found" ||
        errorCode === "form_password_incorrect" ||
        errorCode === "strategy_for_user_invalid"
      ) {
        setError("No registered user found or incorrect password. Please check your details or create an account.");
      } else {
        setError(err?.errors?.[0]?.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="brand-header-login" style={{ textAlign: "center", marginBottom: "20px" }}>
          <h1 className="header" style={{ fontSize: "28px", color: "#0055ff" }}>🚌 BussInn</h1>
          <p style={{ color: "#666", fontSize: "14px" }}>Your city, connected.</p>
        </div>

        <div className="form-card" style={{ width: "100%" }}>
          <h2 style={{ textAlign: "center", fontSize: "22px", marginBottom: "5px" }}>Welcome Back</h2>
          <p style={{ textAlign: "center", color: "#666", fontSize: "13px", marginBottom: "20px" }}>Sign in to continue</p>

          <form onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="field"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />

            <label className="field-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{ width: "100%", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {error ? <p className="field-error" style={{ color: "#ff3333", fontSize: "13px", marginTop: "8px" }}>{error}</p> : null}

            <button type="submit" className="content" disabled={isLoading} style={{ width: "100%", marginTop: "15px" }}>
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="link-row" style={{ display: "flex", justifyContent: "space-between", marginTop: "15px", fontSize: "13px" }}>
            <Link to="/forgot-password" className="text-link">
              Forgot?
            </Link>
          </div>

          <div style={{ marginTop: "20px", textAlign: "center" }}>
            <Link to="/create-account" className="content" style={{ display: "block", textAlign: "center", textDecoration: "none", background: "#f0f2f5", color: "#000", border: "1px solid #ccc", padding: "10px", borderRadius: "6px" }}>
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;