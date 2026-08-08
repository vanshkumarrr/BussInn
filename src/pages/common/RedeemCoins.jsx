import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import BackButton from "../../components/BackButton";
import "../../styles/RedeemCoins.css";

const RedeemCoins = () => {
  // 1. Global Language State
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  // 2. Wallet Balance State
  const [coins, setCoins] = useState(() => {
    const savedCoins = localStorage.getItem("driver_coins_balance");
    return savedCoins ? parseInt(savedCoins, 10) : 0;
  });

  // 3. Notification Popup State
  const [popup, setPopup] = useState({ show: false, title: "", desc: "", success: false });

  // Reward Items Catalog with Unsplash Product Photos matching your reference image
  const rewards = [
    {
      id: 1,
      title: isHindi ? "₹100 अमेज़न गिफ्ट कार्ड" : "₹100 INR Amazon/Generic Gift Card",
      cost: 10000,
      image: "https://images.unsplash.com/photo-1589758438368-0ad531db3366?w=600&auto=format&fit=crop&q=80",
      category: isHindi ? "गिफ्ट कार्ड" : "Gift Card",
      desc: isHindi ? "तुरंत उपयोग के लिए ₹100 अमेज़न या ब्रांडेड वाउचर।" : "Instant digital gift card code delivered to your registered profile."
    },
    {
      id: 2,
      title: isHindi ? "ब्रांडेड टी-शर्ट" : "T-shirt",
      cost: 15000,
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80",
      category: isHindi ? "मर्चेंडाइज" : "BussInn Merchandise",
      desc: isHindi ? "प्रीमियम कॉटन आरामदायक ड्राइवर टी-शर्ट।" : "Breathable, high-grade cotton driver t-shirt featuring BussInn branding."
    },
    {
      id: 3,
      title: isHindi ? "ट्रेवल लोअर" : "Lower",
      cost: 30000,
      image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&auto=format&fit=crop&q=80",
      category: isHindi ? "मर्चेंडाइज" : "BussInn Merchandise",
      desc: isHindi ? "लचीले और आरामदायक ट्रैक पैंट्स।" : "Comfortable stretchable joggers ideal for long hours behind the wheel."
    },
    {
      id: 4,
      title: isHindi ? "यात्रा बैकपैक" : "Travel Backpack",
      cost: 50000,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80",
      category: isHindi ? "गियर" : "Gear",
      desc: isHindi ? "वाटर-प्रूफ लैपटॉप कम्पार्टमेंट बैकपैक।" : "Durable multi-compartment travel backpack with laptop sleeve."
    },
    {
      id: 5,
      title: isHindi ? "विंटर हुडी" : "Winter Hoodie",
      cost: 60000,
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&auto=format&fit=crop&q=80",
      category: isHindi ? "मर्चेंडाइज" : "BussInn Merchandise",
      desc: isHindi ? "अतिरिक्त गर्म ऊनी फ्लीस हुडी।" : "Extra warm fleece-lined winter hoodie designed for cold shifts."
    }
  ];

  const handleRedeemAttempt = (item) => {
    if (coins >= item.cost) {
      const updatedCoins = coins - item.cost;
      setCoins(updatedCoins);
      localStorage.setItem("driver_coins_balance", updatedCoins.toString());

      setPopup({
        show: true,
        success: true,
        title: isHindi ? "सफलतापूर्वक रिडीम किया गया! 🎉" : "Successfully Redeemed! 🎉",
        desc: isHindi 
          ? `आपने ${item.title} प्राप्त कर लिया है। विवरण जल्द भेजा जाएगा।` 
          : `You have successfully claimed ${item.title}. Check your profile for delivery updates.`
      });
    } else {
      setPopup({
        show: true,
        success: false,
        title: isHindi ? "अपर्याप्त सिक्के ❌" : "Insufficient Coins ❌",
        desc: isHindi 
          ? `इस आइटम को रिडीम करने के लिए आपके पास पर्याप्त सिक्के नहीं हैं।` 
          : `You don't have enough coins to claim this item. Earn more by driving scheduled routes!`
      });
    }
  };

  const content = {
    en: {
      title: "Redeem",
      redeemBtn: "Redeem",
      close: "Got it"
    },
    hi: {
      title: "रिडीम करें",
      redeemBtn: "रिडीम",
      close: "समझ गया"
    }
  };

  const t = isHindi ? content.hi : content.en;

  return (
    <div className="page mobile-page-container">
      <div className="app-content redeem-layout">
        
        {/* Header with single clean close element */}
        <header className="dash-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BackButton fallback="/driver/profile" />
            <h1 className="brand-title">{t.title}</h1>
          </div>
          
          <div className="header-actions">
            <button className="btn-lang-pill" onClick={toggleLanguage}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
              </svg>
              EN / HI
            </button>
            <Link to="/driver/profile" className="btn-close-circle">✕</Link>
          </div>
        </header>

        {/* Main Scrollable Content */}
        <main className="redeem-content">
          
          {/* Top Hero Banner */}
          <div className="redeem-hero-banner">
            <div className="hero-text-group">
              <h2 className="hero-heading">Redeem Rewards</h2>
              <p className="hero-sub">Convert your hard-earned coins into cash or goodies.</p>
            </div>
            <div className="hero-coin-badge">
              <span className="coin-icon">🪙</span>
              <span className="coin-count">{coins} COINS</span>
            </div>
          </div>

          {/* Vertical Cards Grid */}
          <div className="vertical-rewards-list">
            {rewards.map((item) => (
              <div key={item.id} className="vertical-card">
                <div className="card-img-container">
                  <img src={item.image} alt={item.title} className="reward-banner-img" />
                </div>
                
                <div className="card-body-row">
                  <div className="card-text-col">
                    <h3 className="vertical-card-title">{item.title}</h3>
                    <div className="card-price-row">
                      <span className="coin-symbol-badge">🪙</span>
                      <span className="vertical-card-cost">{item.cost.toLocaleString()}</span>
                    </div>
                  </div>

                  <button 
                    className="btn-primary-redeem"
                    onClick={() => handleRedeemAttempt(item)}
                  >
                    {t.redeemBtn}
                  </button>
                </div>
              </div>
            ))}
          </div>

        </main>

        {/* Professional Success / Failure Popup Modal */}
        {popup.show && (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className={`popup-icon-container ${popup.success ? "success" : ""}`}>
                {popup.success ? "✓" : "!"}
              </div>
              <h3 className="modal-title">{popup.title}</h3>
              <p className="modal-desc">{popup.desc}</p>
              <button 
                className="btn-primary-redeem"
                onClick={() => setPopup({ show: false })}
              >
                {t.close}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default RedeemCoins;