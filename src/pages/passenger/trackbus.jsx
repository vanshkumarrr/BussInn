
import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import { setWorkerUrl } from "maplibre-gl";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import "maplibre-gl/dist/maplibre-gl.css";
import { supabase } from "../../lib/supabase";

setWorkerUrl(workerUrl);

const DEMO_ID = 1;
const BLUE = "#4285F4";

const ROUTE = [
  { id: "start", label: "S", name: "Stop S", coordinates: [77.521577, 28.478776] },
  { id: "a", label: "A", name: "Stop A", coordinates: [77.522070, 28.478140] },
  { id: "b", label: "B", name: "Stop B", coordinates: [77.521175, 28.477565] },
  { id: "c", label: "C", name: "Stop C", coordinates: [77.520681, 28.478282] },
];

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
    width: "48px",
    height: "48px",
    position: "relative",
    display: "grid",
    placeItems: "center",
    overflow: "visible",
  });

  element.innerHTML = `
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(66,133,244,.10)"></div>
    <div data-direction-cone style="position:absolute;inset:0;transform:rotate(0deg);transform-origin:50% 50%;transition:transform 90ms linear">
      <div style="position:absolute;left:50%;top:0;transform:translateX(-50%);width:0;height:0;border-left:15px solid transparent;border-right:15px solid transparent;border-bottom:34px solid rgba(66,133,244,.30)"></div>
    </div>
    <div style="position:relative;z-index:2;width:15px;height:15px;border-radius:50%;background:#4285F4;border:3px solid white;box-shadow:0 1px 8px rgba(66,133,244,.55);box-sizing:border-box"></div>
  `;

  return element;
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function getBearing(from, to) {
  const lat1 = toRadians(from[1]);
  const lat2 = toRadians(to[1]);
  const deltaLng = toRadians(to[0] - from[0]);
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function distanceBetween(a, b) {
  const lat1 = toRadians(a[1]);
  const lat2 = toRadians(b[1]);
  const deltaLat = lat2 - lat1;
  const deltaLng = toRadians(b[0] - a[0]);
  const value =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 6371000 * 2 * Math.atan2(
    Math.sqrt(value),
    Math.sqrt(Math.max(0, 1 - value))
  );
}

export default function TrackRunningPage() {
  const mapContainer = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);
  const trailRef = useRef([]);
  const lastGpsRef = useRef(null);
  const headingRef = useRef(0);
  const trackingRef = useRef(false);
  const mountedRef = useRef(true);
  const compassRef = useRef(false);

  const [mapReady, setMapReady] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    mountedRef.current = true;
    if (!mapContainer.current || mapRef.current) return;

    let disposed = false;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: ROUTE[0].coordinates,
      zoom: 16,
      attributionControl: true,
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
            coordinates: ROUTE.map((p) => p.coordinates),
          },
        },
      });

      map.addLayer({
        id: "demo-route-outline",
        type: "line",
        source: "demo-route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#fff", "line-width": 8 },
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
          .setPopup(new maplibregl.Popup({ offset: 18 }).setText(point.name))
          .addTo(map);
      });

      markerRef.current = new maplibregl.Marker({
        element: createBusElement(),
        anchor: "center",
      })
        .setLngLat(ROUTE[0].coordinates)
        .addTo(map);

      const bounds = new maplibregl.LngLatBounds();
      ROUTE.forEach((p) => bounds.extend(p.coordinates));
      map.fitBounds(bounds, { padding: 45, maxZoom: 17 });

      // Mobile: let the page scroll instead of dragging the map.
      if (window.matchMedia("(max-width: 850px)").matches) {
        map.dragPan.disable();
        map.touchZoomRotate.disable();
        map.scrollZoom.disable();
        mapContainer.current.style.touchAction = "pan-y";
        const canvas = map.getCanvas();
        canvas.style.touchAction = "pan-y";
      }

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
      mountedRef.current = false;
      trackingRef.current = false;

      window.removeEventListener("deviceorientation", handleOrientation, true);
      window.removeEventListener("deviceorientationabsolute", handleOrientation, true);

      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
      }

      watchIdRef.current = null;
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  function rotatePointer(heading) {
    if (!Number.isFinite(heading)) return;

    headingRef.current = ((heading % 360) + 360) % 360;
    const cone = markerRef.current
      ?.getElement()
      ?.querySelector("[data-direction-cone]");

    if (cone) cone.style.transform = `rotate(${headingRef.current}deg)`;
  }

  function handleOrientation(event) {
    let heading = null;

    if (Number.isFinite(event.webkitCompassHeading)) {
      heading = event.webkitCompassHeading;
    } else if (event.absolute && Number.isFinite(event.alpha)) {
      heading = (360 - event.alpha + 360) % 360;
    }

    if (heading === null || !Number.isFinite(heading)) return;

    rotatePointer(heading);

    if (mountedRef.current) {
      setLocation((current) =>
        current ? { ...current, heading: headingRef.current } : current
      );
    }
  }

  async function enableCompass() {
    try {
      if (typeof DeviceOrientationEvent === "undefined") return;

      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result !== "granted") return;
      }

      window.addEventListener("deviceorientation", handleOrientation, true);
      window.addEventListener("deviceorientationabsolute", handleOrientation, true);
      compassRef.current = true;
    } catch (e) {
      console.warn("Compass permission unavailable:", e);
    }
  }

  async function publishPosition(position) {
    const { latitude, longitude, accuracy, speed } = position.coords;
    const coords = [longitude, latitude];
    const last = trailRef.current.at(-1);

    if (
      !last ||
      Math.abs(last[0] - longitude) > 0.000005 ||
      Math.abs(last[1] - latitude) > 0.000005
    ) {
      trailRef.current = [...trailRef.current, coords].slice(-500);
    }

    const { error: saveError } = await supabase
      .from("demo_live_tracking")
      .upsert(
        {
          id: DEMO_ID,
          is_started: true,
          latitude,
          longitude,
          speed: Number.isFinite(speed) && speed >= 0 ? speed : null,
          heading: headingRef.current,
          trail: trailRef.current,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

    if (!mountedRef.current) return;

    if (saveError) {
      console.error("Supabase location update failed:", saveError);
      setError("GPS works, but Supabase update failed. Check table columns and permissions.");
    } else {
      setError("");
    }

    setLocation({
      latitude,
      longitude,
      accuracy: Math.round(accuracy),
      speed,
      heading: headingRef.current,
    });
  }

  function handlePosition(position) {
    if (!trackingRef.current) return;

    const { latitude, longitude, heading, speed } = position.coords;
    const coords = [longitude, latitude];
    const previous = lastGpsRef.current;

    if (!compassRef.current) {
      if (Number.isFinite(heading) && heading >= 0 && (speed == null || speed > 0.5)) {
        rotatePointer(heading);
      } else if (previous && distanceBetween(previous, coords) >= 2) {
        rotatePointer(getBearing(previous, coords));
      }
    }

    lastGpsRef.current = coords;
    markerRef.current?.setLngLat(coords);

    mapRef.current?.easeTo({ center: coords, duration: 350 });
    void publishPosition(position);
  }

  function permissionError(gpsError) {
    const messages = {
      1: "Location access is blocked for this website. Tap the site icon beside the address bar → Site settings → Location → Allow. Then reload this page and press Start Tracking.",
      2: "Your location is unavailable. Turn on your phone's Location/GPS setting and try again.",
      3: "GPS request timed out. Try again outdoors with Location enabled.",
    };

    setError(
      messages[gpsError.code] ||
      gpsError.message ||
      "Could not get your location."
    );
    trackingRef.current = false;
    setTracking(false);
  }

  async function startTracking() {
    setError("");

    if (!mapReady) {
      setError("Please wait for the map to load.");
      return;
    }

    if (!window.isSecureContext) {
      setError("Location requires HTTPS. Use your HTTPS website or localhost.");
      return;
    }

    if (!navigator.geolocation) {
      setError("This browser does not support location access.");
      return;
    }

    if (trackingRef.current || watchIdRef.current !== null) return;

    // Check browser permission state, but still call getCurrentPosition
    // directly so the browser can prompt when permission is not decided.
    try {
      if (navigator.permissions?.query) {
        const permission = await navigator.permissions.query({
          name: "geolocation",
        });

        if (permission.state === "denied") {
          setError(
            "Location is already blocked for this website, so the browser will not show a popup. Open the browser site settings, change Location to Allow, reload the page, and press Start Tracking again."
          );
          return;
        }
      }
    } catch (e) {
      // Some browsers do not support the geolocation Permissions query.
      console.info("Permission status query is unavailable:", e);
    }

    setError("Waiting for location permission…");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!mountedRef.current || trackingRef.current) return;

        trackingRef.current = true;
        setTracking(true);
        setError("");

        // GPS is requested first. Compass permission is independent.
        void enableCompass();

        handlePosition(position);

        watchIdRef.current = navigator.geolocation.watchPosition(
          handlePosition,
          permissionError,
          { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 }
        );

        const { error: startError } = await supabase
          .from("demo_live_tracking")
          .upsert(
            {
              id: DEMO_ID,
              is_started: true,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              speed: Number.isFinite(position.coords.speed) ? position.coords.speed : null,
              heading: headingRef.current,
              trail: trailRef.current,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );

        if (startError && mountedRef.current) {
          console.error(startError);
          setError("GPS started, but Supabase could not save the tracking status.");
        }
      },
      permissionError,
      { enableHighAccuracy: true, maximumAge: 0, timeout: 20000 }
    );
  }

  async function stopTracking() {
    trackingRef.current = false;

    window.removeEventListener("deviceorientation", handleOrientation, true);
    window.removeEventListener("deviceorientationabsolute", handleOrientation, true);
    compassRef.current = false;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setTracking(false);

    const { error: stopError } = await supabase
      .from("demo_live_tracking")
      .update({ is_started: false, updated_at: new Date().toISOString() })
      .eq("id", DEMO_ID);

    if (stopError) {
      console.error(stopError);
      setError("Tracking stopped locally, but Supabase status could not update.");
    }
  }

  function centerOnLocation() {
    const coords = location
      ? [location.longitude, location.latitude]
      : ROUTE[0].coordinates;

    mapRef.current?.flyTo({ center: coords, zoom: 17, duration: 450 });
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
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
            ...styles.status,
            background: tracking ? "#eaf8ef" : "#fff4df",
            color: tracking ? "#15803d" : "#a16207",
          }}
        >
          {tracking ? "● GPS tracking active" : "● Tracking stopped"}
        </div>
      </header>

      <section className="track-running-layout" style={styles.layout}>
        <div style={styles.mapBox}>
          <div ref={mapContainer} style={styles.map} />

          {!mapReady && !mapError && (
            <div style={styles.overlay}>Loading map…</div>
          )}

          {mapError && (
            <div style={{ ...styles.overlay, color: "#b91c1c" }}>
              {mapError}
            </div>
          )}

          <button onClick={centerOnLocation} style={styles.centerButton}>
            Center map
          </button>
        </div>

        <aside style={styles.panel}>
          <div style={{ color: BLUE, fontSize: 11, fontWeight: 850 }}>
            DRIVER CONTROLS
          </div>

          <h2 style={{ margin: "8px 0 6px", fontSize: 23 }}>
            Live tracking
          </h2>

          <p style={styles.description}>
            Start tracking and allow GPS access. Your location will be
            shared with the passenger demo page.
          </p>

          <button
            onClick={tracking ? stopTracking : startTracking}
            disabled={!mapReady}
            style={{
              ...styles.primaryButton,
              background: tracking ? "#dc2626" : BLUE,
              opacity: mapReady ? 1 : 0.6,
            }}
          >
            {!mapReady ? "Loading map…" : tracking ? "Stop Tracking" : "Start Tracking"}
          </button>

          {error && <div role="alert" style={styles.error}>{error}</div>}

          <div style={styles.locationCard}>
            <strong style={{ fontSize: 13 }}>Your GPS location</strong>

            {location ? (
              <div style={styles.locationDetails}>
                <div>Latitude: {location.latitude.toFixed(6)}</div>
                <div>Longitude: {location.longitude.toFixed(6)}</div>
                <div>Accuracy: about {location.accuracy} m</div>
                <div>
                  Direction: {Number.isFinite(location.heading)
                    ? `${Math.round(location.heading)}°`
                    : "Waiting for compass"}
                </div>
              </div>
            ) : (
              <p style={styles.description}>
                Your location appears here when you start tracking.
              </p>
            )}
          </div>

          <div style={{ marginTop: 22 }}>
            <strong style={{ fontSize: 13 }}>Route stops</strong>

            {ROUTE.map((point, index) => (
              <div key={point.id} style={styles.routeStop}>
                <div
                  style={{
                    ...styles.stopBadge,
                    background: index === 0 ? "#fff4df" : "#fff0f0",
                    color: index === 0 ? "#a16207" : "#dc2626",
                  }}
                >
                  {point.label}
                </div>

                <div>
                  <div style={{ fontSize: 13, fontWeight: 750 }}>{point.name}</div>
                  <div style={{ color: "#8995a8", fontSize: 11 }}>
                    {index === 0 ? "Starting point" : "Route stop"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <style>{`
        * { box-sizing: border-box; }

        html, body, #root {
          min-height: 100%;
          height: auto;
          overflow-y: auto !important;
        }

        body {
          margin: 0;
          -webkit-overflow-scrolling: touch;
        }

        .track-running-layout {
          touch-action: pan-y;
        }

        @media (max-width: 850px) {
          .track-running-layout {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    height: "auto",
    overflow: "visible",
    padding: "16px",
    background: "#f3f6fb",
    color: "#14213d",
    fontFamily: "Inter, system-ui, sans-serif",
    boxSizing: "border-box",
  },
  header: {
    maxWidth: 1400,
    margin: "0 auto 14px",
    padding: "16px 20px",
    background: "#fff",
    border: "1px solid #e4eaf2",
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
  },
  status: {
    padding: "8px 12px",
    borderRadius: 30,
    fontWeight: 750,
    fontSize: 12,
  },
  layout: {
    maxWidth: 1400,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 310px",
    gap: 16,
    alignItems: "start",
  },
  mapBox: {
    position: "relative",
    height: "280px",
    minHeight: "240px",
    overflow: "hidden",
    background: "#e6edf5",
    border: "1px solid #dce5ef",
    borderRadius: 20,
    touchAction: "pan-y",
  },
  map: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    touchAction: "pan-y",
  },
  overlay: {
    position: "absolute",
    zIndex: 3,
    top: 12,
    left: 12,
    right: 12,
    padding: 12,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 4px 18px #0001",
    fontSize: 13,
  },
  centerButton: {
    position: "absolute",
    zIndex: 4,
    left: 12,
    bottom: 12,
    padding: "10px 13px",
    border: "1px solid #e1e7ef",
    borderRadius: 10,
    background: "#fff",
    fontWeight: 750,
    cursor: "pointer",
  },
  panel: {
    padding: 20,
    border: "1px solid #e4eaf2",
    borderRadius: 20,
    background: "#fff",
    minWidth: 0,
  },
  description: {
    color: "#68778e",
    fontSize: 13,
    lineHeight: 1.65,
  },
  primaryButton: {
    width: "100%",
    minHeight: 48,
    marginTop: 16,
    border: 0,
    borderRadius: 12,
    color: "#fff",
    fontSize: 14,
    fontWeight: 850,
    cursor: "pointer",
  },
  error: {
    marginTop: 14,
    padding: 13,
    borderRadius: 12,
    background: "#fff1f2",
    color: "#b91c1c",
    fontSize: 12,
    lineHeight: 1.7,
    overflowWrap: "anywhere",
  },
  locationCard: {
    marginTop: 18,
    padding: 14,
    borderRadius: 12,
    background: "#f4f7fc",
  },
  locationDetails: {
    marginTop: 8,
    color: "#52627a",
    fontSize: 12,
    lineHeight: 1.8,
    overflowWrap: "anywhere",
  },
  routeStop: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 14,
  },
  stopBadge: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    fontWeight: 850,
    fontSize: 12,
  },
};
