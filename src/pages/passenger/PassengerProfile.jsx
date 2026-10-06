import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useClerk } from "@clerk/tanstack-react-start";
import { BusFront, Coins } from "lucide-react";

import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/PassengerProfile.css";

const PassengerProfile = () => {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  // Initialize with empty/generic states so no hardcoded data flashes
  const [passenger, setPassenger] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    coins: 0,
  });

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Dynamically fetch all user data from localStorage
    const savedAvatar = localStorage.getItem("passenger_profile_avatar");

    const savedName =
      localStorage.getItem("passenger_name") ||
      localStorage.getItem("bussinn_signup_name") ||
      "Passenger";

    const savedPhone =
      localStorage.getItem("passenger_phone") ||
      localStorage.getItem("signupPhone") ||
      "";

    const savedEmail = 
      localStorage.getItem("passenger_email") ||
      localStorage.getItem("signupEmail") ||
      localStorage.getItem("bussinn_signup_email") ||
      "";

    const savedCoins = localStorage.getItem("passenger_coins");

    setPassenger((prev) => ({
      ...prev,
      name: savedName,
      email: savedEmail,
      phone: savedPhone ? `+91 ${savedPhone}` : "",
      coins: savedCoins !== null ? parseInt(savedCoins, 10) : 0,
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
      localStorage.setItem("passenger_profile_avatar", base64Image);
    };

    reader.readAsDataURL(file);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await signOut();
      localStorage.removeItem("passenger_token");
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

        {/* Combined Blue Header (Matches Rewards Page) */}
        <header className="profile-blue-header">
          
          <div className="dash-top-bar">
            {/* White Pill Logo (Matches Rewards Page) */}
            <div className="dash-logo-brand" aria-label="BussInn">
              <BusFront aria-hidden="true" />
              <span>BussInn</span>
            </div>
          </div>

          <div className="profile-hero-content">
            <div
              className="avatar-container"
              onClick={() => fileInputRef.current?.click()}
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
              {/* Only show the bullet point if BOTH email and phone exist */}
              {passenger.email} {passenger.email && passenger.phone && " • "} {passenger.phone}
            </p>

            {/* Gradient Coin Badge (Matches Rewards Page) */}
            <div className="coins-pill-badge">
              <Coins aria-hidden="true" />
              <span>{passenger.coins.toLocaleString()} Coins</span>
            </div>
          </div>

        </header>

        <main className="profile-menu-container">
          <div className="menu-links-list">
            <Link to="/refer-earn" className="menu-item-row">
              <div className="menu-icon-box">
                <span className="material-symbols-outlined">group_add</span>
              </div>
              <span className="menu-item-text">Refer & Earn</span>
              <span className="material-symbols-outlined menu-arrow">chevron_right</span>
            </Link>

            <Link to="/about-us" className="menu-item-row">
              <div className="menu-icon-box">
                <span className="material-symbols-outlined">info</span>
              </div>
              <span className="menu-item-text">About Us</span>
              <span className="material-symbols-outlined menu-arrow">chevron_right</span>
            </Link>

            <Link to="/help" className="menu-item-row">
              <div className="menu-icon-box">
                <span className="material-symbols-outlined">help</span>
              </div>
              <span className="menu-item-text">Help & Support</span>
              <span className="material-symbols-outlined menu-arrow">chevron_right</span>
            </Link>

            <Link to="/feedback" search={{ from: "passenger" }} className="menu-item-row">
              <div className="menu-icon-box">
                <span className="material-symbols-outlined">chat_bubble</span>
              </div>
              <span className="menu-item-text">Feedback</span>
              <span className="material-symbols-outlined menu-arrow">chevron_right</span>
            </Link>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="logout-btn-row"
            disabled={isLoggingOut}
          >
            <span className="material-symbols-outlined text-red-600">logout</span>
            <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
          </button>
        </main>

        <PassengerBottomNav />
      </div>
    </div>
  );
};

export default PassengerProfile;