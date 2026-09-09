import LiveBusMap from "../../components/LiveBusMap";
import { supabase } from "../../lib/supabase";
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
  const [liveLocation, setLiveLocation] = useState(null);
  const [isStuckInTraffic, setIsStuckInTraffic] = useState(false);

  useEffect(() => {
  const loadBus = async () => {
    const fetchedBus = await getBus(busId);
    setBus(fetchedBus);
  };

  loadBus();

  const trafficTimer = setTimeout(() => {
    setIsStuckInTraffic(true);
  }, 5000);

  return () => clearTimeout(trafficTimer);
}, [busId]);

// Load and subscribe to driver's live GPS
useEffect(() => {
  if (!busId) return;

  const loadLiveLocation = async () => {
    const { data, error } = await supabase
      .from("live_locations")
      .select("latitude, longitude, speed, heading, updated_at")
      .eq("bus_id", busId)
      .maybeSingle();

    if (error) {
      console.error("Error loading live location:", error);
      return;
    }

    if (data) {
      setLiveLocation(data);
    }
  };

  loadLiveLocation();

  const channel = supabase
    .channel(`passenger-bus-${busId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "live_locations",
        filter: `bus_id=eq.${busId}`,
      },
      (payload) => {
        console.log("PASSENGER LIVE GPS:", payload);

        if (payload.new) {
          setLiveLocation({
            latitude: payload.new.latitude,
            longitude: payload.new.longitude,
            speed: payload.new.speed,
            heading: payload.new.heading,
            updated_at: payload.new.updated_at,
          });
        }
      }
    )
    .subscribe((status) => {
      console.log("Passenger GPS realtime:", status);
    });

  return () => {
    supabase.removeChannel(channel);
  };
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
 // Find which route stop is currently closest to the bus.
let nearestStopIndex = -1;

if (liveLocation?.latitude && liveLocation?.longitude) {
  let shortestDistance = Infinity;

  rawStops.forEach((stop, index) => {
    if (typeof stop === "string") {
      return;
    }

    const stopLatitude = Number(stop.latitude);
    const stopLongitude = Number(stop.longitude);

    // Ignore stops that don't have valid coordinates.
    if (!stopLatitude || !stopLongitude) {
      return;
    }

    const latitudeDifference =
      Number(liveLocation.latitude) - stopLatitude;

    const longitudeDifference =
      Number(liveLocation.longitude) - stopLongitude;

    // Simple distance calculation for nearby route stops.
    const distance =
      latitudeDifference * latitudeDifference +
      longitudeDifference * longitudeDifference;

    if (distance < shortestDistance) {
      shortestDistance = distance;
      nearestStopIndex = index;
    }
    });

  console.log("STOP PROGRESS DEBUG:", {
    liveLocation,
    nearestStopIndex,
    stops: rawStops.map((stop, index) => ({
      index,
      name: typeof stop === "string" ? stop : stop.name,
      latitude: typeof stop === "string" ? null : stop.latitude,
      longitude: typeof stop === "string" ? null : stop.longitude,
    })),
  });
}

// Normalize stops and calculate their live progress.

   const stopsList = rawStops.map((stop, i) => {
  if (typeof stop === "string") {
    return {
      name: stop,
      time:
        i === 0
          ? bus.startTime || "22:00"
          : i === rawStops.length - 1
            ? bus.arrivalTime || "05:15"
            : "In Transit",
      latitude: null,
      longitude: null,
      crossed:
        nearestStopIndex >= 0
          ? i <= nearestStopIndex
          : false,
    };
  }

  return {
    name: stop.name || "",
    time: stop.time || "22:00",
    latitude: Number(stop.latitude) || 0,
    longitude: Number(stop.longitude) || 0,
    crossed:
      nearestStopIndex >= 0
        ? i <= nearestStopIndex
        : false,
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
  <LiveBusMap
    latitude={liveLocation?.latitude}
    longitude={liveLocation?.longitude}
    busNumber={bus.name || `Bus #${busId}`}
  />
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