import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";

import { supabase } from "../../lib/supabase";

setWorkerUrl(workerUrl);

const DEMO_ID = 1;

const ROUTE = [
  {
    id: "start",
    label: "S",
    name: "Stop S",
    coordinates: [77.521577, 28.478776],
  },
  {
    id: "a",
    label: "A",
    name: "Stop A",
    coordinates: [77.52207, 28.47814],
  },
  {
    id: "b",
    label: "B",
    name: "Stop B",
    coordinates: [77.521175, 28.477565],
  },
  {
    id: "c",
    label: "C",
    name: "Stop C",
    coordinates: [77.520681, 28.478282],
  },
];

const BLUE = "#2563eb";

function createStopElement(label, color) {
  const el = document.createElement("div");

  Object.assign(el.style, {
    width: "34px",
    height: "34px",
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: color,
    color: "#fff",
    border: "3px solid white",
    boxShadow: "0 3px 12px #0003",
    fontWeight: "800",
    fontSize: "13px",
  });

  el.textContent = label;
  return el;
}

function createBusElement() {
  const element = document.createElement("div");

  element.style.width = "48px";
  element.style.height = "48px";
  element.style.display = "flex";
  element.style.alignItems = "center";
  element.style.justifyContent = "center";
  element.style.filter = "drop-shadow(0 3px 5px rgba(0,0,0,0.35))";

  element.innerHTML = `
    <svg
      width="42"
      height="42"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M24 3 L43 42 L24 32 L5 42 Z"
        fill="#4285F4"
        stroke="#FFFFFF"
        stroke-width="3"
        stroke-linejoin="round"
      />
    </svg>
  `;

  element.title = "Your live GPS location";
  return element;
}

export default function TrackRunningPage() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const busMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  const trailRef = useRef([]);

  const [mapReady, setMapReady] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let disposed = false;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: ROUTE[0].coordinates,
      zoom: 16,
    });

    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");

    map.on("load", () => {
      if (disposed) return;

      map.addSource("demo-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: ROUTE.map((point) => point.coordinates),
          },
        },
      });

      map.addLayer({
        id: "demo-route-line",
        type: "line",
        source: "demo-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": BLUE, "line-width": 4 },
      });

      ROUTE.forEach((point, index) => {
        new maplibregl.Marker({
          element: createStopElement(
            point.label,
            index === 0 ? "#f59e0b" : "#dc2626"
          ),
        })
          .setLngLat(point.coordinates)
          .setPopup(new maplibregl.Popup({ offset: 20 }).setText(point.name))
          .addTo(map);
      });

      busMarkerRef.current = new maplibregl.Marker({
        element: createBusElement(),
      })
        .setLngLat(ROUTE[0].coordinates)
        .addTo(map);

      const bounds = new maplibregl.LngLatBounds();
      ROUTE.forEach((point) => bounds.extend(point.coordinates));

      map.fitBounds(bounds, { padding: 70, maxZoom: 17 });

      setMapReady(true);
      setMapError("");
      setTimeout(() => map.resize(), 100);
    });

    map.on("error", (event) => {
      console.error("MapLibre error:", event.error || event);

      if (!map.isStyleLoaded()) {
        setMapError("Map could not load. Check your internet connection.");
      }
    });

    return () => {
      disposed = true;

      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }

      map.remove();
      mapRef.current = null;
      busMarkerRef.current = null;
    };
  }, []);

  async function publishLocation(latitude, longitude) {
    const previousTrail = trailRef.current;
    const last = previousTrail[previousTrail.length - 1];

    // Avoid saving duplicate GPS points when the phone hasn't moved.
    const moved =
      !last ||
      Math.abs(last[0] - longitude) > 0.000005 ||
      Math.abs(last[1] - latitude) > 0.000005;

    const nextTrail = moved
      ? [...previousTrail, [longitude, latitude]].slice(-500)
      : previousTrail;

    trailRef.current = nextTrail;

    const { error: saveError } = await supabase
      .from("demo_live_tracking")
      .upsert(
        {
          id: DEMO_ID,
          is_started: true,
          latitude,
          longitude,
          trail: nextTrail,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (saveError) {
      console.error("GPS upload failed:", saveError);
      setError(
        "GPS is working, but location could not be shared. Check Supabase table permissions."
      );
    }
  }

  async function startTracking() {
    setError("");

    if (!mapReady || !busMarkerRef.current) {
      setError("The map is still loading. Please wait.");
      return;
    }

    if (!navigator.geolocation) {
      setError("This browser does not support GPS location.");
      return;
    }

    // Mark the demo as started immediately.
    const { error: startError } = await supabase
      .from("demo_live_tracking")
      .upsert(
        {
          id: DEMO_ID,
          is_started: true,
          latitude: location?.latitude ?? ROUTE[0].coordinates[1],
          longitude: location?.longitude ?? ROUTE[0].coordinates[0],
          trail: trailRef.current,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (startError) {
      console.error("Could not start demo:", startError);
      setError("Could not start shared tracking. Check Supabase permissions.");
      return;
    }

    setTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const coordinates = [longitude, latitude];

        setLocation({
          latitude,
          longitude,
          accuracy: Math.round(accuracy),
        });

        busMarkerRef.current?.setLngLat(coordinates);

        mapRef.current?.easeTo({
          center: coordinates,
          duration: 700,
        });

        await publishLocation(latitude, longitude);
      },
      (gpsError) => {
        const messages = {
          1: "Location permission denied. Allow GPS access in your browser.",
          2: "Your current location is unavailable. Check your phone's GPS.",
          3: "GPS timed out. Please try again.",
        };

        setError(messages[gpsError.code] || "Unable to get your location.");
        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 2000,
        timeout: 20000,
      }
    );
  }

  async function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setTracking(false);

    const { error: stopError } = await supabase
      .from("demo_live_tracking")
      .update({
        is_started: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", DEMO_ID);

    if (stopError) {
      console.error("Could not stop shared tracking:", stopError);
      setError("Tracking stopped locally, but Supabase status could not update.");
    }
  }

  function centerOnLocation() {
    const coords = location
      ? [location.longitude, location.latitude]
      : ROUTE[0].coordinates;

    mapRef.current?.flyTo({ center: coords, zoom: 18 });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 20,
        background: "#f3f6fb",
        color: "#14213d",
        fontFamily: "Inter, system-ui, sans-serif",
        boxSizing: "border-box",
      }}
    >
      <header
        style={{
          maxWidth: 1400,
          margin: "0 auto 18px",
          padding: "18px 22px",
          background: "#fff",
          border: "1px solid #e4eaf2",
          borderRadius: 18,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 850 }}>
            BussInn <span style={{ color: BLUE }}>Driver</span>
          </div>
          <div style={{ marginTop: 5, color: "#68778e", fontSize: 13 }}>
            Stop S · Stop A · Stop B · Stop C
          </div>
        </div>

        <div
          style={{
            padding: "9px 13px",
            borderRadius: 30,
            background: tracking ? "#eaf8ef" : "#fff4df",
            color: tracking ? "#15803d" : "#a16207",
            fontWeight: 750,
            fontSize: 12,
          }}
        >
          {tracking ? "● GPS tracking active" : "● Tracking stopped"}
        </div>
      </header>

      <section
        className="track-running-layout"
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 310px",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div
          style={{
            position: "relative",
            height: "min(72vh, 760px)",
            minHeight: 420,
            overflow: "hidden",
            background: "#e6edf5",
            border: "1px solid #dce5ef",
            borderRadius: 20,
          }}
        >
          <div
            ref={mapContainer}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
            }}
          />

          {!mapReady && !mapError && (
            <div style={overlayStyle}>Loading map…</div>
          )}

          {mapError && (
            <div style={{ ...overlayStyle, color: "#b91c1c" }}>
              {mapError}
            </div>
          )}

          <button
            type="button"
            onClick={centerOnLocation}
            style={mapButtonStyle}
          >
            Center map
          </button>
        </div>

        <aside
          style={{
            padding: 22,
            border: "1px solid #e4eaf2",
            borderRadius: 20,
            background: "#fff",
          }}
        >
          <div style={{ color: BLUE, fontSize: 10, fontWeight: 850 }}>
            DRIVER CONTROLS
          </div>

          <h2 style={{ margin: "8px 0 6px", fontSize: 23 }}>
            Live tracking
          </h2>

          <p style={{ color: "#68778e", fontSize: 13, lineHeight: 1.6 }}>
            Start tracking and allow GPS access. Your location will be shared
            with the passenger demo page.
          </p>

          <button
            type="button"
            onClick={tracking ? stopTracking : startTracking}
            disabled={!mapReady}
            style={{
              width: "100%",
              minHeight: 49,
              marginTop: 22,
              border: 0,
              borderRadius: 12,
              background: tracking ? "#dc2626" : BLUE,
              color: "#fff",
              fontSize: 14,
              fontWeight: 850,
              cursor: mapReady ? "pointer" : "not-allowed",
              opacity: mapReady ? 1 : 0.6,
            }}
          >
            {!mapReady
              ? "Loading map…"
              : tracking
              ? "Stop Tracking"
              : "Start Tracking"}
          </button>

          {error && (
            <div
              role="alert"
              style={{
                marginTop: 14,
                padding: 12,
                borderRadius: 10,
                background: "#fff1f2",
                color: "#b91c1c",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              marginTop: 20,
              padding: 14,
              borderRadius: 12,
              background: "#f4f7fc",
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 800 }}>
              Your GPS location
            </div>

            {location ? (
              <div
                style={{
                  marginTop: 8,
                  color: "#52627a",
                  fontSize: 12,
                  lineHeight: 1.8,
                }}
              >
                <div>Latitude: {location.latitude.toFixed(6)}</div>
                <div>Longitude: {location.longitude.toFixed(6)}</div>
                <div>Accuracy: about {location.accuracy} m</div>
              </div>
            ) : (
              <p style={{ color: "#68778e", fontSize: 12, lineHeight: 1.6 }}>
                Your location appears here when you start tracking.
              </p>
            )}
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 800 }}>Route stops</div>

            {ROUTE.map((point, index) => (
              <div
                key={point.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 13,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    background: index === 0 ? "#fff4df" : "#fff0f0",
                    color: index === 0 ? "#a16207" : "#dc2626",
                    fontWeight: 850,
                    fontSize: 12,
                  }}
                >
                  {point.label}
                </div>

                <div>
                  <div style={{ fontSize: 12, fontWeight: 750 }}>
                    {point.name}
                  </div>
                  <div style={{ color: "#8995a8", fontSize: 10 }}>
                    {index === 0 ? "Starting point" : "Route stop"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <style>{`
        @media (max-width: 850px) {
          .track-running-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </main>
  );
}

const overlayStyle = {
  position: "absolute",
  zIndex: 3,
  top: 16,
  left: 16,
  right: 16,
  padding: 14,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 4px 18px #0001",
  fontSize: 13,
};

const mapButtonStyle = {
  position: "absolute",
  zIndex: 3,
  left: 16,
  bottom: 16,
  padding: "11px 14px",
  border: "1px solid #e1e7ef",
  borderRadius: 10,
  background: "#fff",
  fontWeight: 750,
  cursor: "pointer",
};