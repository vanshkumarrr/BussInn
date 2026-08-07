import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import DriverBottomNav from "../../components/DriverBottomNav";
import "../../styles/DriverLiveTracking.css";

const DriverLiveTracking = () => {
  const navigate = useNavigate();

  // 1. Global Language State
  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  // 2. Load Active Route Data
  const [routeInfo, setRouteInfo] = useState({
    departure: "Central Station",
    destination: "North Terminal",
    routeCode: "RTE-42A",
    stops: []
  });

  // Track current active stop index (Backend will drive this later)
  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  useEffect(() => {
    const savedConfig = localStorage.getItem("driver_route_config");
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setRouteInfo(parsed);
      } catch (e) {
        console.error("Error loading route info", e);
      }
    }

    // TODO: [FRONTEND/BACKEND INTEGRATION]
    // Initialize Google Maps / Mapbox instance here.
    // Use navigator.geolocation.watchPosition() to stream coordinates to backend via Socket.IO.
    // Example:
    // const watchId = navigator.geolocation.watchPosition((position) => {
    //   const { latitude, longitude } = position.coords;
    //   socket.emit("update-driver-location", { latitude, longitude, routeCode: routeInfo.routeCode });
    // });
    // return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const content = {
    en: {
      title: "Live Route Tracking",
      subtext: "Broadcasting live bus location to passengers...",
      endTripBtn: "End Trip",
      routeDetailsTitle: "Route & Stop Progress",
      departureLabel: "Departure",
      destinationLabel: "Destination",
      stopPassed: "Passed",
      currentActive: "Current Stop",
      upcoming: "Upcoming"
    },
    hi: {
      title: "लाइव रूट ट्रैकिंग",
      subtext: "यात्रियों को बस की लाइव लोकेशन दिखाई जा रही है...",
      endTripBtn: "यात्रा समाप्त करें",
      routeDetailsTitle: "रूट और स्टॉप प्रगति",
      departureLabel: "प्रस्थान",
      destinationLabel: "गंतव्य",
      stopPassed: "पार कर लिया",
      currentActive: "वर्तमान स्टॉप",
      upcoming: "आगामी"
    }
  };

  const t = isHindi ? content.hi : content.en;

  // Combine departure, intermediate stops, and destination into a single chronological array
  const allStops = [
    { name: routeInfo.departure, type: "departure" },
    ...routeInfo.stops.map(s => ({ name: s, type: "intermediate" })),
    { name: routeInfo.destination, type: "destination" }
  ];

  return (
    <div className="mobile-page-container">
      <div className="app-content tracking-layout">
        
        {/* Header */}
        <header className="dash-header">
          <h1 className="brand-title">BussInn</h1>
          <button className="btn-lang-pill" onClick={toggleLanguage}>
            <svg viewBox="0 0 24 24" fill="currentColor" className="icon-small">
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            EN / HI
          </button>
        </header>

        {/* SECTION 1: Map View taking ~70% of initial screen height */}
        <div className="map-viewport-section">
          <div className="map-overlay-badge">
            <span className="live-pulsing-dot"></span>
            <span>{routeInfo.routeCode} • Live</span>
          </div>

          {/* 
            TODO: [MAP INTEGRATION AREA]
            Replace or embed your real Google Maps / Mapbox component here.
            If using an image placeholder for now, it scales dynamically inside this viewport.
          */}
          <div className="map-canvas-placeholder">
            <div className="map-mock-grid"></div>
            <div className="bus-marker-pin">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
              </svg>
              <div className="marker-pulse"></div>
            </div>
            <span className="map-watermark">Interactive Map Container (70% Screen)</span>
          </div>

          <div className="map-bottom-sheet-handle">
            <span></span>
            <p>Scroll down for route & stops</p>
          </div>
        </div>

        {/* SECTION 2: Scrollable Route Progress & Details */}
        <div className="route-details-scroll-section">
          <div className="section-title-row">
            <h3 className="section-heading">{t.routeDetailsTitle}</h3>
            <span className="route-code-pill">{routeInfo.routeCode}</span>
          </div>

          {/* Dynamic Stops Progress Timeline */}
          <div className="live-timeline">
            {allStops.map((stop, index) => {
              const isPassed = index < currentStopIndex;
              const isCurrent = index === currentStopIndex;
              
              return (
                <div 
                  key={index} 
                  className={`live-timeline-node-item ${isPassed ? 'passed' : ''} ${isCurrent ? 'active' : ''}`}
                >
                  <div className="node-marker-wrapper">
                    <div className="node-dot"></div>
                    {index < allStops.length - 1 && <div className="node-line"></div>}
                  </div>
                  
                  <div className="node-content-box">
                    <div className="node-top-row">
                      <h4 className="stop-title-text">{stop.name}</h4>
                      <span className={`stop-status-tag ${isCurrent ? 'tag-active' : ''}`}>
                        {isPassed ? t.stopPassed : isCurrent ? t.currentActive : t.upcoming}
                      </span>
                    </div>
                    <span className="stop-type-subtext">
                      {stop.type === 'departure' ? t.departureLabel : stop.type === 'destination' ? t.destinationLabel : `Stop ${index}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* End Trip Action */}
          <div className="tracking-bottom-actions">
            <button 
              onClick={() => navigate({ to: "/driver/recent-trips" })} 
              className="btn-end-trip-action"
            >
              {t.endTripBtn}
            </button>
          </div>
        </div>

        <div className="bottom-nav-placeholder">
          <DriverBottomNav />
        </div>

      </div>
    </div>
  );
};

export default DriverLiveTracking;