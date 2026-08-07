import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { signIn } from "../../lib/store";
import "../../styles/Login.css";

// Sign in page. Local-storage auth for now.
// TODO: replace signIn() with a real backend call.
const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }
    const session = signIn(email, password);
    navigate({
      to: session.role === "admin" ? "/admin/overview" : "/passenger/dashboard",
    });
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Sign in</h1>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="field-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className="field"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error ? <p className="field-error">{error}</p> : null}
          <button type="submit" className="content">
            Sign in
          </button>
        </form>
        <div className="link-row">
          <Link to="/forgot-password" className="text-link">
            Forgot password?
          </Link>
          <Link to="/create-account" className="text-link">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
