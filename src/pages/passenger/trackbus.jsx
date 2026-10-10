import { useEffect, useMemo, useRef, useState } from "react";
import { useSearch } from "@tanstack/react-router";
import {
  ArrowLeft,
  ChevronRight,
  Clock,
  MapPin,
  Route as RouteIcon,
} from "lucide-react";
import * as maplibregl from "maplibre-gl";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import "../../styles/TrackBus.css"; // <- change to your real CSS file path/name

import PassengerBottomNav from "../../components/PassengerBottomNav";
import { supabase } from "../../lib/supabase";

setWorkerUrl(workerUrl);

const DEMO_BUS_ID = "demo-bus";
const DEMO_ROW_ID = 1; // same id the driver page writes to in demo_live_tracking
const STALE_AFTER_MS = 30000;

const BUS_MARKER_IMAGE =
  "https://i.pinimg.com/1200x/ff/03/23/ff0323b987a2a4c75d944828ec112de7.jpg";
const ORDINARY_BUS_IMAGE =
  "https://www.onlineupsrtc.co.in/assets/icons/Ordinary.png";
const AC_BUS_IMAGE =
  "https://www.onlineupsrtc.co.in/assets/icons/bus_ac_janrath_2x2.png";

const DEMO_ROUTE = [
  { id: "start", label: "S", name: "Stop S", coordinates: [77.521577, 28.478776] },
  { id: "a", label: "A", name: "Stop A", coordinates: [77.52207, 28.47814] },
  { id: "b", label: "B", name: "Stop B", coordinates: [77.521175, 28.477565] },
  { id: "c", label: "C", name: "Stop C", coordinates: [77.520681, 28.478282] },
];

const normalize = (value = "") =>
  String(value).trim().toUpperCase().replace(/\s+/g, " ");

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

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function distanceBetween(a, b) {
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);
  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(b[0] - a[0]);
  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return (
    6371000 *
    2 *
    Math.atan2(Math.sqrt(value), Math.sqrt(Math.max(0, 1 - value)))
  );
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) return "--";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatTime(time) {
  if (!time) return "--";
  const [hours, minutes] = String(time).split(":");
  const hour = Number(hours);
  if (!Number.isFinite(hour) || !minutes) return String(time);
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

function timeToMinutes(time) {
  if (!time) return null;
  const [hours, minutes] = String(time).split(":");
  const h = Number(hours);
  const m = Number(minutes);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

// Accepts rows from demo_live_tracking and from live_locations.
function normalizeLive(row) {
  if (!row) return null;

  const latitude = Number(row.latitude ?? row.lat);
  const longitude = Number(row.longitude ?? row.lng ?? row.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const heading = Number(row.heading);
  const speed = row.speed == null ? null : Number(row.speed);

  return {
    latitude,
    longitude,
    heading: Number.isFinite(heading) ? heading : 0,
    speed: Number.isFinite(speed) ? speed : null,
    isStarted: row.is_started ?? true,
    updatedAt: row.updated_at ?? null,
    trail: Array.isArray(row.trail) ? row.trail : [],
  };
}

// Returns [lng, lat] for a schedule stop, or null if it can't be found.
async function findStopCoordinates(stop) {
  const rawLat = stop.latitude ?? stop.lat;
  const rawLng = stop.longitude ?? stop.lng ?? stop.lon;

  if (
    rawLat != null &&
    rawLng != null &&
    Number.isFinite(Number(rawLat)) &&
    Number.isFinite(Number(rawLng))
  ) {
    return [Number(rawLng), Number(rawLat)];
  }

  const name = String(stop.station_name || "").trim();
  if (!name) return null;

  const cacheKey = `bussinn-stop:${name.toUpperCase()}`;

  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch {
    /* storage unavailable */
  }

  const queries = [`${name} bus stand`, `${name} bus station`, name];

  for (const query of queries) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=in&q=${encodeURIComponent(
          query
        )}`
      );

      if (!response.ok) continue;

      const results = await response.json();

      if (results?.length) {
        const coords = [Number(results[0].lon), Number(results[0].lat)];

        try {
          localStorage.setItem(cacheKey, JSON.stringify(coords));
        } catch {
          /* ignore */
        }

        return coords;
      }
    } catch (err) {
      console.warn("Stop lookup failed:", err);
    }
  }

  return null;
}

function createStopElement(label, color) {
  const element = document.createElement("div");
  Object.assign(element.style, {
    width: "30px",
    height: "30px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: color,
    color: "#fff",
    border: "3px solid white",
    boxShadow: "0 3px 12px #0003",
    fontWeight: "800",
    fontSize: "12px",
    boxSizing: "border-box",
  });
  element.textContent = label;
  return element;
}

function createBusElement() {
  const element = document.createElement("div");
  Object.assign(element.style, {
    width: "60px",
    height: "60px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  element.innerHTML = `
    <div class="track-map-bus-pulse"></div>
    <div class="track-map-bus-marker">
      <img class="track-map-bus-image" src="${BUS_MARKER_IMAGE}" alt="Bus" />
    </div>
  `;

  const image = element.querySelector("img");
  image.onerror = () => {
    image.src = ORDINARY_BUS_IMAGE;
  };

  return element;
}

export default function TrackBus() {
  const search = useSearch({ strict: false });

  const busId = String(search?.busId || DEMO_BUS_ID);
  const from = search?.from || "";
  const to = search?.to || "";
  const isDemo = busId === DEMO_BUS_ID;

  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const busMarkerRef = useRef(null);
  const followRef = useRef(true);
  const firstFixRef = useRef(true);
  const originFocusedRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [live, setLive] = useState(null);
  const [follow, setFollow] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [busInfo, setBusInfo] = useState(null);
  const [busLoading, setBusLoading] = useState(!isDemo);
  const [busNotFound, setBusNotFound] = useState(false);
  const [originCoords, setOriginCoords] = useState(null);
  const [originFailed, setOriginFailed] = useState(false);

  followRef.current = follow;

  // Whole timetable, in order. No From/To slicing.
  const stops = useMemo(() => {
    if (isDemo) return DEMO_ROUTE;

    return [...(busInfo?.bus_schedule || [])].sort(
      (a, b) => Number(a.stop_order) - Number(b.stop_order)
    );
  }, [isDemo, busInfo]);

  // Tick so "last updated" and the stale check stay current.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Bus details + full schedule.
  useEffect(() => {
    if (isDemo) {
      setBusInfo(null);
      setBusLoading(false);
      setBusNotFound(false);
      return;
    }

    let mounted = true;

    async function loadBus() {
      setBusLoading(true);
      setBusNotFound(false);

      const { data, error } = await supabase
        .from("buses")
        .select(`*, bus_schedule (*)`)
        .eq("id", busId)
        .maybeSingle();

      if (!mounted) return;

      if (error || !data) {
        console.error("Unable to load bus:", error);
        setBusInfo(null);
        setBusNotFound(true);
      } else {
        setBusInfo(data);
      }

      setBusLoading(false);
    }

    loadBus();

    return () => {
      mounted = false;
    };
  }, [isDemo, busId]);

  // Starting bus stand = the very first stop of the timetable.
  useEffect(() => {
    originFocusedRef.current = false;
    setOriginFailed(false);

    if (isDemo) {
      setOriginCoords(DEMO_ROUTE[0].coordinates);
      return;
    }

    setOriginCoords(null);

    const firstStop = stops[0];
    if (!firstStop) return;

    let cancelled = false;

    findStopCoordinates(firstStop).then((coords) => {
      if (cancelled) return;
      if (coords) setOriginCoords(coords);
      else setOriginFailed(true);
    });

    return () => {
      cancelled = true;
    };
  }, [isDemo, stops]);

  // Map setup.
  useEffect(() => {
    if (!mapContainer.current) return;

    let disposed = false;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: DEMO_ROUTE[0].coordinates,
      zoom: 16,
      attributionControl: true,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      if (disposed) return;

      // Path the bus has already travelled.
      map.addSource("trail", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        },
      });

      map.addLayer({
        id: "trail-line",
        type: "line",
        source: "trail",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#0757d5", "line-width": 5, "line-opacity": 0.85 },
      });

      // Stop the map from re-centering while the passenger is exploring.
      map.on("dragstart", () => {
        if (followRef.current) setFollow(false);
      });

      setMapReady(true);
      setMapError("");
      setTimeout(() => {
        if (!disposed) map.resize();
      }, 100);
    });

    map.on("error", (event) => {
      console.error("Map error:", event.error || event);
      if (!map.isStyleLoaded() && !disposed) {
        setMapError("Map could not load. Check your internet connection.");
      }
    });

    return () => {
      disposed = true;
      map.remove();
      mapRef.current = null;
      busMarkerRef.current = null;
      setMapReady(false);
    };
  }, []);

  // Planned route + stop markers (demo only: real stops have no coordinates yet).
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady || !isDemo) return;

    const markers = [];

    if (!map.getSource("planned-route")) {
      map.addSource("planned-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: DEMO_ROUTE.map((p) => p.coordinates),
          },
        },
      });

      map.addLayer(
        {
          id: "planned-route-outline",
          type: "line",
          source: "planned-route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#fff", "line-width": 8 },
        },
        "trail-line"
      );

      map.addLayer(
        {
          id: "planned-route-line",
          type: "line",
          source: "planned-route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#9db8e8", "line-width": 4 },
        },
        "trail-line"
      );
    }

    DEMO_ROUTE.forEach((point, index) => {
      const marker = new maplibregl.Marker({
        element: createStopElement(
          point.label,
          index === 0 ? "#f59e0b" : "#dc2626"
        ),
      })
        .setLngLat(point.coordinates)
        .setPopup(new maplibregl.Popup({ offset: 18 }).setText(point.name))
        .addTo(map);

      markers.push(marker);
    });

    const bounds = new maplibregl.LngLatBounds();
    DEMO_ROUTE.forEach((p) => bounds.extend(p.coordinates));
    map.fitBounds(bounds, { padding: 45, maxZoom: 17, duration: 0 });

    return () => {
      markers.forEach((marker) => marker.remove());
    };
  }, [mapReady, isDemo]);

  // Live position: initial fetch + realtime subscription.
  useEffect(() => {
    let mounted = true;
    firstFixRef.current = true;
    setLive(null);

    const table = isDemo ? "demo_live_tracking" : "live_locations";
    const column = isDemo ? "id" : "bus_id";
    const value = isDemo ? DEMO_ROW_ID : busId;

    async function loadLatest() {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq(column, value)
        .maybeSingle();

      if (error) {
        console.warn("Live location error:", error);
        return;
      }

      if (mounted) setLive(normalizeLive(data));
    }

    loadLatest();

    const channel = supabase
      .channel(`trackbus-${table}-${busId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          filter: `${column}=eq.${value}`,
        },
        (payload) => {
          if (!mounted || payload.eventType === "DELETE") return;
          const next = normalizeLive(payload.new);
          if (next) setLive(next);
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [isDemo, busId]);

  // Bus icon: live position if available, otherwise the starting bus stand.
  useEffect(() => {
    const map = mapRef.current;

    if (!map || !mapReady) return;

    const position = live ? [live.longitude, live.latitude] : originCoords;

    if (!position) return;

    if (!busMarkerRef.current) {
      busMarkerRef.current = new maplibregl.Marker({
        element: createBusElement(),
        anchor: "center",
      })
        .setLngLat(position)
        .addTo(map);
    } else {
      busMarkerRef.current.setLngLat(position);
    }

    if (live) {
      const trailSource = map.getSource("trail");

      if (trailSource) {
        trailSource.setData({
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: live.trail },
        });
      }

      if (firstFixRef.current) {
        firstFixRef.current = false;
        map.flyTo({ center: position, zoom: 17, duration: 600 });
      } else if (followRef.current) {
        map.easeTo({ center: position, duration: 600 });
      }
    } else if (!isDemo && !originFocusedRef.current) {
      originFocusedRef.current = true;
      map.jumpTo({ center: position, zoom: 16 });
    }
  }, [live, originCoords, mapReady, isDemo]);

  const ageMs = live?.updatedAt ? now - new Date(live.updatedAt).getTime() : null;
  const isFresh = ageMs !== null && ageMs < STALE_AFTER_MS;
  const isLive = Boolean(live && live.isStarted && isFresh);

  const destinationStop = isDemo
    ? DEMO_ROUTE.find((stop) => normalize(stop.name) === normalize(to)) ||
      DEMO_ROUTE[DEMO_ROUTE.length - 1]
    : null;

  const distanceToDestination =
    live && destinationStop
      ? distanceBetween(
          [live.longitude, live.latitude],
          destinationStop.coordinates
        )
      : null;

  const speedKmh =
    live?.speed != null && live.speed >= 0 ? Math.round(live.speed * 3.6) : null;

  // Which stop the bus is at.
  let currentIndex = 0;

  if (isLive && stops.length) {
    if (isDemo) {
      let best = Infinity;
      stops.forEach((stop, index) => {
        const d = distanceBetween(
          [live.longitude, live.latitude],
          stop.coordinates
        );
        if (d < best) {
          best = d;
          currentIndex = index;
        }
      });
    } else {
      const current = new Date(now);
      const nowMinutes = current.getHours() * 60 + current.getMinutes();

      stops.forEach((stop, index) => {
        const minutes = timeToMinutes(stop.departure_time || stop.arrival_time);
        if (minutes !== null && minutes <= nowMinutes) currentIndex = index;
      });
    }
  }

  const getStopName = (stop) => stop?.name || stop?.station_name || "--";
  const getStopTime = (stop) => stop?.arrival_time || stop?.departure_time;

  const currentStop = stops[currentIndex];
  const nextStop = stops[currentIndex + 1];

  const progress =
    stops.length > 1 ? Math.round((currentIndex / (stops.length - 1)) * 100) : 0;

  const statusText = !live
    ? "Scheduled"
    : isLive
    ? "Live"
    : live.isStarted
    ? "Signal lost"
    : "Trip not started";

  let currentMessage = "";

  if (!live) {
    currentMessage = originFailed
      ? "Could not find this bus stand on the map."
      : isDemo
      ? "Waiting for the driver to start tracking."
      : "Showing the bus at its starting bus stand. Live location appears when the bus starts sharing.";
  } else if (!isLive) {
    currentMessage = "Showing the last known position.";
  } else if (distanceToDestination !== null) {
    currentMessage = `${formatDistance(distanceToDestination)} to ${
      destinationStop.name
    }`;
  } else {
    currentMessage = "Live location is active.";
  }

  const busName = isDemo
    ? "BussInn Demo Bus"
    : busInfo?.name || busInfo?.bus_name || "UPSRTC Bus";

  const busImage = isDemo ? ORDINARY_BUS_IMAGE : getBusImage(busInfo);

  function recenter() {
    setFollow(true);
    if (live && mapRef.current) {
      mapRef.current.flyTo({
        center: [live.longitude, live.latitude],
        zoom: 17,
        duration: 450,
      });
    }
  }

  return (
    <div className="track-page">
      <header className="track-header">
        <button
          type="button"
          className="track-back-button"
          onClick={() => window.history.back()}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="track-header-title">
          <span>Track bus</span>
          <strong>
            {from || "Boarding"} to {to || "Destination"}
          </strong>
        </div>
      </header>

      <div className="track-map">
        <div ref={mapContainer} style={{ position: "absolute", inset: 0 }} />

        {!mapReady && !mapError && (
          <div className="track-map-label">Loading map…</div>
        )}

        {mapError && <div className="track-map-label">{mapError}</div>}

        {mapReady && live && !follow && (
          <button
            type="button"
            onClick={recenter}
            style={{
              position: "absolute",
              zIndex: 12,
              right: 12,
              bottom: 30,
              padding: "9px 13px",
              border: "none",
              borderRadius: 10,
              background: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              boxShadow: "0 3px 10px rgba(0,0,0,.12)",
            }}
          >
            Follow bus
          </button>
        )}
      </div>

      {busLoading ? (
        <div className="track-loading">
          <div className="track-loading-spinner" />
          <p>Loading bus timetable…</p>
        </div>
      ) : busNotFound ? (
        <div className="track-error">
          <div className="track-error-icon">
            <img
              className="track-error-bus-image"
              src={ORDINARY_BUS_IMAGE}
              alt="Bus"
            />
          </div>
          <h2>Bus not found</h2>
          <p>We could not load this bus. It may be inactive or removed.</p>
          <button
            type="button"
            className="track-error-button"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={18} />
            Go back
          </button>
        </div>
      ) : (
        <section className="track-sheet">
          <div className="track-bus-summary">
            <div className="track-bus-icon">
              <img className="track-bus-image" src={busImage} alt="Bus" />
            </div>

            <div className="track-bus-summary-content">
              <h1>{busName}</h1>
              <div className="track-bus-meta">
                <span>{isDemo ? "BussInn" : busInfo?.operator || "UPSRTC"}</span>
                <span className="track-meta-dot">•</span>
                <span>{statusText}</span>
              </div>
            </div>
          </div>

          <div className="track-current-card">
            <div className="track-current-card-top">
              <div>
                <span className="track-label">Current stop</span>
                <h2>{getStopName(currentStop)}</h2>
              </div>

              <div className="track-current-status">
                <span className="track-status-dot" />
                {isLive ? "LIVE" : "SCHEDULED"}
              </div>
            </div>

            {getStopTime(currentStop) && (
              <div className="track-current-time">
                <Clock size={12} />
                {formatTime(getStopTime(currentStop))}
              </div>
            )}

            <div className="track-current-message">{currentMessage}</div>
          </div>

          {nextStop && (
            <div className="track-next-card">
              <div className="track-next-icon">
                <MapPin size={18} />
              </div>

              <div className="track-next-content">
                <span className="track-label">Next stop</span>
                <h3>{getStopName(nextStop)}</h3>

                {getStopTime(nextStop) && (
                  <div className="track-next-time">
                    <Clock size={11} />
                    {formatTime(getStopTime(nextStop))}
                  </div>
                )}
              </div>

              <div className="track-next-arrow">
                <ChevronRight size={16} />
              </div>
            </div>
          )}

          <div className="track-progress-section">
            <div className="track-section-heading">
              <div>
                <span className="track-label">Journey progress</span>
                <h3>
                  Stop {Math.min(currentIndex + 1, stops.length)} of{" "}
                  {stops.length}
                </h3>
              </div>
              <strong>{progress}%</strong>
            </div>

            <div className="track-progress-bar">
              <div
                className="track-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="track-route-section">
            <div className="track-section-title">
              <RouteIcon size={17} />
              <h2>Route</h2>
            </div>

            <div className="track-timeline">
              {stops.map((stop, index) => {
                const name = getStopName(stop);
                const time = getStopTime(stop);
                const isCurrent = index === currentIndex;
                const isPassed = index < currentIndex;

                const status = isCurrent
                  ? "Bus is here"
                  : normalize(name) === normalize(from)
                  ? "Your boarding point"
                  : normalize(name) === normalize(to)
                  ? "Your drop point"
                  : index === 0
                  ? "Starting point"
                  : index === stops.length - 1
                  ? "Final stop"
                  : "Stop";

                return (
                  <div
                    key={stop.id || index}
                    className={`track-stop${
                      isCurrent ? " current" : isPassed ? " passed" : ""
                    }`}
                  >
                    {index < stops.length - 1 && (
                      <div className="track-stop-line" />
                    )}

                    <div className="track-stop-dot">
                      {isCurrent && <span />}
                    </div>

                    <div className="track-stop-content">
                      <div className="track-stop-main">
                        <h4>{name}</h4>

                        <div className="track-stop-times">
                          <span>{time ? formatTime(time) : "--"}</span>
                        </div>
                      </div>

                      <div className="track-stop-status">{status}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="track-info-section">
            <div className="track-info-grid">
              <div className="track-info-item">
                <span>Fare</span>
                <strong>{busInfo?.fare != null ? `₹${busInfo.fare}` : "--"}</strong>
              </div>

              <div className="track-info-item">
                <span>Bus type</span>
                <strong>
                  {isDemo
                    ? "Demo"
                    : busInfo?.bus_type ||
                      busInfo?.bus_category ||
                      busInfo?.category ||
                      "Ordinary"}
                </strong>
              </div>

              <div className="track-info-item">
                <span>Operator</span>
                <strong>{isDemo ? "BussInn" : busInfo?.operator || "UPSRTC"}</strong>
              </div>

              <div className="track-info-item">
                <span>Speed</span>
                <strong>{speedKmh !== null ? `${speedKmh} km/h` : "--"}</strong>
              </div>
            </div>
          </div>

          <div style={{ height: 70 }} />
        </section>
      )}

      <PassengerBottomNav />
    </div>
  );
}