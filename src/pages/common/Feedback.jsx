import { useState } from "react";
import { Link, useRouterState, useSearch } from "@tanstack/react-router";
import "../../styles/Feedback.css";

const Feedback = () => {
  // 1. Global Language State
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  // 2. Read search params from TanStack router (e.g. ?from=driver)
  const searchParams = useSearch({ strict: false });
  
  // Check if we came from the driver section via search query OR pathname
  const routerState = useRouterState();
  const currentPath = routerState?.location?.pathname || "";
  
  const isDriverSection = 
    searchParams?.from === "driver" || 
    currentPath.startsWith("/driver");

  const profileDestination = isDriverSection ? "/driver/profile" : "/passenger/profile";

  // 3. Feedback Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert(isHindi ? "कृपया कुछ प्रतिक्रिया दर्ज करें।" : "Please enter some feedback comments.");
      return;
    }

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
          <Link to={profileDestination} className="close-text-btn">
            ✕ {t.close}
          </Link>
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
                  <span className="emoji-symbol">{item.symbol}</span>
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
          <button className="btn-send-feedback" onClick={handleSubmit} type="button">
            {t.sendBtn}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Feedback;