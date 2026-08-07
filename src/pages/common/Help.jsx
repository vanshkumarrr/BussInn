import { useState, useEffect } from "react";
import BackButton from "../../components/BackButton";
import "../../styles/Help.css";

const Help = () => {
  const [isHindi, setIsHindi] = useState(false);

  // Safe client-side local storage synchronization
  useEffect(() => {
    const savedLang = localStorage.getItem("bussinn_lang");
    if (savedLang === "hi") {
      setIsHindi(true);
    }
  }, []);

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  useEffect(() => {
    const savedName = localStorage.getItem("bussinn_signup_name");
    if (savedName) {
      setFormData(prev => ({ ...prev, name: savedName }));
    }
  }, []);

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert(isHindi ? "कृपया सभी फ़ील्ड भरें।" : "Please fill in all required fields.");
      return;
    }

    // TODO [DATABASE]: Send support query payload to backend database API endpoint
    // await axios.post('/api/driver/support', formData);

    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData(prev => ({ ...prev, message: "" }));
  };

  const content = {
    en: {
      title: "Help And Support",
      callUs: "Call Us",
      emailUs: "Email Us",
      chat: "Chat",
      quickContact: "Quick Contact",
      nameLabel: "Name*",
      namePlaceholder: "Enter Full Name Here",
      emailLabel: "Email*",
      emailPlaceholder: "Enter Email Address",
      msgLabel: "Message*",
      msgPlaceholder: "Enter Message",
      sendBtn: "Send →",
      successMsg: "Message sent successfully! Our support team will reach out soon.",
      address: "1289 Mount Zion Rd,\nFalkville,\nAL, 35622, United States",
      phone: "+1 XXXXX 12345",
      emailAddr: "Support@gmail.com"
    },
    hi: {
      title: "सहायता और समर्थन",
      callUs: "कॉल करें",
      emailUs: "ईमेल करें",
      chat: "चैट",
      quickContact: "त्वरित संपर्क",
      nameLabel: "नाम*",
      namePlaceholder: "पूरा नाम दर्ज करें",
      emailLabel: "ईमेल*",
      emailPlaceholder: "ईमेल पता दर्ज करें",
      msgLabel: "संदेश*",
      msgPlaceholder: "संदेश दर्ज करें",
      sendBtn: "भेजें →",
      successMsg: "संदेश सफलतापूर्वक भेजा गया! हमारी सहायता टीम जल्द संपर्क करेगी।",
      address: "1289 माउंट ज़ायोनी रोड,\nफाल्केविल,\nAL, 35622, संयुक्त राज्य अमेरिका",
      phone: "+1 XXXXX 12345",
      emailAddr: "Support@gmail.com"
    }
  };

  const t = isHindi ? content.hi : content.en;

  return (
    <div className="page mobile-page-container">
      <div className="app-content help-layout">
        
        {/* Header without Profile Photo */}
        <header className="dash-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BackButton fallback="/driver/profile" />
            <h1 className="brand-title">{t.title}</h1>
          </div>
          <div className="header-right-group">
            <button className="btn-lang-pill" onClick={toggleLanguage}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
              </svg>
              EN / HI
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="help-content">
          
          {/* Top 3 Action Cards */}
          <div className="action-cards-grid">
            <a href="tel:+1234567890" className="action-card">
              <div className="action-icon-circle bg-orange-light">
                <img src="https://cdn-icons-png.flaticon.com/512/724/724664.png" alt="Call" className="action-img-icon" />
              </div>
              <span className="action-label text-orange">{t.callUs}</span>
            </a>

            <a href="mailto:Support@gmail.com" className="action-card">
              <div className="action-icon-circle bg-green-light">
                <img src="https://cdn-icons-png.flaticon.com/512/542/542638.png" alt="Email" className="action-img-icon" />
              </div>
              <span className="action-label text-green">{t.emailUs}</span>
            </a>

            <div className="action-card" onClick={() => alert(isHindi ? "लाइव चैट जल्द उपलब्ध होगी!" : "Live chat support coming soon!")}>
              <div className="action-icon-circle bg-purple-light">
                <img src="https://cdn-icons-png.flaticon.com/512/134/134914.png" alt="Chat" className="action-img-icon" />
              </div>
              <span className="action-label text-purple">{t.chat}</span>
            </div>
          </div>

          {/* Quick Contact Form Card */}
          <div className="quick-contact-card">
            <h3 className="card-heading">{t.quickContact}</h3>

            {submitted && <div className="success-banner">{t.successMsg}</div>}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="input-group">
                <label className="input-label">{t.nameLabel}</label>
                <input 
                  type="text" 
                  className="text-input"
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t.emailLabel}</label>
                <input 
                  type="email" 
                  className="text-input"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="input-group">
                <label className="input-label">{t.msgLabel}</label>
                <textarea 
                  className="textarea-input"
                  placeholder={t.msgPlaceholder}
                  rows="3"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                ></textarea>
              </div>

              <button type="submit" className="btn-send-primary">
                {t.sendBtn}
              </button>
            </form>
          </div>

          {/* Address & Info Card */}
          <div className="address-card">
            <div className="address-text-col">
              <p className="address-lines">{t.address}</p>
              <p className="address-phone">{t.phone}</p>
              <a href="mailto:Support@gmail.com" className="address-email">{t.emailAddr}</a>
            </div>
            <div className="building-icon-box">
              <img src="https://cdn-icons-png.flaticon.com/512/3050/3050475.png" alt="Office" className="building-img" />
            </div>
          </div>

        </main>

      </div>
    </div>
  );
};

export default Help;