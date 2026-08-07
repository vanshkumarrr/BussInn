import { useState } from "react";
import BackButton from "../../components/BackButton";
import "../../styles/AboutUs.css";

const AboutUs = () => {
  // 1. Global Language State
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  const content = {
    en: {
      title: "About Us",
      heroHeading: "Re-imagining Urban Transit.",
      heroSub: "We believe that city travel should be seamless, predictable, and rewarding. BussInn isn't just an app; it's the digital infrastructure connecting our community on the move.",
      storyTitle: "Our Story",
      storyP1: "Born from the frustration of unpredictable commutes, BussInn was built to bridge the gap between complex transit networks and everyday passengers. By connecting riders, drivers, and city administrators in real time, we transform chaotic journeys into choreographed movement.",
      storyP2: "Whether you're rushing to work, exploring the city, or managing a fleet, our platform provides the clarity and control needed to navigate modern urban life.",
      coreValues: "Core Values",
      val1Title: "Innovation",
      val1Desc: "Leveraging real time tracking, predictive ETAs, and smart algorithms to keep you steps ahead of the schedule.",
      val2Title: "Reliability",
      val2Desc: "Building dependable transit networks that commuters and drivers can count on every single day.",
      val3Title: "Community",
      val3Desc: "Empowering local riders and drivers with rewards, shared location insights, and seamless connectivity."
    },
    hi: {
      title: "हमारे बारे में",
      heroHeading: "शहरी परिवहन की नई कल्पना।",
      heroSub: "हम मानते हैं कि शहर की यात्रा सहज, अनुमानित और लाभदायक होनी चाहिए। BussInn सिर्फ एक ऐप नहीं है; यह हमारे समुदाय को जोड़ने वाला डिजिटल बुनियादी ढांचा है।",
      storyTitle: "हमारी कहानी",
      storyP1: "अप्रिय यात्राओं की निराशा से उपजे, BussInn को जटिल पारगमन नेटवर्क और दैनिक यात्रियों के बीच की खाई को पाटने के लिए बनाया गया था।",
      storyP2: "चाहे आप काम के लिए जल्दी में हों, शहर की खोज कर रहे हों, या फ्लीट का प्रबंधन कर रहे हों, हमारा प्लेटफ़ॉर्म आधुनिक शहरी जीवन को नेविगेट करने के लिए स्पष्टता प्रदान करता है।",
      coreValues: "मूल मूल्य",
      val1Title: "नवाचार",
      val1Desc: "रीयल-टाइम ट्रैकिंग और स्मार्ट एल्गोरिदम का लाभ उठाना।",
      val2Title: "विश्वसनीयता",
      val2Desc: "भरोसेमंद पारगमन नेटवर्क का निर्माण जिस पर हर दिन भरोसा किया जा सके।",
      val3Title: "समुदाय",
      val3Desc: " rewards और साझा कनेक्टिविटी के साथ स्थानीय ड्राइवरों और यात्रियों को सशक्त बनाना।"
    }
  };

  const t = isHindi ? content.hi : content.en;

  return (
    <div className="page mobile-page-container">
      <div className="app-content about-layout">
        
        {/* Header */}
        <header className="dash-header">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <BackButton fallback="/driver/profile" />
            <h1 className="brand-title">{t.title}</h1>
          </div>
          <button className="btn-lang-pill" onClick={toggleLanguage}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            EN / HI
          </button>
        </header>

        {/* Main Content Area */}
        <main className="about-content">
          
          <div className="about-hero-block">
            <h2 className="about-hero-title">{t.heroHeading}</h2>
            <p className="about-hero-desc">{t.heroSub}</p>
          </div>

          {/* Story Card */}
          <div className="about-card">
            <div className="about-img-box">
              <img 
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80" 
                alt="Urban Transit" 
                className="about-banner-img"
              />
            </div>
            <div className="about-card-body">
              <h3 className="card-section-title">{t.storyTitle}</h3>
              <p className="about-text">{t.storyP1}</p>
              <p className="about-text">{t.storyP2}</p>
            </div>
          </div>

          <h3 className="section-group-title">{t.coreValues}</h3>

          {/* Core Values Cards with Pro Images */}
          <div className="values-stack">
            <div className="value-item-card">
              <div className="value-icon-box bg-blue-light">
                <img src="https://cdn-icons-png.flaticon.com/512/684/684908.png" alt="Innovation" className="value-img-icon" />
              </div>
              <div className="value-text">
                <h4 className="value-title">{t.val1Title}</h4>
                <p className="value-desc">{t.val1Desc}</p>
              </div>
            </div>

            <div className="value-item-card">
              <div className="value-icon-box bg-green-light">
                <img src="https://cdn-icons-png.flaticon.com/512/1055/1055646.png" alt="Reliability" className="value-img-icon" />
              </div>
              <div className="value-text">
                <h4 className="value-title">{t.val2Title}</h4>
                <p className="value-desc">{t.val2Desc}</p>
              </div>
            </div>

            <div className="value-item-card">
              <div className="value-icon-box bg-purple-light">
                <img src="https://cdn-icons-png.flaticon.com/512/3300/3300975.png" alt="Community" className="value-img-icon" />
              </div>
              <div className="value-text">
                <h4 className="value-title">{t.val3Title}</h4>
                <p className="value-desc">{t.val3Desc}</p>
              </div>
            </div>
          </div>

        </main>

      </div>
    </div>
  );
};

export default AboutUs;