import { useState, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/PassengerProfile.css";

const PassengerProfile = () => {
  // 1. Profile & Synced State
  const [passenger, setPassenger] = useState({
    name: "Vansh Kumar",
    email: "vansh.kumar@example.com",
    phone: "+91 98765 43210",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    coins: 0
  });

  const fileInputRef = useRef(null);

  // Fetch saved details from localStorage & database sync placeholders
  useEffect(() => {
    // TODO [DATABASE]: Fetch passenger profile info & live coin balance from backend database API
    // async function fetchPassengerProfile() {
    //   const response = await axios.get('/api/passenger/profile');
    //   setPassenger(response.data);
    // }
    // fetchPassengerProfile();

    const savedAvatar = localStorage.getItem("passenger_profile_avatar");
    const savedName = localStorage.getItem("passenger_name") || localStorage.getItem("bussinn_signup_name");
    const savedPhone = localStorage.getItem("passenger_phone") || localStorage.getItem("signupPhone");
    const savedCoins = localStorage.getItem("passenger_coins");

    setPassenger(prev => ({
      ...prev,
      name: savedName || prev.name,
      phone: savedPhone ? `+91 ${savedPhone}` : prev.phone,
      email: savedName ? `${savedName.toLowerCase().replace(/\s+/g, '')}@gmail.com` : prev.email,
      coins: savedCoins !== null ? parseInt(savedCoins, 10) : 0,
      avatar: savedAvatar || prev.avatar
    }));
  }, []);

  // Handle Profile Picture Change & Database Upload Placeholder
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        setPassenger(prev => ({ ...prev, avatar: base64Image }));
        localStorage.setItem("passenger_profile_avatar", base64Image);

        // TODO [DATABASE]: Upload new avatar to backend database API
        // await axios.put('/api/passenger/avatar', { avatar: base64Image });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Logout Session Clear
  const handleLogout = () => {
    // TODO: Clear auth tokens / session storage before navigating
    localStorage.removeItem("passenger_token");
    localStorage.removeItem("passenger_profile_avatar");
  };

  return (
    <div className="passenger-choice-page">
      <div className="app-content">
        
        {/* Top Header */}
        <header className="dash-header">
          <h1 className="dash-logo">BussInn</h1>
        </header>

        {/* Profile Info Card Section */}
        <div className="profile-hero-section">
          <div className="avatar-container" onClick={() => fileInputRef.current.click()} title="Change Profile Picture">
            <img src={passenger.avatar} alt={passenger.name} className="profile-avatar-img" />
            <div className="avatar-edit-badge">
              <span className="material-symbols-outlined text-xs">edit</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleAvatarChange} 
              accept="image/*" 
              style={{ display: "none" }} 
            />
          </div>

          <h2 className="profile-name">{passenger.name}</h2>
          <p className="profile-meta">{passenger.email} • {passenger.phone}</p>

          {/* BS Coins Display Banner */}
          <div className="coins-pill-badge">
            <span className="material-symbols-outlined text-amber-500 text-base">toll</span>
            <span>{passenger.coins.toLocaleString()} BS Coins</span>
          </div>
        </div>

        {/* Menu Options Container */}
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

            {/* Fixed Feedback Link with Search Parameter */}
            <Link to="/feedback" search={{ from: "passenger" }} className="menu-item-row">
              <div className="menu-icon-box">
                <span className="material-symbols-outlined">chat_bubble</span>
              </div>
              <span className="menu-item-text">Feedback</span>
              <span className="material-symbols-outlined menu-arrow">chevron_right</span>
            </Link>
          </div>

          {/* Logout Button */}
          <Link to="/login" onClick={handleLogout} className="logout-btn-row">
            <span className="material-symbols-outlined text-red-600">logout</span>
            <span>Logout</span>
          </Link>
        </main>

        {/* Bottom Navigation Bar */}
        <PassengerBottomNav />

      </div>
    </div>
  );
};

export default PassengerProfile;