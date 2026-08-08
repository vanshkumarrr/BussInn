import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/PassengerLiveTracking.css";

const PassengerLiveTracking = () => {
  const navigate = useNavigate();
  const [rideDetails, setRideDetails] = useState({
    startLocation: "Start",
    endLocation: "Destination",
    busDestination: "Terminal E"
  });

  const [stops, setStops] = useState([]);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [sosProgress, setSosProgress] = useState(0);
  
  // Custom Modal State for Early End Confirmation
  const [showEarlyEndModal, setShowEarlyEndModal] = useState(false);

  const sosTimerRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("active_ride_details");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setRideDetails(parsed);

        const generatedStops = [
          parsed.startLocation || "Start Point",
          "Union Square",
          "Central Avenue",
          parsed.endLocation || "Drop Point"
        ];
        if (parsed.busDestination && parsed.busDestination.toLowerCase() !== (parsed.endLocation || "").toLowerCase()) {
          generatedStops.push(parsed.busDestination);
        }
        setStops(generatedStops);
      } catch (e) {
        console.error(e);
      }
    } else {
      setStops(["Pune", "Lonavala", "Mumbai Central", "Terminal E"]);
    }
  }, []);

  // Automatically progress through stops
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStopIndex(prev => {
        if (prev < stops.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          
          // Reached destination naturally -> Award 50 BS Coins
          const currentCoins = parseInt(localStorage.getItem("passenger_coins") || "0", 10);
          localStorage.setItem("passenger_coins", currentCoins + 50);

          setTimeout(() => {
            alert("You have reached your destination! You earned 50 BS Coins.");
            navigate({ to: "/passenger/history" });
          }, 800);
          return prev;
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [stops.length, navigate]);

  const startSosHold = () => {
    setSosProgress(0);
    let elapsed = 0;
    sosTimerRef.current = setInterval(() => {
      elapsed += 100;
      const percent = (elapsed / 3000) * 100;
      setSosProgress(percent);
      if (elapsed >= 3000) {
        clearInterval(sosTimerRef.current);
        window.location.href = "tel:112";
      }
    }, 100);
  };

  const cancelSosHold = () => {
    if (sosTimerRef.current) clearInterval(sosTimerRef.current);
    setSosProgress(0);
  };

  // Manual End Trip check
  const handleEndTripClick = (e) => {
    e.preventDefault();
    const dropPointIndex = stops.length >= 2 ? stops.length - 2 : 0;
    const hasReachedDropPoint = activeStopIndex >= dropPointIndex;

    if (hasReachedDropPoint) {
      // Reached drop point -> award 50 coins & navigate
      const currentCoins = parseInt(localStorage.getItem("passenger_coins") || "0", 10);
      localStorage.setItem("passenger_coins", currentCoins + 50);
      navigate({ to: "/passenger/history" });
    } else {
      // Ended trip early -> Open sleek custom modal instead of browser alert
      setShowEarlyEndModal(true);
    }
  };

  const confirmEarlyEndTrip = () => {
    setShowEarlyEndModal(false);
    navigate({ to: "/passenger/history" });
  };

  return (
    <div className="page mobile-page-container">
      <div className="app-content live-tracking-container">
        
        {/* 70% Height Map Section */}
        <div className="map-view-section">
          <div className="map-placeholder-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80" 
              alt="Live Map" 
              className="map-bg-img"
            />
            <div className="map-marker-pulsing">
              <span className="material-symbols-outlined text-white text-base">navigation</span>
            </div>
          </div>
        </div>

        {/* Scrollable Bottom Sheet with Route & Actions */}
        <div className="tracking-bottom-sheet">
          <div className="sheet-drag-handle"></div>

          {/* Route Stops List */}
          <div className="route-stops-card">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Live Route Progress</h3>
            <div className="route-timeline">
              {stops.map((stop, idx) => {
                const isPassed = idx <= activeStopIndex;
                return (
                  <div 
                    key={idx} 
                    className={`route-stop-row ${isPassed ? "passed-stop" : ""}`}
                  >
                    <div className={`stop-indicator ${isPassed ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-600"}`}>
                      {isPassed ? <span className="material-symbols-outlined text-xs">check</span> : idx + 1}
                    </div>
                    <span className={`text-xs font-bold ${isPassed ? "text-emerald-700" : "text-gray-800"}`}>
                      {stop} {idx === stops.length - 1 ? "(Drop Point)" : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trip Actions Grid */}
          <div className="trip-actions-grid mt-4">
            <div className="trip-action-card">
              <div className="action-icon-blue">
                <span className="material-symbols-outlined">share</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Share Live Status</h4>
                <p className="text-[10px] text-gray-500">Send live link</p>
              </div>
            </div>

            {/* Emergency SOS with 3-sec hold */}
            <div 
              className="trip-action-card sos-card relative overflow-hidden select-none"
              onMouseDown={startSosHold}
              onMouseUp={cancelSosHold}
              onTouchStart={startSosHold}
              onTouchEnd={cancelSosHold}
            >
              <div 
                className="absolute inset-0 bg-red-200/50 pointer-events-none transition-all duration-75" 
                style={{ width: `${sosProgress}%` }}
              ></div>
              <div className="action-icon-red relative z-10">
                <span className="material-symbols-outlined text-white text-sm">sos</span>
              </div>
              <div className="relative z-10">
                <h4 className="text-xs font-bold text-red-700">Emergency SOS</h4>
                <p className="text-[9px] text-red-500 font-semibold">Hold for 3s (Dial 112)</p>
              </div>
            </div>

            <div className="trip-action-card">
              <div className="action-icon-gray">
                <span className="material-symbols-outlined">report_problem</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Report Issue</h4>
                <p className="text-[10px] text-gray-500">Support help</p>
              </div>
            </div>

            <div className="trip-action-card">
              <div className="action-icon-gray">
                <span className="material-symbols-outlined">thumb_up</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">Rate Driver</h4>
                <p className="text-[10px] text-gray-500">Leave feedback</p>
              </div>
            </div>
          </div>

          {/* End Trip Button */}
          <div className="mt-5">
            <button onClick={handleEndTripClick} className="end-trip-btn cursor-pointer w-full">
              <span className="material-symbols-outlined">stop_circle</span>
              End Trip & View History
            </button>
          </div>

        </div>

        {/* Sleek Custom Confirmation Modal for Early Trip Termination */}
        {showEarlyEndModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in duration-200">
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
                <span className="material-symbols-outlined text-3xl">warning</span>
              </div>
              <h3 className="text-lg font-extrabold text-gray-900 mb-2">End Trip Early?</h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-6">
                You haven't reached your drop point yet. Ending this trip now means you will **not** earn your 50 BS Coins reward.
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  type="button" 
                  onClick={() => setShowEarlyEndModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Continue Trip
                </button>
                <button 
                  type="button" 
                  onClick={confirmEarlyEndTrip}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  End Anyway
                </button>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default PassengerLiveTracking;