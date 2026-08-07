import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import BackButton from "../../components/BackButton";
import "../../styles/ReferEarn.css";

const ReferEarn = () => {
  // 1. Global Language State
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  // 2. Referral Code State (Generates a unique persistent code for the driver)
  const [referralCode, setReferralCode] = useState("BL4FF");
  const [copied, setCopied] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    let savedCode = localStorage.getItem("bussinn_referral_code");
    if (!savedCode) {
      savedCode = "BL" + Math.random().toString(36).substring(2, 6).toUpperCase();
      localStorage.setItem("bussinn_referral_code", savedCode);
    }
    setReferralCode(savedCode);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareText = isHindi 
      ? `BussInn ऐप से जुड़ें! मेरा रेफरल कोड उपयोग करें: ${referralCode}` 
      : `Join BussInn using my referral code: ${referralCode} and start earning rewards!`;
      
    if (navigator.share) {
      try {
        await navigator.share({
          title: "BussInn Referral",
          text: shareText,
          url: window.location.origin,
        });
      } catch (err) {
        console.log("Share canceled", err);
      }
    } else {
      handleCopyCode();
    }
  };

  const content = {
    en: {
      title: "Refer to your friend and Get a reward of 100 Coins",
      subText: "Share this link with your friend and you can earn 100 coins when your referred passengers share their contribution for the very first time.",
      rulesLink: "View Invitation Rules",
      step1: "Copy Link",
      step2: "Friends registered successfully",
      step3: "Earn coin rewards",
      referBtn: "Refer friend",
      rulesTitle: "Invitation Rules",
      rule1: "1. Your friend must sign up using your exact referral code.",
      rule2: "2. They must successfully complete and track their first trip.",
      rule3: "3. 100 coins will be automatically credited to your wallet upon verification.",
      close: "Got it"
    },
    hi: {
      title: "अपने दोस्तों को रेफर करें और 100 सिक्कों का इनाम पाएं",
      subText: "इस लिंक को अपने दोस्तों के साथ साझा करें और जब आपके रेफ़र किए गए यात्री पहली बार अपना योगदान साझा करेंगे तो आप 100 सिक्के कमा सकते हैं।",
      rulesLink: "निमंत्रण नियम देखें",
      step1: "लिंक कॉपी करें",
      step2: "मित्र सफलतापूर्वक पंजीकृत",
      step3: "सिक्के कमाएं",
      referBtn: "मित्र को रेफर करें",
      rulesTitle: "निमंत्रण नियम",
      rule1: "1. आपके मित्र को आपके रेफ़रल कोड का उपयोग करके साइन अप करना होगा।",
      rule2: "2. उन्हें अपनी पहली यात्रा सफलतापूर्वक पूरी करनी होगी।",
      rule3: "3. सत्यापन पर 100 सिक्के आपके वॉलेट में स्वचालित रूप से जमा हो जाएंगे।",
      close: "समझ गया"
    }
  };

  const t = isHindi ? content.hi : content.en;

  return (
    <div className="page mobile-page-container">
      <div className="app-content refer-layout">
        
        {/* Top Header */}
        <header className="dash-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BackButton fallback="/driver/profile" />
          </div>
          <h1 className="brand-title">BussInn</h1>
          <button className="btn-lang-pill" onClick={toggleLanguage}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            EN / HI
          </button>
        </header>

        {/* Main Refer Content */}
        <main className="refer-content">
          
          <div className="refer-hero-section">
            <h2 className="refer-main-title">{t.title}</h2>
            <p className="refer-sub-text">{t.subText}</p>

            {/* Code Box */}
            <div className="refer-code-box" onClick={handleCopyCode}>
              <span className="code-text">{referralCode}</span>
              <div className="copy-icon-btn" title="Copy Code">
                {copied ? "✓" : "📋"}
              </div>
            </div>
            {copied && <span className="copied-toast">Code copied to clipboard!</span>}

            <button 
              className="rules-link-btn"
              onClick={() => setShowRulesModal(true)}
            >
              {t.rulesLink}
            </button>
          </div>

          {/* Steps Feature Row */}
          <div className="refer-steps-card">
            <div className="step-col">
              <div className="step-icon-circle">📋</div>
              <span className="step-lbl">{t.step1}</span>
            </div>
            <div className="step-col">
              <div className="step-icon-circle">✔</div>
              <span className="step-lbl">{t.step2}</span>
            </div>
            <div className="step-col">
              <div className="step-icon-circle">🪙</div>
              <span className="step-lbl">{t.step3}</span>
            </div>
          </div>

        </main>

        {/* Footer Action Button */}
        <div className="refer-footer-action">
          <button className="btn-primary-refer" onClick={handleShare}>
            {t.referBtn}
          </button>
        </div>

        {/* Invitation Rules Modal */}
        {showRulesModal && (
          <div className="modal-overlay" onClick={() => setShowRulesModal(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">{t.rulesTitle}</h3>
              <div className="rules-list">
                <p>{t.rule1}</p>
                <p>{t.rule2}</p>
                <p>{t.rule3}</p>
              </div>
              <button 
                className="btn-primary-refer"
                onClick={() => setShowRulesModal(false)}
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

export default ReferEarn;