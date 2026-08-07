import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import "../../styles/DriverSetup.css";

const DriverSetup = () => {
  const navigate = useNavigate();
  
  // 1. Global Language State (Reads from localStorage, persists across app)
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  // Form State
  const [departurePoint, setDeparturePoint] = useState("");
  const [destinationPoint, setDestinationPoint] = useState("");
  const [stops, setStops] = useState([""]); 
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [error, setError] = useState("");

  // Translation Dictionary
  const content = {
    en: {
      title: "Driver Setup",
      subtitle: "Configure your route details before starting your shift.",
      departureLabel: "Departure Point",
      departurePlaceholder: "Starts from...",
      destinationLabel: "Destination Point",
      destinationPlaceholder: "Ends at...",
      stopsLabel: "Bus Route / Stops",
      stopsHint: "(e.g., places where the bus usually stops)",
      stopPlaceholder: "Search or enter stop...",
      addStopBtn: "+ Add Stop",
      startTimeLabel: "Shift Start Time",
      endTimeLabel: "Shift End Time",
      continueBtn: "Continue",
      errorMsg: "Please fill in all details and route stops to continue.",
      note: "Note: Continue is only available within ±30 minutes of your scheduled start time."
    },
    hi: {
      title: "ड्राइवर सेटअप",
      subtitle: "अपनी शिफ्ट शुरू करने से पहले अपने मार्ग का विवरण कॉन्फ़िगर करें।",
      departureLabel: "प्रस्थान बिंदु",
      departurePlaceholder: "यहाँ से शुरू करें...",
      destinationLabel: "गंतव्य बिंदु",
      destinationPlaceholder: "यहाँ समाप्त करें...",
      stopsLabel: "बस मार्ग / स्टॉप",
      stopsHint: "(उदाहरण: वे स्थान जहाँ बस आमतौर पर रुकती है)",
      stopPlaceholder: "स्टॉप खोजें या दर्ज करें...",
      addStopBtn: "+ स्टॉप जोड़ें",
      startTimeLabel: "शिफ्ट शुरू होने का समय",
      endTimeLabel: "शिफ्ट समाप्त होने का समय",
      continueBtn: "जारी रखें",
      errorMsg: "कृपया आगे बढ़ने के लिए सभी विवरण और मार्ग स्टॉप भरें।",
      note: "नोट: जारी रखें केवल आपके निर्धारित समय से ±30 मिनट के भीतर उपलब्ध है।"
    }
  };

  const t = isHindi ? content.hi : content.en;

  // Stop Handlers
  const handleAddStop = () => {
    setStops([...stops, ""]);
    if (error) setError("");
  };

  const handleStopChange = (index, value) => {
    const newStops = [...stops];
    newStops[index] = value;
    setStops(newStops);
    if (error) setError("");
  };

  const handleRemoveStop = (index) => {
    const newStops = stops.filter((_, i) => i !== index);
    setStops(newStops);
  };

  const handleContinue = () => {
    // Validation: Check if main fields are filled
    if (!departurePoint.trim() || !destinationPoint.trim() || !startTime || !endTime) {
      setError(t.errorMsg);
      return;
    }

    // Validation: Check if any added stop is empty
    const hasEmptyStops = stops.some(stop => !stop.trim());
    if (hasEmptyStops && stops.length > 0) {
      setError(t.errorMsg);
      return;
    }
    
    setError("");
    
    // Save configuration data for the dashboard
    const driverRouteData = {
      driverName: localStorage.getItem("bussinn_signup_name") || "Driver",
      departure: departurePoint,
      destination: destinationPoint,
      stops: stops.filter(s => s.trim() !== ""),
      startTime: startTime,
      endTime: endTime,
      routeCode: "RTE-" + Math.floor(10 + Math.random() * 90) + "A"
    };

    localStorage.setItem("driver_route_config", JSON.stringify(driverRouteData));
    
    navigate({ to: "/driver/dashboard" });
  };

  return (
    <div className="mobile-page-container">
      <div className="app-content driver-layout">
        
        {/* Top Navigation */}
        <header className="driver-header">
          <div className="brand-info">
            <svg className="bus-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
            </svg>
            <span className="brand-name">BussInn</span>
          </div>
          
          {/* Global Language Toggle Button */}
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

        {/* Setup Card */}
        <div className="setup-card">
          <div className="card-header">
            <div className="icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18a2 2 0 100-4 2 2 0 000 4z" />
                <path d="M18 10a2 2 0 100-4 2 2 0 000 4z" />
                <path d="M6 14V8a2 2 0 012-2h4a2 2 0 012 2v4a2 2 0 002 2h2" />
              </svg>
            </div>
            <h1 className="card-title">{t.title}</h1>
            <p className="card-subtitle">{t.subtitle}</p>
          </div>

          <form className="setup-form" onSubmit={(e) => e.preventDefault()}>
            
            {/* Departure Point */}
            <div className="form-group">
              <label className="form-label">{t.departureLabel}</label>
              <div className="input-box">
                <svg className="input-icon" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="5" stroke="#ff9800" strokeWidth="3" fill="none" />
                </svg>
                <input 
                  type="text" 
                  placeholder={t.departurePlaceholder}
                  value={departurePoint}
                  onChange={(e) => { setDeparturePoint(e.target.value); setError(""); }}
                />
              </div>
            </div>

            {/* Dynamic Stops Section */}
            <div className="form-group stops-section">
              <div className="stops-header">
                <label className="form-label">
                  {t.stopsLabel} <span className="stops-hint">{t.stopsHint}</span>
                </label>
              </div>
              
              <div className="stops-list">
                {stops.map((stop, index) => (
                  <div key={index} className="stop-item">
                    <div className="stop-node"></div>
                    <div className="input-box stop-input-box">
                      <input 
                        type="text" 
                        placeholder={t.stopPlaceholder}
                        value={stop}
                        onChange={(e) => handleStopChange(index, e.target.value)}
                      />
                      <button 
                        type="button" 
                        className="btn-remove-stop"
                        onClick={() => handleRemoveStop(index)}
                        title="Remove Stop"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button type="button" className="btn-add-stop" onClick={handleAddStop}>
                {t.addStopBtn}
              </button>
            </div>

            {/* Destination Point */}
            <div className="form-group">
              <label className="form-label">{t.destinationLabel}</label>
              <div className="input-box">
                <svg className="input-icon" viewBox="0 0 24 24" fill="#d32f2f">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <input 
                  type="text" 
                  placeholder={t.destinationPlaceholder}
                  value={destinationPoint}
                  onChange={(e) => { setDestinationPoint(e.target.value); setError(""); }}
                />
              </div>
            </div>

            <div className="time-group">
              {/* Start Time */}
              <div className="form-group flex-1">
                <label className="form-label">{t.startTimeLabel}</label>
                <div className="input-box">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => { setStartTime(e.target.value); setError(""); }}
                  />
                </div>
              </div>

              {/* End Time */}
              <div className="form-group flex-1">
                <label className="form-label">{t.endTimeLabel}</label>
                <div className="input-box">
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l3 3" />
                  </svg>
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => { setEndTime(e.target.value); setError(""); }}
                  />
                </div>
              </div>
            </div>

            {error && <p className="setup-error">{error}</p>}

            <button type="button" className="action-btn" onClick={handleContinue}>
              <svg viewBox="0 0 24 24" fill="currentColor" className="play-icon">
                <path d="M8 5v14l11-7z" />
              </svg>
              {t.continueBtn}
            </button>

            <p className="footer-note">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" />
                <path d="M12 8h.01" />
              </svg>
              {t.note}
            </p>

          </form>
        </div>

      </div>
    </div>
  );
};

export default DriverSetup;