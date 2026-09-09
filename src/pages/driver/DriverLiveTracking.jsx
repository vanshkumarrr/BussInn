import { useState, useEffect, lazy, Suspense } from "react";
import { useNavigate, ClientOnly } from "@tanstack/react-router";
import { supabase } from "../../lib/supabase";
import DriverBottomNav from "../../components/DriverBottomNav";

import "../../styles/DriverLiveTracking.css";

const LiveBusMap = lazy(() => import("../../components/LiveBusMap"));

const BUS_ID = "f8ec827b-e720-4ba7-bb4f-d2c938b6e32f";

const DriverLiveTracking = () => {
  const navigate = useNavigate();

  const [isHindi, setIsHindi] = useState(() => {
    return localStorage.getItem("bussinn_lang") === "hi";
  });

  const toggleLanguage = () => {
    const newLangState = !isHindi;
    setIsHindi(newLangState);
    localStorage.setItem("bussinn_lang", newLangState ? "hi" : "en");
  };

  const [routeInfo, setRouteInfo] = useState({
    departure: "Central Station",
    destination: "North Terminal",
    routeCode: "RTE-42A",
    stops: []
  });

  const [currentStopIndex, setCurrentStopIndex] = useState(0);

  const [driverLocation, setDriverLocation] = useState({
    latitude: 28.6139,
    longitude: 77.2090
  });

  const [gpsStatus, setGpsStatus] = useState("Waiting for GPS...");

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

    if (!navigator.geolocation) {
      setGpsStatus("GPS is not supported by this browser");
      return;
    }

    setGpsStatus("Getting your location...");

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const {
          latitude,
          longitude,
          speed,
          heading
        } = position.coords;

        setDriverLocation({
          latitude,
          longitude
        });

        setGpsStatus("GPS Active");

        const speedKmh =
          speed == null ? 0 : Math.max(0, speed * 3.6);

        console.log("DRIVER GPS:", {
          latitude,
          longitude,
          speedKmh,
          heading
        });

        const { error } = await supabase
          .from("live_locations")
          .upsert(
            {
              bus_id: BUS_ID,
              latitude,
              longitude,
              speed: speedKmh,
              heading: heading ?? 0,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: "bus_id"
            }
          );

        if (error) {
  console.error("GPS upload failed:", {
    message: error?.message,
    details: error?.details,
    hint: error?.hint,
    code: error?.code,
    status: error?.status,
  });

  setGpsStatus("GPS active • Upload failed");
} else {
  console.log("GPS uploaded successfully");
  setGpsStatus("GPS Active • Live");
}
      },
      (error) => {
        console.error("GPS Error:", error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsStatus("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsStatus("Location unavailable");
            break;
          case error.TIMEOUT:
            setGpsStatus("GPS timeout");
            break;
          default:
            setGpsStatus("GPS error");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
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

  const allStops = [
    { name: routeInfo.departure, type: "departure" },
    ...routeInfo.stops.map((s) => ({
      name: s,
      type: "intermediate"
    })),
    { name: routeInfo.destination, type: "destination" }
  ];

  return (
    <div className="mobile-page-container">
      <div className="app-content tracking-layout">

        <header className="dash-header">
          <h1 className="brand-title">BussInn</h1>

          <button
            className="btn-lang-pill"
            onClick={toggleLanguage}
          >
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="icon-small"
            >
              <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
            </svg>
            EN / HI
          </button>
        </header>

        <div className="map-viewport-section">

          <div className="map-overlay-badge">
            <span className="live-pulsing-dot"></span>
            <span>
              {routeInfo.routeCode} • {gpsStatus}
            </span>
          </div>

          <div className="map-canvas-placeholder">
            <ClientOnly fallback={<div>Loading map...</div>}>
              <Suspense fallback={<div>Loading map...</div>}>
                <LiveBusMap
                  latitude={driverLocation.latitude}
                  longitude={driverLocation.longitude}
                  busNumber={routeInfo.routeCode}
                />
              </Suspense>
            </ClientOnly>
          </div>

          <div className="map-bottom-sheet-handle">
            <span></span>
            <p>Scroll down for route & stops</p>
          </div>
        </div>

        <div className="route-details-scroll-section">

          <div className="section-title-row">
            <h3 className="section-heading">
              {t.routeDetailsTitle}
            </h3>

            <span className="route-code-pill">
              {routeInfo.routeCode}
            </span>
          </div>

          <div className="live-timeline">

            {allStops.map((stop, index) => {

              const isPassed = index < currentStopIndex;
              const isCurrent = index === currentStopIndex;

              return (
                <div
                  key={index}
                  className={`live-timeline-node-item ${
                    isPassed ? "passed" : ""
                  } ${
                    isCurrent ? "active" : ""
                  }`}
                >

                  <div className="node-marker-wrapper">
                    <div className="node-dot"></div>

                    {index < allStops.length - 1 && (
                      <div className="node-line"></div>
                    )}
                  </div>

                  <div className="node-content-box">

                    <div className="node-top-row">

                      <h4 className="stop-title-text">
                        {stop.name}
                      </h4>

                      <span
                        className={`stop-status-tag ${
                          isCurrent ? "tag-active" : ""
                        }`}
                      >
                        {isPassed
                          ? t.stopPassed
                          : isCurrent
                            ? t.currentActive
                            : t.upcoming}
                      </span>

                    </div>

                    <span className="stop-type-subtext">
                      {stop.type === "departure"
                        ? t.departureLabel
                        : stop.type === "destination"
                          ? t.destinationLabel
                          : `Stop ${index}`}
                    </span>

                  </div>
                </div>
              );
            })}

          </div>

          <div className="tracking-bottom-actions">

            <button
              onClick={() =>
                navigate({
                  to: "/driver/recent-trips"
                })
              }
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
