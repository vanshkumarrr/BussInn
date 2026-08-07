import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import BackButton from "../../components/BackButton";
import "../../styles/Feedback.css";

const Feedback = () => {
  // 1. Global Language State
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  // 2. Feedback Form State
  const [rating, setRating] = useState(5); // Default to best emoji (1 to 5)
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [avatar, setAvatar] = useState("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80");

  useEffect(() => {
    const savedAvatar = localStorage.getItem("driver_profile_avatar");
    if (savedAvatar) setAvatar(savedAvatar);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert(isHindi ? "कृपया कुछ प्रतिक्रिया दर्ज करें।" : "Please enter some feedback comments.");
      return;
    }

    // TODO [DATABASE]: Submit feedback payload to backend database API endpoint
    // const feedbackPayload = { rating, comment, timestamp: new Date().toISOString() };
    // await axios.post('/api/driver/feedback', feedbackPayload);

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setComment("");
    }, 4000);
  };

  const content = {
    en: {
      close: "CLOSE",
      title: "Send us your Feedback!",
      subtitle: "Tell us about your experience and leave a comment",
      placeholder: "Leave me some suggestion, doubt or claim to improve :)",
      sendBtn: "SEND FEEDBACK",
      successMsg: "Thank you! Your feedback has been submitted successfully."
    },
    hi: {
      close: "बंद करें",
      title: "हमें अपनी प्रतिक्रिया भेजें!",
      subtitle: "अपने अनुभव के बारे में बताएं और एक टिप्पणी छोड़ें",
      placeholder: "सुधार के लिए कोई सुझाव, शंका या दावा छोड़ें :)",
      sendBtn: "प्रतिक्रिया भेजें",
      successMsg: "धन्यवाद! आपकी प्रतिक्रिया सफलतापूर्वक भेज दी गई है।"
    }
  };

  const t = isHindi ? content.hi : content.en;

  // Emoji options mapped from 1 (worst) to 5 (best)
  const emojis = [
    { level: 1, symbol: "😫", label: "Very Bad" },
    { level: 2, symbol: "🙁", label: "Bad" },
    { level: 3, symbol: "😐", label: "Neutral" },
    { level: 4, symbol: "😊", label: "Good" },
    { level: 5, symbol: "🤩", label: "Excellent" }
  ];

  return (
    <div className="page mobile-page-container">
      <div className="app-content feedback-layout">
        
        {/* Top Header */}
        <header className="dash-header">
          <Link to="/driver/profile" className="close-text-btn">
            ✕ {t.close}
          </Link>
          
          <div className="header-right-group">
            <button className="btn-lang-pill" onClick={toggleLanguage}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
                <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
              </svg>
              EN / HI
            </button>
            <div className="profile-avatar-mini">
              <img src={avatar} alt="Avatar" />
            </div>
          </div>
        </header>

        {/* Main Feedback Content */}
        <main className="feedback-content">
          
          <div className="feedback-card">
            <h2 className="feedback-title">
              {isHindi ? "हमें अपनी " : "Send us your "}
              <span className="text-primary">{isHindi ? "प्रतिक्रिया भेजें!" : "Feedback!"}</span> 😊
            </h2>
            <p className="feedback-sub">{t.subtitle}</p>

            {submitted && <div className="success-banner">{t.successMsg}</div>}

            {/* Emoji Rating Row */}
            <div className="emoji-rating-row">
              {emojis.map((item) => (
                <button
                  key={item.level}
                  type="button"
                  className={`emoji-btn ${rating === item.level ? "active" : ""}`}
                  onClick={() => setRating(item.level)}
                  title={item.label}
                >
                  {item.symbol}
                </button>
              ))}
            </div>

            {/* Comment Textarea */}
            <div className="feedback-textarea-box">
              <textarea 
                className="feedback-textarea"
                placeholder={t.placeholder}
                rows="4"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
            </div>
          </div>

        </main>

        {/* Footer Action Button */}
        <div className="feedback-footer-action">
          <button className="btn-send-feedback" onClick={handleSubmit}>
            {t.sendBtn}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Feedback;