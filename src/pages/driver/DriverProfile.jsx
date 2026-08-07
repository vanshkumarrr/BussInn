import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import DriverBottomNav from "../../components/DriverBottomNav";
import "../../styles/DriverProfile.css";

const DriverProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 1. Global Language State
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  // 2. Load Driver Profile Data from localStorage (DATABASE SYNC POINT)
  const [driverInfo, setDriverInfo] = useState({
    name: "Driver",
    phone: "98765 43210",
    coins: 150,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
  });

  useEffect(() => {
    // TODO [DATABASE]: Fetch driver profile details from backend database using driver ID / auth token
    const savedName = localStorage.getItem("bussinn_signup_name");
    const savedPhone = localStorage.getItem("signupPhone");
    const savedCoins = localStorage.getItem("driver_coins_balance");
    const savedAvatar = localStorage.getItem("driver_profile_avatar");

    setDriverInfo({
      name: savedName || "Driver",
      phone: savedPhone ? `${savedPhone.slice(0, 5)} ${savedPhone.slice(5)}` : "98765 43210",
      coins: savedCoins ? parseInt(savedCoins, 10) : 150,
      avatar: savedAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
    });
  }, []);

  // Handle Gallery Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setDriverInfo(prev => ({ ...prev, avatar: base64String }));
        
        // Save to local storage for persistence
        localStorage.setItem("driver_profile_avatar", base64String);

        // TODO [DATABASE]: Upload base64String or multipart file to cloud storage (e.g., AWS S3, Supabase Storage)
        // and update the driver's avatar URL in the database:
        // await axios.post('/api/driver/update-avatar', { avatarUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    // TODO [DATABASE]: Call backend logout/session-clear endpoint if using server sessions
    localStorage.removeItem("bussinn_signup_name");
    localStorage.removeItem("signupPhone");
    localStorage.removeItem("driver_route_config");
    navigate({ to: "/login" });
  };

  // Translation Dictionary
  const content = {
    en: {
      coinsBadge: "BS Coins",
      menuTab: "Menu",
      coinsTab: "BS Coins",
      redeemCoins: "Redeem Coins",
      referEarn: "Refer & Earn",
      aboutUs: "About Us",
      helpSupport: "Help & Support",
      feedback: "Feedback",
      logout: "Logout"
    },
    hi: {
      coinsBadge: "बीएस सिक्के",
      menuTab: "मेन्यू",
      coinsTab: "बीएस सिक्के",
      redeemCoins: "सिक्के भुनाएं",
      referEarn: "रेफर करें और कमाएं",
      aboutUs: "हमारे बारे में",
      helpSupport: "सहायता और समर्थन",
      feedback: "प्रतिक्रिया",
      logout: "लॉग आउट"
    }
  };

  const t = isHindi ? content.hi : content.en;

  return (
    <div className="page mobile-page-container">
      <div className="app-content profile-layout">
        
        {/* Header with Global Language Toggle */}
        <header className="dash-header">
          <h1 className="brand-title">BussInn</h1>
          <button 
            className="btn-lang-pill"
            onClick={toggleLanguage}
            title="Change Language"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            EN / HI
          </button>
        </header>

        {/* Profile Content */}
        <main className="profile-content">
          
          {/* User Hero Section with Gallery Upload */}
          <div className="profile-hero">
            <div 
              className="avatar-wrapper" 
              onClick={() => fileInputRef.current.click()}
              title="Click to choose image from gallery"
              style={{ cursor: "pointer" }}
            >
              <img 
                src={driverInfo.avatar} 
                alt="Driver Avatar" 
                className="profile-avatar"
              />
              <div className="avatar-edit-badge">
                <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                  <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
              </div>
            </div>

            {/* Hidden File Input for Gallery Selection */}
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: "none" }} 
              accept="image/*" 
              onChange={handleImageChange}
            />

            <h2 className="profile-name">{driverInfo.name}</h2>
            <p className="profile-contact">+91 {driverInfo.phone}</p>

            {/* Coins Balance Pill */}
            <div className="profile-coins-pill">
              <span className="coin-emoji">🪙</span>
              <span className="coin-amount">{driverInfo.coins} {t.coinsBadge}</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="profile-tabs">
            <div className="tab-item active">{t.menuTab}</div>
            <Link to="/driver/coins" className="tab-item inactive">{t.coinsTab}</Link>
          </div>

          {/* Menu Options List */}
          <div className="menu-card-list">
            
            <Link to="/redeem-coins" className="menu-item">
              <div className="menu-icon-box bg-blue-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="#0062ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="8"></circle>
                  <line x1="12" y1="8" x2="12" y2="16"></line>
                  <line x1="8" y1="12" x2="16" y2="12"></line>
                </svg>
              </div>
              <span className="menu-label">{t.redeemCoins}</span>
              <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>

            <Link to="/refer-earn" className="menu-item">
              <div className="menu-icon-box bg-gray-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <span className="menu-label">{t.referEarn}</span>
              <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>

            <Link to="/about-us" className="menu-item">
              <div className="menu-icon-box bg-gray-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <span className="menu-label">{t.aboutUs}</span>
              <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>

            <Link to="/help" className="menu-item">
              <div className="menu-icon-box bg-gray-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <span className="menu-label">{t.helpSupport}</span>
              <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>

            <Link to="/feedback" className="menu-item">
              <div className="menu-icon-box bg-gray-light">
                <svg viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <span className="menu-label">{t.feedback}</span>
              <svg className="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </Link>

          </div>

          {/* Logout Action Button */}
          <button onClick={handleLogout} className="btn-logout">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="logout-icon">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            {t.logout}
          </button>

        </main>

        <div className="bottom-nav-placeholder">
          <DriverBottomNav />
        </div>

      </div>
    </div>
  );
};

export default DriverProfile;