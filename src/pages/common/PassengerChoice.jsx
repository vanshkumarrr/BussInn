import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import "../../styles/PassengerChoice.css";

const PassengerChoice = () => {
  const [isHindi, setIsHindi] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("bussinn_lang");
    if (savedLang === "hi") setIsHindi(true);
  }, []);

  const toggleLanguage = () => {
    const nextLang = !isHindi;
    setIsHindi(nextLang);
    localStorage.setItem("bussinn_lang", nextLang ? "hi" : "en");
  };

  const content = {
    en: {
      welcome: "Welcome, Passenger",
      subtitle: "What would you like to do today? Select an option below to continue your journey.",
      searchTitle: "I'm Searching for a Bus",
      searchDesc: "Find nearby stops, view live arrivals, and plan your route across the city network.",
      insideTitle: "I'm Already Inside a Bus",
      insideDesc: "Track your current journey, see upcoming stops, and set a destination alert."
    },
    hi: {
      welcome: "स्वागत है, यात्री",
      subtitle: "आज आप क्या करना चाहेंगे? अपनी यात्रा जारी रखने के लिए नीचे एक विकल्प चुनें।",
      searchTitle: "मैं बस की तलाश कर रहा हूँ",
      searchDesc: "आसपास के स्टॉप ढूंढें, लाइव आगमन देखें और पूरे शहर के नेटवर्क में अपने मार्ग की योजना बनाएं।",
      insideTitle: "मैं पहले से ही बस के अंदर हूँ",
      insideDesc: "अपनी वर्तमान यात्रा को ट्रैक करें, आगामी स्टॉप देखें और गंतव्य अलर्ट सेट करें।"
    }
  };

  const t = isHindi ? content.hi : content.en;

  return (
    <div className="passenger-choice-page">
      <div className="app-content">
        {/* Top Header */}
        <header className="passenger-header">
          <div className="brand-group">
            <svg viewBox="0 0 24 24" fill="currentColor" className="brand-bus-svg">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
            <h1 className="brand-title-text">BussInn</h1>
          </div>
          <button className="btn-lang-pill" onClick={toggleLanguage}>
            EN / HI
          </button>
        </header>

        {/* Main Content Area */}
        <main className="passenger-main-content">
          <div className="passenger-content-wrapper">
            {/* Hero Section */}
            <div className="hero-text-section">
              <h2 className="hero-title">{t.welcome}</h2>
              <p className="hero-subtitle">{t.subtitle}</p>
            </div>

            {/* Cards Stack */}
            <div className="cards-stack-layout">
              {/* Card 1: Searching for a Bus */}
              <Link to="/passenger/search" className="decision-card">
                <div className="card-top-row">
                  <div className="card-icon-box blue-box">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="card-svg-icon">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="arrow-svg">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
                <div className="card-bottom-content">
                  <h3 className="card-heading">{t.searchTitle}</h3>
                  <p className="card-desc">{t.searchDesc}</p>
                </div>
              </Link>

              {/* Card 2: Inside a Bus (Routes to Ride Details) */}
              <Link to="/passenger/ride/$rideId" className="decision-card">
                <div className="card-top-row">
                  <div className="card-icon-box orange-box">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="card-svg-icon">
                      <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                    </svg>
                  </div>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="arrow-svg">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
                <div className="card-bottom-content">
                  <h3 className="card-heading">{t.insideTitle}</h3>
                  <p className="card-desc">{t.insideDesc}</p>
                </div>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PassengerChoice;