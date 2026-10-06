import { useState, useEffect } from "react";
import DriverBottomNav from "../../components/DriverBottomNav";
import "../../styles/DriverCoins.css";

const DriverCoins = () => {
  const [isHindi, setIsHindi] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    if (typeof window !== "undefined") {
      localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
    }
  };

  // Initialize coins: defaults to 0 if not set in localStorage
  const [coins, setCoins] = useState(() => {
    if (typeof window === "undefined") return 0;
    const savedCoins = localStorage.getItem("driver_coins_balance");
    if (savedCoins === null) {
      localStorage.setItem("driver_coins_balance", "0");
      return 0;
    }
    return parseInt(savedCoins, 10);
  });

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const tripEndedFlag = localStorage.getItem("trigger_coin_reward");
    if (tripEndedFlag === "pending") {
      processTripReward();
      localStorage.removeItem("trigger_coin_reward");
    }

    const handleStorageChange = () => {
      const updatedCoins = localStorage.getItem("driver_coins_balance");
      if (updatedCoins !== null) {
        setCoins(parseInt(updatedCoins, 10));
      } else {
        setCoins(0);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const processTripReward = () => {
    if (typeof window === "undefined") return;
    const currentCoins = parseInt(localStorage.getItem("driver_coins_balance") || "0", 10);
    const earnedAmount = 50;
    const newTotal = currentCoins + earnedAmount;
    
    setCoins(newTotal);
    localStorage.setItem("driver_coins_balance", newTotal.toString());
    
    setPopupMessage(isHindi ? "🎉 वॉलेट में 50 सिक्के जोड़े गए!" : "🎉 50 coins added in the wallet!");
    setShowPopup(true);
  };

  const content = {
    en: {
      walletTitle: "Driver Wallet",
      availableCoins: "Available Coins",
      coinSub: "Earn coins by driving scheduled routes & helping commuters.",
      howToEarnTitle: "How to Earn Coins",
      howToEarnSub: "Your way to say 'Thank you' for using our app.",
      card1Title: "Help the Community",
      card1Desc: "Earn coins by starting your trip and sharing the live bus location with others.",
      card2Title: "Refer & Earn",
      card2Desc: "Get 100 coins for every successful referral when they complete their first trip tracking.",
      tcTitle: "Terms & Conditions",
      tc1: "Coins are awarded when you start a trip from the bus's initial starting point or within 20KM of the start location.",
      tc2: "Coins are credited to your account only after successfully completing and ending the trip as you leave the bus.",
      tc3: "Referral coins are granted when a new user joins with your code and shares their location for their first trip.",
      closeBtn: "Awesome"
    },
    hi: {
      walletTitle: "ड्राइवर वॉलेट",
      availableCoins: "उपलब्ध सिक्के",
      coinSub: "निर्धारित मार्गों पर ड्राइव करके और यात्रियों की मदद करके सिक्के कमाएं।",
      howToEarnTitle: "सिक्के कैसे कमाएं",
      howToEarnSub: "हमारे ऐप का उपयोग करने के लिए धन्यवाद कहने का आपका तरीका।",
      card1Title: "समुदाय की सहायता करें",
      card1Desc: "अपनी यात्रा शुरू करके और अन्य लोगों के साथ लाइव बस स्थान साझा करके सिक्के कमाएं।",
      card2Title: "रेफर करें और कमाएं",
      card2Desc: "प्रत्येक सफल रेफरल पर 100 सिक्के प्राप्त करें जब वे अपनी पहली यात्रा पूरी करें।",
      tcTitle: "नियम और शर्तें",
      tc1: "सिक्के तब दिए जाते हैं जब आप बस के शुरुआती बिंदु से या शुरुआती स्थान के 20 किमी के भीतर यात्रा शुरू करते हैं।",
      tc2: "बस छोड़ने पर सफलतापूर्वक यात्रा पूरी करने और समाप्त करने के बाद ही सिक्के आपके खाते में जमा किए जाते हैं।",
      tc3: "जब कोई नया उपयोगकर्ता आपके कोड से जुड़ता है और अपनी पहली यात्रा के लिए अपना स्थान साझा करता है, तो रेफरल सिक्के दिए जाते हैं।",
      closeBtn: "बहुत बढ़िया"
    }
  };

  const t = isHindi ? content.hi : content.en;

  return (
    <div className="mobile-page-container">
      <div className="app-content coins-layout">
        
        <header className="dash-header">
          <h1 className="brand-title">BussInn</h1>
          <button 
            className="btn-lang-pill cursor-pointer"
            onClick={toggleLanguage}
            title="Change Language"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            EN / HI
          </button>
        </header>

        <main className="coins-content">
          <div className="wallet-card">
            <div className="wallet-glow"></div>
            <div className="wallet-header-row">
              <span className="wallet-badge">{t.walletTitle}</span>
              <div className="coin-icon-badge">🪙</div>
            </div>
            <div className="wallet-balance-box">
              <span className="balance-number">{coins}</span>
              <span className="balance-label">{t.availableCoins}</span>
            </div>
            <p className="wallet-subtitle">{t.coinSub}</p>
          </div>

          <div className="section-title-block">
            <h2 className="section-main-title">{t.howToEarnTitle}</h2>
            <p className="section-sub-title">{t.howToEarnSub}</p>
          </div>

          <div className="earn-method-card border-orange">
            <div className="method-icon-wrap bg-blue-light">
              <svg viewBox="0 0 24 24" fill="none" stroke="#0062ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path>
                <path d="M2 12h20"></path>
              </svg>
            </div>
            <div className="method-text-group">
              <h3 className="method-title">{t.card1Title}</h3>
              <p className="method-desc">{t.card1Desc}</p>
            </div>
          </div>

          <div className="earn-method-card border-blue">
            <div className="method-icon-wrap bg-purple-light">
              <svg viewBox="0 0 24 24" fill="none" stroke="#673ab7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="method-text-group">
              <h3 className="method-title">{t.card2Title}</h3>
              <p className="method-desc">{t.card2Desc}</p>
            </div>
          </div>

          <div className="tc-card">
            <div className="tc-header">
              <svg className="tc-info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              <h3 className="tc-title">{t.tcTitle}</h3>
            </div>

            <ul className="tc-list">
              <li>{t.tc1}</li>
              <li>{t.tc2}</li>
              <li>{t.tc3}</li>
            </ul>
          </div>
        </main>

        {showPopup && (
          <div className="popup-overlay">
            <div className="popup-card">
              <div className="popup-coin-anim">🪙✨</div>
              <h3 className="popup-title">Coins Credited!</h3>
              <p className="popup-desc">{popupMessage}</p>
              <button className="popup-btn cursor-pointer" onClick={() => setShowPopup(false)}>
                {t.closeBtn}
              </button>
            </div>
          </div>
        )}

        <div className="bottom-nav-placeholder">
          <DriverBottomNav />
        </div>

      </div>
    </div>
  );
};

export default DriverCoins;