import { useState } from "react";
import { Link } from "@tanstack/react-router";
import "../../styles/RoleSelection.css";

const RoleSelection = () => {
  // Language State (false = English, true = Hindi)
  const [isHindi, setIsHindi] = useState(false);

  // Translation Dictionary
  const content = {
    en: {
      title: "Welcome to BussInn",
      subtitle: "Select how you'll be using the app today.",
      passengerTitle: "I am a Passenger",
      passengerDesc: "Find routes, track live buses, and pay for your rides effortlessly.",
      passengerAction: "Get Started",
      driverTitle: "I am a Driver",
      driverDesc: "Manage your route, view upcoming stops, and process passenger boarding.",
      driverAction: "Continue",
      footerText: "Already have an account? ",
      footerLink: "Log in here"
    },
    hi: {
      title: "BussInn में आपका स्वागत है",
      subtitle: "चुनें कि आप आज ऐप का उपयोग कैसे करेंगे।",
      passengerTitle: "मैं एक यात्री हूँ",
      passengerDesc: "मार्ग खोजें, लाइव बसें ट्रैक करें, और आसानी से अपने सफर का भुगतान करें।",
      passengerAction: "शुरू करें",
      driverTitle: "मैं एक ड्राइवर हूँ",
      driverDesc: "अपना मार्ग प्रबंधित करें, आने वाले स्टॉप देखें, और यात्रियों की बोर्डिंग को प्रोसेस करें।",
      driverAction: "जारी रखें",
      footerText: "क्या आपके पास पहले से खाता है? ",
      footerLink: "यहाँ लॉग इन करें"
    }
  };

  const t = isHindi ? content.hi : content.en;

  return (
    <div className="mobile-page-container dotted-background">
      <div className="app-content role-layout">
        
        {/* Top Navigation */}
        <header className="role-header">
          <div className="brand-info">
            <svg className="bus-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
            <h1 className="brand-name">BussInn</h1>
          </div>
          
          {/* Language Toggle Button Pushed to Right */}
          <button 
            className="btn-lang-pill"
            onClick={() => setIsHindi(!isHindi)}
            title="Change Language"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            EN / HI
          </button>
        </header>

        {/* Main Content */}
        <main className="role-main">
          <div className="role-header-text">
            <h2 className="role-title">{t.title}</h2>
            <p className="role-subtitle">{t.subtitle}</p>
          </div>

          <div className="role-cards-container">
            
            {/* Passenger Card */}
            <Link to="/passenger-choice" className="role-card passenger-card">
              <div className="card-icon-wrapper passenger-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
              </div>
              <h3 className="card-title">{t.passengerTitle}</h3>
              <p className="card-desc">{t.passengerDesc}</p>
              <div className="card-action passenger-action">
                <span>{t.passengerAction}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>

            {/* Driver Card */}
            <Link to="/driver-setup" className="role-card driver-card">
              <div className="card-icon-wrapper driver-icon">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                  <circle cx="12" cy="12" r="2"/>
                </svg>
              </div>
              <h3 className="card-title">{t.driverTitle}</h3>
              <p className="card-desc">{t.driverDesc}</p>
              <div className="card-action driver-action">
                <span>{t.driverAction}</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="arrow-icon">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            </Link>

          </div>

          {/* Footer Action */}
          
        </main>

      </div>
    </div>
  );
};

export default RoleSelection;