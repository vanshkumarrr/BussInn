import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import {
  BusFront,
  CalendarDays,
  Navigation,
  Route as RouteIcon,
  X,
} from "lucide-react";

import PassengerBottomNav from "../../components/PassengerBottomNav";
import { supabase } from "../../lib/supabase";
import "../../styles/LiveBusResults.css";

const ORDINARY_BUS_IMAGE =
  "https://www.onlineupsrtc.co.in/assets/icons/Ordinary.png";

const AC_BUS_IMAGE =
  "https://www.onlineupsrtc.co.in/assets/icons/bus_ac_janrath_2x2.png";

const DEMO_STOPS = [
  { id: "demo-s", stop_order: 1, station_name: "Stop S" },
  { id: "demo-a", stop_order: 2, station_name: "Stop A" },
  { id: "demo-b", stop_order: 3, station_name: "Stop B" },
  { id: "demo-c", stop_order: 4, station_name: "Stop C" },
];

const normalize = (value = "") =>
  String(value).trim().toUpperCase().replace(/\s+/g, " ");

const formatTime = (time) => {
  if (!time) return "--";

  const [hours, minutes] = String(time).split(":");
  const hour = Number(hours);

  if (!Number.isFinite(hour) || !minutes) return String(time);

  return `${hour % 12 || 12}:${minutes} ${
    hour >= 12 ? "PM" : "AM"
  }`;
};

const formatDate = (date) => {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getBusImage = (bus) => {
  const type = String(
    bus?.bus_type || bus?.bus_category || bus?.category || ""
  ).toLowerCase();

  return type.includes("ac") &&
    !type.includes("non ac") &&
    !type.includes("non-ac")
    ? AC_BUS_IMAGE
    : ORDINARY_BUS_IMAGE;
};

export default function LiveBusResults() {
  const search = useSearch({ strict: false });

  const from =
    search?.from || search?.source || search?.boarding || "";

  const to =
    search?.to || search?.destination || search?.drop || "";

  const date = search?.date || search?.serviceDate || "";

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [liveLocations, setLiveLocations] = useState({});

  useEffect(() => {
    let mounted = true;

    async function loadBuses() {
      setLoading(true);
      setError("");

      try {
        const { data, error: fetchError } = await supabase
          .from("buses")
          .select(`
            *,
            bus_schedule (
              id,
              stop_order,
              station_name,
              arrival_time,
              departure_time
            )
          `)
          .eq("is_active", true);

        if (fetchError) throw fetchError;

        if (!mounted) return;

        setBuses(
          (data || []).map((bus) => ({
            ...bus,
            bus_schedule: [...(bus.bus_schedule || [])].sort(
              (a, b) => Number(a.stop_order) - Number(b.stop_order)
            ),
          }))
        );
      } catch (err) {
        console.error("Unable to load buses:", err);

        if (mounted) {
          setError(
            "Regular buses could not be loaded. You can still use the Demo Bus."
          );
          setBuses([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadBuses();

    const refresh = () => loadBuses();

    window.addEventListener("bussinn:buses", refresh);

    return () => {
      mounted = false;
      window.removeEventListener("bussinn:buses", refresh);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadLiveLocations() {
      const { data, error: locationError } = await supabase
        .from("live_locations")
        .select("*");

      if (locationError) {
        console.warn("Live location error:", locationError);
        return;
      }

      if (!mounted) return;

      const locations = {};

      (data || []).forEach((location) => {
        if (location.bus_id) {
          locations[location.bus_id] = location;
        }
      });

      setLiveLocations(locations);
    }

    loadLiveLocations();

    const channel = supabase
      .channel("bussinn-results-live-locations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_locations",
        },
        (payload) => {
          const location = payload.new;

          if (!location?.bus_id) return;

          setLiveLocations((previous) => ({
            ...previous,
            [location.bus_id]: location,
          }));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const matchingBuses = useMemo(() => {
    const source = normalize(from);
    const destination = normalize(to);

    if (!source || !destination) return [];

    return buses.filter((bus) => {
      const stops = [...(bus.bus_schedule || [])].sort(
        (a, b) => Number(a.stop_order) - Number(b.stop_order)
      );

      if (stops.length) {
        const startIndex = stops.findIndex(
          (stop) => normalize(stop.station_name) === source
        );

        const endIndex = stops.findIndex(
          (stop) => normalize(stop.station_name) === destination
        );

        return (
          startIndex !== -1 &&
          endIndex !== -1 &&
          startIndex < endIndex
        );
      }

      return (
        normalize(bus.source) === source &&
        normalize(bus.destination) === destination
      );
    });
  }, [buses, from, to]);

  const getRouteStops = (bus) => {
    if (bus?.demo) return DEMO_STOPS;

    const stops = [...(bus.bus_schedule || [])].sort(
      (a, b) => Number(a.stop_order) - Number(b.stop_order)
    );

    const startIndex = stops.findIndex(
      (stop) => normalize(stop.station_name) === normalize(from)
    );

    const endIndex = stops.findIndex(
      (stop) => normalize(stop.station_name) === normalize(to)
    );

    if (startIndex >= 0 && endIndex > startIndex) {
      return stops.slice(startIndex, endIndex + 1);
    }

    return stops;
  };

  const demoBus = {
    id: "demo-bus",
    demo: true,
    name: "BussInn Demo Bus",
  };

  return (
    <div className="lbr-page">
      <header className="lbr-header">
        <div>
          <h1>Live Buses</h1>
          <p>
            {from || "Boarding"} → {to || "Destination"}
          </p>
        </div>
        <div className="lbr-live-pill">
          <span />
          LIVE
        </div>
      </header>

      <section className="lbr-search-summary">
        <div className="lbr-search-route">
          <div className="lbr-place">
            <span className="lbr-place-dot blue" />
            <div>
              <small>FROM</small>
              <strong>{from || "Any boarding point"}</strong>
            </div>
          </div>

          <div className="lbr-route-arrow">→</div>

          <div className="lbr-place">
            <span className="lbr-place-dot red" />
            <div>
              <small>TO</small>
              <strong>{to || "Any destination"}</strong>
            </div>
          </div>
        </div>

        {date && (
          <div className="lbr-date">
            <CalendarDays size={14} />
            {formatDate(date)}
          </div>
        )}
      </section>

      {loading && (
        <div className="lbr-loading">
          <div className="lbr-loading-icon">
            <BusFront size={30} />
          </div>
          <h2>Finding buses...</h2>
          <p>Checking available buses and routes</p>
        </div>
      )}

      {error && (
        <div className="lbr-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && matchingBuses.length === 0 && (
        <div className="lbr-empty">
          <div className="lbr-empty-icon">
            <BusFront size={27} />
          </div>
          <h2>No regular buses found</h2>
          <p>
            No regular buses found for {from || "your boarding point"} to{" "}
            {to || "your destination"}. Try the Demo Bus below.
          </p>
        </div>
      )}

      <main className="lbr-list">
        {/* Always shown, regardless of the passenger's search */}
        <article className="lbr-bus-card">
          <div className="lbr-card-header">
            <div className="lbr-card-title-area">
              <span className="demo-bus-badge">
                <span className="demo-bus-badge-dot" />
                LIVE TRACKING DEMO
              </span>
              <h2>BussInn Demo Bus</h2>
              <p>Interactive GPS demonstration</p>
            </div>

            <div className="lbr-trip-area">
              <div className="lbr-trip">DEMO</div>
              <img
                src={ORDINARY_BUS_IMAGE}
                alt="Demo bus"
                className="lbr-bus-category-image"
              />
              <span className="lbr-category-label">DEMO BUS</span>
            </div>
          </div>

          <div className="demo-bus-route">
            <div className="demo-bus-stop">
              <span className="demo-bus-stop-dot start" />
              <div>
                <small>STARTING POINT</small>
                <strong>Stop S</strong>
              </div>
            </div>

            <div className="demo-bus-route-connector">
              <span />
              <span />
              <span />
            </div>

            <div className="demo-bus-stop">
              <span className="demo-bus-stop-dot end" />
              <div>
                <small>DESTINATION</small>
                <strong>Stop C</strong>
              </div>
            </div>
          </div>

          <p className="demo-bus-description">
            Demo route: Stop S → Stop A → Stop B → Stop C.
            This bus appears in every search.
          </p>

          <div className="lbr-info-row">
            <div>
              <small>Route</small>
              <strong>Stop S → Stop C</strong>
            </div>
            <div>
              <small>Stops</small>
              <strong>4</strong>
            </div>
            <div>
              <small>Type</small>
              <strong>Demo</strong>
            </div>
          </div>

          <div className="lbr-actions">
            <button
              type="button"
              className="lbr-route-button"
              onClick={() => setSelectedRoute(demoBus)}
            >
              <RouteIcon size={17} />
              <span>Route</span>
            </button>

            <Link
              to="/trackbus"
              search={{
                busId: "demo-bus",
                from: "Stop S",
                to: "Stop C",
                date,
              }}
              className="lbr-track-button"
            >
              <Navigation size={17} />
              <span>Track Demo Bus</span>
            </Link>
          </div>
        </article>

        {/* Real buses still use the passenger's selected route */}
        {matchingBuses.map((bus) => {
          const stops = getRouteStops(bus);
          const firstStop = stops[0];
          const lastStop = stops[stops.length - 1];
          const isLive = Boolean(liveLocations[bus.id]);

          return (
            <article key={bus.id} className="lbr-bus-card">
              <div className="lbr-card-header">
                <div className="lbr-card-title-area">
                  <h2>{bus.name || bus.bus_name || "UPSRTC Bus"}</h2>
                  <p>{bus.operator || "UPSRTC"}</p>
                </div>

                <div className="lbr-trip-area">
                  <img
                    src={getBusImage(bus)}
                    alt="Bus category"
                    className="lbr-bus-category-image"
                  />
                </div>
              </div>

              <div className="lbr-route-box">
                <div className="lbr-route-station">
                  <span className="lbr-route-label">BOARDING</span>
                  <strong>{firstStop?.station_name || bus.source}</strong>
                  <span className="lbr-route-time">
                    {formatTime(
                      firstStop?.departure_time || firstStop?.arrival_time
                    )}
                  </span>
                </div>

                <div className="lbr-route-middle">
                  <div className="lbr-route-line">
                    <span />
                    <div />
                    <span />
                  </div>
                  <small>{stops.length} stops</small>
                </div>

                <div className="lbr-route-station right">
                  <span className="lbr-route-label">ARRIVAL</span>
                  <strong>{lastStop?.station_name || bus.destination}</strong>
                  <span className="lbr-route-time">
                    {formatTime(
                      lastStop?.arrival_time || lastStop?.departure_time
                    )}
                  </span>
                </div>
              </div>

              <div className="lbr-info-row">
                <div>
                  <small>Fare</small>
                  <strong>₹{bus.fare || 0}</strong>
                </div>
                <div>
                  <small>Stops</small>
                  <strong>{stops.length}</strong>
                </div>
                <div>
                  <small>Status</small>
                  <strong className={isLive ? "lbr-green" : "lbr-gray"}>
                    {isLive ? "● Live" : "Scheduled"}
                  </strong>
                </div>
              </div>

              <div className="lbr-actions">
                <button
                  type="button"
                  className="lbr-route-button"
                  onClick={() => setSelectedRoute(bus)}
                >
                  <RouteIcon size={17} />
                  <span>Route</span>
                </button>

                <Link
                  to="/trackbus"
                  search={{ busId: String(bus.id), from, to, date }}
                  className="lbr-track-button"
                >
                  <Navigation size={17} />
                  <span>Track</span>
                </Link>
              </div>
            </article>
          );
        })}
      </main>

      {selectedRoute && (
        <div
          className="lbr-modal-overlay"
          onClick={() => setSelectedRoute(null)}
        >
          <div
            className="lbr-route-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="lbr-modal-header">
              <div>
                <span>BUS ROUTE</span>
                <h2>
                  {selectedRoute.demo
                    ? "BussInn Demo Bus"
                    : selectedRoute.name || selectedRoute.bus_name || "Bus Route"}
                </h2>
              </div>

              <button
                type="button"
                className="lbr-modal-close"
                onClick={() => setSelectedRoute(null)}
                aria-label="Close route"
              >
                <X size={20} />
              </button>
            </div>

            <div className="lbr-modal-route">
              {getRouteStops(selectedRoute).map((stop, index, allStops) => (
                <div
                  key={stop.id || stop.stop_order || index}
                  className="lbr-modal-stop"
                >
                  <div className="lbr-modal-timeline">
                    <span
                      className={
                        index === 0
                          ? "start"
                          : index === allStops.length - 1
                          ? "end"
                          : ""
                      }
                    />
                    {index < allStops.length - 1 && <div />}
                  </div>

                  <div className="lbr-modal-stop-info">
                    <div>
                      <strong>{stop.station_name}</strong>
                      <small>
                        {index === 0
                          ? "Boarding"
                          : index === allStops.length - 1
                          ? "Destination"
                          : "Stop"}
                      </small>
                    </div>
                  </div>

                  <div className="lbr-modal-time">
                    <strong>{formatTime(stop.arrival_time || stop.departure_time)}</strong>
                  </div>
                </div>
              ))}
            </div>

            <Link
              to="/trackbus"
              search={{
                busId: selectedRoute.demo
                  ? "demo-bus"
                  : String(selectedRoute.id),
                from: selectedRoute.demo ? "Stop S" : from,
                to: selectedRoute.demo ? "Stop C" : to,
                date,
              }}
              className="lbr-modal-track"
            >
              <Navigation size={18} />
              <span>Track This Bus</span>
            </Link>
          </div>
        </div>
      )}

      <PassengerBottomNav />
    </div>
  );
}