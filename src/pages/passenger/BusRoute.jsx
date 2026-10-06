import { useEffect, useState } from "react";
import { useParams, Link, useSearch } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import { getBus } from "../../lib/store";
import "../../styles/BusRoute.css";

const BusRoute = () => {
  const { busId } = useParams({ from: "/passenger/route/$busId" });
  
  const searchParams = useSearch({ strict: false });
  const searchFrom = searchParams?.from || "Pune";
  const searchTo = searchParams?.to || "Mumbai";

  const [bus, setBus] = useState(null);
  const [isStuckInTraffic, setIsStuckInTraffic] = useState(false);

  useEffect(() => {
    const fetchedBus = getBus(busId);
    setBus(fetchedBus);

    const trafficTimer = setTimeout(() => {
      setIsStuckInTraffic(true);
    }, 5000);

    return () => clearTimeout(trafficTimer);
  }, [busId]);

  if (!bus) {
    return (
      <div className="page mobile-page-container">
        <div className="app-content route-layout-empty">
          <p className="empty">This bus is no longer available.</p>
          <Link to="/passenger/results" search={{ from: searchFrom, to: searchTo }} className="btn-back-results">Back to results</Link>
          <PassengerBottomNav />
        </div>
      </div>
    );
  }

  // Use the unique stops data specific to this bus instance from store
  const rawStops = bus.stops || bus.routeStops || [
    { name: searchFrom, time: bus.startTime || "22:00" },
    { name: searchTo, time: bus.arrivalTime || "05:15" }
  ];

  // Normalize stops format to ensure name and time are read cleanly
  const stopsList = rawStops.map((stop, i) => {
    if (typeof stop === "string") {
      return {
        name: stop,
        time: i === 0 ? (bus.startTime || "22:00") : (i === rawStops.length - 1 ? (bus.arrivalTime || "05:15") : "In Transit"),
        crossed: i < 2
      };
    }
    return {
      name: stop.name || stop,
      time: stop.time || "22:00",
      crossed: stop.crossed !== undefined ? stop.crossed : i < 2
    };
  });

  return (
    <div className="page mobile-page-container">
      <div className="app-content bus-route-live-container">
        
        <div className="route-top-header-overlay">
          <Link to="/passenger/results" search={{ from: searchFrom, to: searchTo }} className="back-circle-btn" title="Back to results">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <div className="route-header-title-box">
            <h1>{bus.name || `Bus #${busId}`}</h1>
            <span>{searchFrom} ➔ {searchTo}</span>
          </div>
        </div>

        {isStuckInTraffic && (
          <div className="traffic-alert-banner">
            <span className="material-symbols-outlined traffic-icon">warning</span>
            <div className="traffic-text-group">
              <strong>Delay Alert!</strong>
              <p>Bus got stuck in traffic. ETA updated.</p>
            </div>
            <button onClick={() => setIsStuckInTraffic(false)} className="alert-close-btn">✕</button>
          </div>
        )}

        <div className="map-viewport-section">
          <div className="map-placeholder-bg">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&auto=format&fit=crop&q=80" 
              alt="Live Map View" 
              className="map-mock-img"
            />
            <div className="live-bus-map-pin">
              <span className="material-symbols-outlined pin-icon">directions_bus</span>
              <span className="pin-pulse"></span>
            </div>
          </div>
        </div>

        <div className="route-bottom-sheet">
          <div className="sheet-drag-handle"></div>

          <div className="eta-live-card">
            <div className="eta-left">
              <span className="eta-title">Estimated Arrival</span>
              <span className="eta-time-highlight">{bus.eta || "12 mins"}</span>
            </div>
            <div className="eta-right">
              <span className="material-symbols-outlined text-green-600">schedule</span>
              <span className="duration-label">{bus.duration || "7h 15m total"}</span>
            </div>
          </div>

          <h3 className="stops-heading">Route Stops Sequence</h3>

          <div className="stops-timeline-list">
            {stopsList.map((stop, i) => {
              const isCrossed = stop.crossed;

              return (
                <div key={i} className={`timeline-stop-row ${isCrossed ? "crossed" : "upcoming"}`}>
                  <div className="timeline-indicator-col">
                    <div className={`stop-dot-indicator ${isCrossed ? "green" : "gray"}`}>
                      {isCrossed && <span className="material-symbols-outlined check-icon">check</span>}
                    </div>
                    {i < stopsList.length - 1 && <div className={`timeline-connector-line ${isCrossed ? "green" : "gray"}`}></div>}
                  </div>

                  <div className="stop-details-col">
                    <span className="stop-name-text">{stop.name}</span>
                    <span className="stop-time-text">{stop.time}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BusRoute;