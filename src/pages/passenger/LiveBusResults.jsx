import { matchesRoute } from "../../algorithms/routeMatcher";
import { useEffect, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import { fetchBuses } from "../../services/busService";
import { fetchRouteByBus } from "../../services/routeService";
import "../../styles/LiveBusResults.css";
import { supabase } from "../../lib/supabase";

const LiveBusResults = () => {
  const [buses, setBuses] = useState([]);
  const [selectedBusRoute, setSelectedBusRoute] = useState(null);

  const searchParams = useSearch({ strict: false });
  const searchFrom = searchParams?.from || "Pune";
  const searchTo = searchParams?.to || "Mumbai";
  const searchDate = searchParams?.date || new Date().toISOString();

  // Format the date for nice display (e.g., "Sat, Aug 19")
  const formattedDisplayDate = (() => {
    try {
      const d = new Date(searchDate);
      return d.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Today";
    }
  })();

    useEffect(() => {
    const loadBuses = async () => {
      try {
        // Get buses together with their saved routes.
        const allBuses = await fetchBuses();

        // Keep only buses whose route contains the searched
        // boarding point and destination.
        const filteredBuses = allBuses.filter((bus) => {
          const stops = bus.routeStops || bus.stops || [];

          if (stops.length === 0) {
            return false;
          }

          const normalizedStops = stops.map((stop, index) => {
            if (typeof stop === "string") {
              return {
                id: String(index),
                name: stop,
                latitude: 0,
                longitude: 0,
              };
            }

            return {
              id: stop.id || String(index),
              name: stop.name || stop.stopName || "",
              latitude: Number(stop.latitude) || 0,
              longitude: Number(stop.longitude) || 0,
            };
          });

          return matchesRoute(
            normalizedStops,
            searchFrom,
            searchTo
          );
        });

        // Get the latest live GPS locations.
        const { data: locations, error } = await supabase
          .from("live_locations")
          .select("*");

        if (error) {
          console.error(
            "Error fetching live locations:",
            error
          );
        }

        // Attach the latest GPS data to each matching bus.
        const busesWithLocations = filteredBuses.map((bus) => {
          const location = (locations || []).find(
            (item) => item.bus_id === bus.id
          );

          return {
            ...bus,
            latitude:
              location?.latitude ?? bus.latitude,
            longitude:
              location?.longitude ?? bus.longitude,
            speed:
              location?.speed ?? bus.speed,
            heading:
              location?.heading ?? bus.heading,
            updatedAt:
              location?.updated_at ?? bus.updatedAt,
          };
        });

        setBuses(busesWithLocations);
      } catch (error) {
        console.error("Error loading buses:", error);
        setBuses([]);
      }
    };

    loadBuses();

    window.addEventListener("bussinn:buses", loadBuses);

    // Subscribe to live GPS changes.
    const channel = supabase
      .channel("live-bus-locations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_locations",
        },
        (payload) => {
          console.log(
            "LIVE LOCATION CHANGED:",
            payload
          );

          if (!payload.new?.bus_id) {
            return;
          }

          setBuses((currentBuses) =>
            currentBuses.map((bus) => {
              if (bus.id !== payload.new.bus_id) {
                return bus;
              }

              return {
                ...bus,
                latitude: payload.new.latitude,
                longitude: payload.new.longitude,
                speed: payload.new.speed,
                heading: payload.new.heading,
                updatedAt: payload.new.updated_at,
              };
            })
          );
        }
      )
      .subscribe((status) => {
        console.log(
          "Live Bus Realtime Status:",
          status
        );
      });

    return () => {
      window.removeEventListener(
        "bussinn:buses",
        loadBuses
      );

      supabase.removeChannel(channel);
    };
  }, [searchFrom, searchTo]);

  const handleViewRoute = async (bus) => {
    try {
      const route = await fetchRouteByBus(bus.id);

      if (!route) {
        console.error(
          "Route not found for bus:",
          bus.id
        );
        return;
      }

      setSelectedBusRoute({
        ...bus,
        routeName: route.routeName,
        evaluatedStops: route.stops,
      });
    } catch (error) {
      console.error(
        "Error loading bus route:",
        error
      );
    }
  };

  const checkIfDeparted = (startTimeStr) => {
    if (!startTimeStr) return true;

    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    const [busHours, busMinutes] =
      startTimeStr.split(":").map(Number);

    if (
      Number.isNaN(busHours) ||
      Number.isNaN(busMinutes)
    ) {
      return true;
    }

    return (
      currentHours * 60 + currentMinutes >=
      busHours * 60 + busMinutes
    );
  };

  return (
    <div className="page mobile-page-container">
      <div className="app-content search-results-layout">

        <header className="results-hero-header">
          <div className="header-top-row">
            <h1 className="hero-title">
              Live Buses
            </h1>

            <div className="brand-pill">
              <span className="material-symbols-outlined text-sm">
                directions_bus
              </span>
              <span>BussInn</span>
            </div>
          </div>

                    <div className="floating-search-card">
            <div className="search-route-display">
              <span className="route-text">
                {searchFrom}
              </span>

              <span className="material-symbols-outlined text-primary">
                arrow_forward
              </span>

              <span className="route-text">
                {searchTo}
              </span>
            </div>

            <div className="search-meta-row">
              <span className="meta-date">
                {formattedDisplayDate}
              </span>

              <Link
                to="/passenger/search"
                search={{
                  from: searchFrom,
                  to: searchTo,
                }}
                className="change-search-link"
              >
                Change
              </Link>
            </div>
          </div>
        </header>

        <main className="results-main-content">

          <div className="results-count-text">
            Found {buses.length} active buses matching
            your route
          </div>

          {buses.length === 0 ? (
            <div className="empty-results-box">
              <p>
                No buses listed right now. Please check
                back soon.
              </p>
            </div>
          ) : (
            <div className="buses-list-container">
              {buses.map((bus) => {
                const hasDeparted =
                  checkIfDeparted(bus.startTime);

                const busId =
                  bus.id || "default-bus-id";

                const busStops =
                  bus.routeStops ||
                  bus.stops || [
                    {
                      name: searchFrom,
                      time:
                        bus.startTime || "22:00",
                    },
                    {
                      name: searchTo,
                      time:
                        bus.arrivalTime || "05:15",
                    },
                  ];

                return (
                  <div
                    key={busId}
                    className="bus-result-card"
                  >
                    <div className="card-accent-bar"></div>

                    <div className="bus-card-inner">

                                            <div className="bus-card-top">
                        <div>
                          <div className="bus-status-badges">
                            <span className="live-badge">
                              <span className="pulse-dot"></span>
                              Live
                            </span>
                          </div>
                        </div>

                        <div className="bus-rating-box">

                          <div className="rating-badge-pill">
                            ⭐{" "}
                            {bus.rating || "4.8"}
                          </div>

                          <span className="reviews-count-text">
                            {bus.reviewsCount ||
                              209}{" "}
                            reviews
                          </span>

                          <div className="confidence-meter-wrap">
                            <div className="confidence-bar-bg">
                              <div
                                className="confidence-bar-fill"
                                style={{
                                  width:
                                    bus.confidence ||
                                    "95%",
                                }}
                              ></div>
                            </div>

                            <span className="confidence-label">
                              Confidence:{" "}
                              {bus.confidence ||
                                "95%"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bus-journey-timeline">

                        <div className="time-block">
                          <div className="time-val">
                            {bus.startTime ||
                              "22:00"}
                          </div>

                          <div className="location-val">
                            {searchFrom}
                          </div>
                        </div>

                        <div className="duration-center-line">
                          <span className="duration-text">
                            🕒{" "}
                            {bus.duration ||
                              "7h 15m"}
                          </span>

                          <div className="timeline-line-bar">
                            <span className="material-symbols-outlined timeline-bus-icon">
                              directions_bus
                            </span>
                          </div>
                        </div>

                        <div className="time-block right">
                          <div className="time-val">
                            {bus.arrivalTime ||
                              "05:15"}
                          </div>

                          <div className="eta-val">
                            ETA:{" "}
                            {bus.eta ||
                              "12 mins"}
                          </div>

                          <div className="location-val">
                            {searchTo}
                          </div>
                        </div>
                      </div>

                      <div className="bus-card-footer-row">

                        <div className="price-display-block">
                          <span className="est-amount-label">
                            Estimated Amount
                          </span>

                          <div className="price-row-flex">
                            {bus.originalPrice && (
                              <span className="original-price">
                                ₹
                                {
                                  bus.originalPrice
                                }
                              </span>
                            )}

                            <span className="final-price">
                              ₹
                              {bus.estimatedPrice ||
                                bus.price ||
                                "559"}
                            </span>
                          </div>
                        </div>

                        <div className="action-buttons-group">

                          {hasDeparted && (
                            <Link
                              to="/passenger/route/$busId"
                              params={{
                                busId:
                                  String(busId),
                              }}
                              search={{
                                from: searchFrom,
                                to: searchTo,
                              }}
                              className="btn-track-action"
                            >
                              📍 Track
                            </Link>
                          )}

                          <button
                            onClick={() =>
                              handleViewRoute(bus)
                            }
                            className="btn-route-action"
                            type="button"
                          >
                            Route
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {selectedBusRoute && (
          <div className="route-modal-overlay">
            <div className="route-modal-card">

              <h3 className="modal-title">
                Complete Route Details
              </h3>

              <p className="modal-sub">
                Full sequence for{" "}
                {selectedBusRoute.name ||
                  "Selected Bus"}
              </p>

              <div className="stops-list-scroll">
                {(
                  selectedBusRoute.evaluatedStops ||
                  []
                ).map((stop, index) => {
                  const stopName =
                    typeof stop === "string"
                      ? stop
                      : stop.name ||
                        stop.stopName ||
                        "";

                  return (
                    <div
                      key={index}
                      className="stop-item-row"
                    >
                      <div className="stop-dot"></div>

                      <span className="stop-name">
                        {stopName}
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() =>
                  setSelectedBusRoute(null)
                }
                className="btn-close-modal"
                type="button"
              >
                Close Route View
              </button>
            </div>
          </div>
        )}

        <PassengerBottomNav />

      </div>
    </div>
  );
};

export default LiveBusResults;