import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useClerk } from "@clerk/tanstack-react-start";

import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/PassengerProfile.css";

const PassengerProfile = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const [passenger, setPassenger] = useState({
    name: "Vansh Kumar",
    email: "vansh.kumar@example.com",
    phone: "+91 98765 43210",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    coins: 0,
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const savedAvatar = localStorage.getItem(
      "passenger_profile_avatar"
    );

    const savedName =
      localStorage.getItem("passenger_name") ||
      localStorage.getItem("bussinn_signup_name");

    const savedPhone =
      localStorage.getItem("passenger_phone") ||
      localStorage.getItem("signupPhone");

    const savedCoins =
      localStorage.getItem("passenger_coins");

    setPassenger((prev) => ({
      ...prev,
      name: savedName || prev.name,
      phone: savedPhone
        ? `+91 ${savedPhone}`
        : prev.phone,
      coins:
        savedCoins !== null
          ? parseInt(savedCoins, 10)
          : 0,
      avatar: savedAvatar || prev.avatar,
    }));
  }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64Image = reader.result;

      setPassenger((prev) => ({
        ...prev,
        avatar: base64Image,
      }));

      localStorage.setItem(
        "passenger_profile_avatar",
        base64Image
      );
    };

    reader.readAsDataURL(file);
  };

  // REAL CLERK LOGOUT
  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await signOut();

      // Remove old local auth data.
      localStorage.removeItem("passenger_token");

      // Navigate only AFTER Clerk has signed out.
      navigate({
        to: "/login",
        replace: true,
      });
    } catch (error) {
      console.error("Clerk logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="passenger-choice-page">
      <div className="app-content">

        <header className="dash-header">
          <h1 className="dash-logo">BussInn</h1>
        </header>

        <div className="profile-hero-section">

          <div
            className="avatar-container"
            onClick={() =>
              fileInputRef.current?.click()
            }
            title="Change Profile Picture"
          >
            <img
              src={passenger.avatar}
              alt={passenger.name}
              className="profile-avatar-img"
            />

            <div className="avatar-edit-badge">
              <span className="material-symbols-outlined text-xs">
                edit
              </span>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          <h2 className="profile-name">
            {passenger.name}
          </h2>

          <p className="profile-meta">
            {passenger.email} • {passenger.phone}
          </p>

          <div className="coins-pill-badge">
            <span className="material-symbols-outlined text-amber-500 text-base">
              toll
            </span>

            <span>
              {passenger.coins.toLocaleString()} BS Coins
            </span>
          </div>
        </div>

        <main className="profile-menu-container">

          <div className="menu-links-list">

            <Link
              to="/refer-earn"
              className="menu-item-row"
            >
              <div className="menu-icon-box">
                <span className="material-symbols-outlined">
                  group_add
                </span>
              </div>

              <span className="menu-item-text">
                Refer & Earn
              </span>

              <span className="material-symbols-outlined menu-arrow">
                chevron_right
              </span>
            </Link>

            <Link
              to="/about-us"
              className="menu-item-row"
            >
              <div className="menu-icon-box">
                <span className="material-symbols-outlined">
                  info
                </span>
              </div>

              <span className="menu-item-text">
                About Us
              </span>

              <span className="material-symbols-outlined menu-arrow">
                chevron_right
              </span>
            </Link>

            <Link
              to="/help"
              className="menu-item-row"
            >
              <div className="menu-icon-box">
                <span className="material-symbols-outlined">
                  help
                </span>
              </div>

              <span className="menu-item-text">
                Help & Support
              </span>

              <span className="material-symbols-outlined menu-arrow">
                chevron_right
              </span>
            </Link>

            <Link
              to="/feedback"
              search={{ from: "passenger" }}
              className="menu-item-row"
            >
              <div className="menu-icon-box">
                <span className="material-symbols-outlined">
                  chat_bubble
                </span>
              </div>

              <span className="menu-item-text">
                Feedback
              </span>

              <span className="material-symbols-outlined menu-arrow">
                chevron_right
              </span>
            </Link>

          </div>

          {/* Clerk Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="logout-btn-row"
            disabled={isLoggingOut}
          >
            <span className="material-symbols-outlined text-red-600">
              logout
            </span>

            <span>
              {isLoggingOut
                ? "Logging out..."
                : "Logout"}
            </span>
          </button>

        </main>

        <PassengerBottomNav />

      </div>
    </div>
  );
};

export default PassengerProfile;