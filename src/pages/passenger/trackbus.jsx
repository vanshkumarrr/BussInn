import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Clock3,
  MapPin,
  Navigation,
  Route as RouteIcon,
} from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { supabase } from "../../lib/supabase";
import "../../styles/TrackBus.css";
const ORDINARY_BUS_IMAGE =
  "https://www.onlineupsrtc.co.in/assets/icons/Ordinary.png";

const AC_BUS_IMAGE =
  "https://www.onlineupsrtc.co.in/assets/icons/bus_ac_janrath_2x2.png";

const getBusImage = (busType) => {
  const type = String(busType || "").trim().toUpperCase();

  if (type.includes("NON AC") || type.includes("ORDINARY")) {
    return ORDINARY_BUS_IMAGE;
  }

  return AC_BUS_IMAGE;
};

const formatTime = (time) => {
  if (!time) return "--";

  const [hoursString, minutesString] = String(time).split(":");

  let hours = Number(hoursString);
  const minutes = Number(minutesString);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time;
  }

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;

  if (hours === 0) {
    hours = 12;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )} ${period}`;
};

const normalizeName = (name) =>
  String(name || "")
    .trim()
    .toUpperCase();

const isSameStop = (a, b) =>
  normalizeName(a?.station_name) === normalizeName(b?.station_name);

export default function TrackBus() {
  const navigate = useNavigate();

  const {
    busId,
    from = "",
    to = "",
    date = "",
  } = useSearch({
    from: "/trackbus",
  });

  const [bus, setBus] = useState(null);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
   * ------------------------------------------------------------
   * LOAD BUS + SCHEDULE
   * ------------------------------------------------------------
   */

  useEffect(() => {
    let mounted = true;

    const loadBus = async () => {
      if (!busId) {
        setError("Bus information is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const { data: busData, error: busError } = await supabase
          .from("buses")
          .select("*")
          .eq("id", busId)
          .maybeSingle();

        if (busError) {
          throw busError;
        }

        if (!busData) {
          throw new Error("Bus not found.");
        }

        const { data: scheduleData, error: scheduleError } = await supabase
          .from("bus_schedule")
          .select(
            `
              id,
              bus_id,
              stop_order,
              station_name,
              arrival_time,
              departure_time
            `
          )
          .eq("bus_id", busId)
          .order("stop_order", { ascending: true });

        if (scheduleError) {
          throw scheduleError;
        }

        if (!mounted) return;

        setBus(busData);
        setStops(scheduleData || []);
      } catch (err) {
        console.error("Track bus loading error:", err);

        if (!mounted) return;

        setError(
          err?.message ||
            "Unable to load this bus right now. Please try again."
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadBus();

    return () => {
      mounted = false;
    };
  }, [busId]);

  /*
   * ------------------------------------------------------------
   * REALTIME BUS UPDATE
   * ------------------------------------------------------------
   */

  useEffect(() => {
    if (!busId) return;

    const channel = supabase
      .channel(`track-bus-${busId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "buses",
          filter: `id=eq.${busId}`,
        },
        (payload) => {
          if (payload?.new) {
            setBus((previous) => ({
              ...(previous || {}),
              ...payload.new,
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bus_schedule",
          filter: `bus_id=eq.${busId}`,
        },
        async () => {
          const { data } = await supabase
            .from("bus_schedule")
            .select(
              `
                id,
                bus_id,
                stop_order,
                station_name,
                arrival_time,
                departure_time
              `
            )
            .eq("bus_id", busId)
            .order("stop_order", { ascending: true });

          if (data) {
            setStops(data);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [busId]);

  /*
   * ------------------------------------------------------------
   * BUS IMAGE
   * ------------------------------------------------------------
   */

  const busImage = useMemo(() => {
    return getBusImage(bus?.bus_type);
  }, [bus?.bus_type]);

  /*
   * ------------------------------------------------------------
   * CURRENT STOP
   * ------------------------------------------------------------
   *
   * For now the trip is shown in pre-start state.
   * ANAND VIHAR is therefore always the current stop.
   */

  const currentStop = useMemo(() => {
    return (
      stops.find(
        (stop) => normalizeName(stop.station_name) === "ANAND VIHAR"
      ) ||
      stops[0] ||
      null
    );
  }, [stops]);

  /*
   * ------------------------------------------------------------
   * NEXT STOP
   * ------------------------------------------------------------
   */

  const nextStop = useMemo(() => {
    if (!stops.length) return null;

    const currentIndex = stops.findIndex(
      (stop) => normalizeName(stop.station_name) === "ANAND VIHAR"
    );

    if (currentIndex >= 0 && stops[currentIndex + 1]) {
      return stops[currentIndex + 1];
    }

    return stops[1] || null;
  }, [stops]);

  /*
   * ------------------------------------------------------------
   * PRE-START STATE
   * ------------------------------------------------------------
   */

  const busHasStarted = false;
  const progress = 0;

  /*
   * ------------------------------------------------------------
   * BACK BUTTON
   * ------------------------------------------------------------
   *
   * This preserves the previous results page exactly as it was.
   */

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }

    navigate({
      to: "/passenger/results",
      search: {
        from,
        to,
        date,
      },
    });
  };

  /*
   * ------------------------------------------------------------
   * LOADING
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="track-page">
        <header className="track-header">
          <button
            type="button"
            className="track-back-button"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ArrowLeft size={21} strokeWidth={2.2} />
          </button>

          <div className="track-header-title">
            <span>Track Bus</span>
          </div>
        </header>

        <main className="track-loading">
          <div className="track-loading-spinner" />
          <p>Loading bus details...</p>
        </main>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * ERROR
   * ------------------------------------------------------------
   */

  if (error || !bus) {
    return (
      <div className="track-page">
        <header className="track-header">
          <button
            type="button"
            className="track-back-button"
            onClick={handleBack}
            aria-label="Go back"
          >
            <ArrowLeft size={21} strokeWidth={2.2} />
          </button>

          <div className="track-header-title">
            <span>Track Bus</span>
          </div>
        </header>

        <main className="track-error">
          <div className="track-error-icon">
            <img
              src={ORDINARY_BUS_IMAGE}
              alt="UPSRTC bus"
              className="track-error-bus-image"
            />
          </div>

          <h2>Unable to load bus</h2>

          <p>
            {error || "The requested bus could not be found."}
          </p>

          <button
            type="button"
            className="track-error-button"
            onClick={handleBack}
          >
            Go Back
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="track-page">
      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="track-header">
        <button
          type="button"
          className="track-back-button"
          onClick={handleBack}
          aria-label="Go back"
        >
          <ArrowLeft size={21} strokeWidth={2.2} />
        </button>

        <div className="track-header-title">
          <span>Track Bus</span>
        </div>
      </header>

      {/* ======================================================
          MAP
      ====================================================== */}

      <section className="track-map">
        <div className="track-map-grid" />

        <div className="track-map-road track-map-road-one" />
        <div className="track-map-road track-map-road-two" />
        <div className="track-map-road track-map-road-three" />

        <div className="track-map-route-line" />

        {/* Route dots */}

        <div className="track-map-stop track-map-stop-one">
          <span />
        </div>

        <div className="track-map-stop track-map-stop-two">
          <span />
        </div>

        <div className="track-map-stop track-map-stop-three">
          <span />
        </div>

        <div className="track-map-stop track-map-stop-four">
          <span />
        </div>

        {/* ==================================================
            BUS MARKER
        ================================================== */}

        <div
          className="track-map-bus"
          style={{
            left: "10%",
            top: "29%",
          }}
        >
          <div className="track-map-bus-pulse" />

          <div className="track-map-bus-marker">
            <img
              src={busImage}
              alt="UPSRTC bus"
              className="track-map-bus-image"
            />
          </div>
        </div>

        {/* Map label */}

        <div className="track-map-label">
          <Navigation size={13} strokeWidth={2.3} />
          <span>ANAND VIHAR</span>
        </div>
      </section>

      {/* ======================================================
          BOTTOM SHEET
      ====================================================== */}

      <main className="track-sheet">
        {/* ==================================================
            BUS SUMMARY
        ================================================== */}

        <section className="track-bus-summary">
          <div className="track-bus-icon">
            <img
              src={busImage}
              alt="UPSRTC bus"
              className="track-bus-image"
            />
          </div>

          <div className="track-bus-summary-content">
            <h1>
              {bus.name ||
                "UPSRTC Anand Vihar - Hamirpur"}
            </h1>

            <div className="track-bus-meta">
              {bus.trip_label && (
                <span>{bus.trip_label}</span>
              )}

              {bus.trip_label && bus.bus_type && (
                <span className="track-meta-dot">•</span>
              )}

              {bus.bus_type && (
                <span>{bus.bus_type}</span>
              )}
            </div>
          </div>
        </section>

        {/* ==================================================
            CURRENT STOP
        ================================================== */}

        <section className="track-current-card">
          <div className="track-current-card-top">
            <div>
              <span className="track-label">
                CURRENT LOCATION
              </span>

              <h2>
                {currentStop?.station_name ||
                  "ANAND VIHAR"}
              </h2>
            </div>

            <div className="track-current-status">
              <span className="track-status-dot" />
              <span>Not started</span>
            </div>
          </div>

          <div className="track-current-time">
            <Clock3 size={17} strokeWidth={2} />

            <span>
              Departure{" "}
              {formatTime(
                currentStop?.departure_time
              )}
            </span>
          </div>

          <div className="track-current-message">
            Bus hasn't started yet
          </div>
        </section>

        {/* ==================================================
            NEXT STOP
        ================================================== */}

        <section className="track-next-card">
          <div className="track-next-icon">
            <MapPin size={20} strokeWidth={2.1} />
          </div>

          <div className="track-next-content">
            <span className="track-label">
              NEXT STOP
            </span>

            <h3>
              {nextStop?.station_name ||
                "CHILLA BORDER DELHI"}
            </h3>

            <div className="track-next-time">
              <Clock3 size={15} strokeWidth={2} />

              <span>
                Scheduled{" "}
                {formatTime(
                  nextStop?.arrival_time
                )}
              </span>
            </div>
          </div>

          <div className="track-next-arrow">
            <Navigation
              size={19}
              strokeWidth={2}
            />
          </div>
        </section>

        {/* ==================================================
            JOURNEY PROGRESS
        ================================================== */}

        <section className="track-progress-section">
          <div className="track-section-heading">
            <div>
              <span className="track-label">
                JOURNEY PROGRESS
              </span>

              <h3>
                {busHasStarted
                  ? "Bus is on the way"
                  : "Bus hasn't started yet"}
              </h3>
            </div>

            <strong>{progress}%</strong>
          </div>

          <div className="track-progress-bar">
            <div
              className="track-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </section>

        {/* ==================================================
            ROUTE
        ================================================== */}

        <section className="track-route-section">
          <div className="track-section-title">
            <RouteIcon
              size={19}
              strokeWidth={2.1}
            />

            <h2>Route</h2>
          </div>

          <div className="track-timeline">
            {stops.map((stop, index) => {
              const isCurrent =
                normalizeName(stop.station_name) ===
                "ANAND VIHAR";

              const isFirst = index === 0;
              const isLast =
                index === stops.length - 1;

              return (
                <div
                  className={`track-stop ${
                    isCurrent
                      ? "current"
                      : index < 0
                      ? "passed"
                      : ""
                  }`}
                  key={
                    stop.id ||
                    `${stop.stop_order}-${stop.station_name}`
                  }
                >
                  {/* Timeline line */}

                  {!isLast && (
                    <div className="track-stop-line" />
                  )}

                  {/* Timeline dot */}

                  <div className="track-stop-dot">
                    {isCurrent && (
                      <span />
                    )}
                  </div>

                  {/* Stop content */}

                  <div className="track-stop-content">
                    <div className="track-stop-main">
                      <h4>
                        {stop.station_name}
                      </h4>

                      <div className="track-stop-times">
                        {stop.arrival_time && (
                          <span>
                            Arrive{" "}
                            {formatTime(
                              stop.arrival_time
                            )}
                          </span>
                        )}

                        {stop.departure_time && (
                          <span>
                            Depart{" "}
                            {formatTime(
                              stop.departure_time
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="track-stop-status">
                      {isFirst ? (
                        <span>
                          Bus hasn't started yet
                        </span>
                      ) : isCurrent ? (
                        <span>Current stop</span>
                      ) : (
                        <span>Upcoming</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ==================================================
            BUS INFORMATION
        ================================================== */}

        <section className="track-info-section">
          <div className="track-section-title">
            <RouteIcon
              size={19}
              strokeWidth={2.1}
            />

            <h2>Bus Information</h2>
          </div>

          <div className="track-info-grid">
            <div className="track-info-item">
              <span>Operator</span>
              <strong>
                {bus.operator || "UPSRTC"}
              </strong>
            </div>

            <div className="track-info-item">
              <span>Bus Type</span>
              <strong>
                {bus.bus_type ||
                  "NON AC ORDINARY"}
              </strong>
            </div>

            <div className="track-info-item">
              <span>Trip</span>
              <strong>
                {bus.trip_label || "--"}
              </strong>
            </div>

            <div className="track-info-item">
              <span>Bus Number</span>
              <strong>
                {bus.bus_number || "--"}
              </strong>
            </div>

            <div className="track-info-item">
              <span>Source</span>
              <strong>
                {bus.source || from || "--"}
              </strong>
            </div>

            <div className="track-info-item">
              <span>Destination</span>
              <strong>
                {bus.destination || to || "--"}
              </strong>
            </div>

            <div className="track-info-item">
              <span>Fare</span>
              <strong>
                {bus.fare != null
                  ? `₹${bus.fare}`
                  : "--"}
              </strong>
            </div>

            <div className="track-info-item">
              <span>Depot</span>
              <strong>
                {bus.depot || "--"}
              </strong>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}