import { useEffect, useMemo, useState } from "react";
import { Link, useSearch } from "@tanstack/react-router";

import {
  BusFront,
  Building2,
  CalendarDays,
  Navigation,
  Route as RouteIcon,
  X,
} from "lucide-react";

import PassengerBottomNav from "../../components/PassengerBottomNav";
import { supabase } from "../../lib/supabase";

import "../../styles/LiveBusResults.css";


/* =========================================================
   HELPERS
   ========================================================= */

const normalize = (value = "") =>
  String(value)
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");


const formatTime = (time) => {
  if (!time) return "--";

  const [hours, minutes] = String(time).split(":");
  const hour = Number(hours);

  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;

  return `${hour12}:${minutes} ${suffix}`;
};


const formatDate = (date) => {
  if (!date) return "";

  const parsed = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};


const timeToMinutes = (time) => {
  if (!time) return null;

  const [hours, minutes] = String(time)
    .split(":")
    .map(Number);

  return hours * 60 + minutes;
};


const calculateDuration = (start, end) => {
  if (!start || !end) return "--";

  let startMinutes = timeToMinutes(start);
  let endMinutes = timeToMinutes(end);

  if (
    startMinutes === null ||
    endMinutes === null
  ) {
    return "--";
  }

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const difference = endMinutes - startMinutes;

  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
};


const getStopTime = (stop) => {
  if (!stop) return null;

  return (
    stop.departure_time ||
    stop.arrival_time ||
    null
  );
};


/* =========================================================
   BUS CATEGORY IMAGE
   ========================================================= */

const ORDINARY_BUS_IMAGE =
  "https://www.onlineupsrtc.co.in/assets/icons/Ordinary.png";

const AC_BUS_IMAGE =
  "https://www.onlineupsrtc.co.in/assets/icons/bus_ac_janrath_2x2.png";


const isAcBus = (bus) => {
  const type = String(
    bus?.bus_type ||
      bus?.bus_category ||
      bus?.category ||
      ""
  ).toLowerCase();

  /*
   * Important:
   * "NON AC ORDINARY" must NOT be detected as AC.
   */
  return (
    type.includes("ac") &&
    !type.includes("non ac") &&
    !type.includes("non-ac")
  );
};


const getBusCategoryImage = (bus) => {
  return isAcBus(bus)
    ? AC_BUS_IMAGE
    : ORDINARY_BUS_IMAGE;
};


const getBusCategoryLabel = (bus) => {
  return isAcBus(bus)
    ? "AC"
    : "ORDINARY";
};


/* =========================================================
   MAIN COMPONENT
   ========================================================= */

export default function LiveBusResults() {
  const search = useSearch({ strict: false });


  /* =======================================================
     SEARCH PARAMETERS
     ======================================================= */

  const from =
    search?.from ||
    search?.source ||
    search?.boarding ||
    "";

  const to =
    search?.to ||
    search?.destination ||
    search?.drop ||
    "";

  const selectedDate =
    search?.date ||
    search?.serviceDate ||
    "";


  /* =======================================================
     STATE
     ======================================================= */

  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRoute, setSelectedRoute] =
    useState(null);

  const [liveLocations, setLiveLocations] =
    useState({});


  /* =======================================================
     FETCH BUSES
     ======================================================= */

  const loadBuses = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } =
        await supabase
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

      if (fetchError) {
        console.error(
          "Supabase bus error:",
          fetchError
        );

        setError(
          "Unable to load buses. Please try again."
        );

        setBuses([]);
        return;
      }

      const formattedBuses =
        (data || []).map((bus) => ({
          ...bus,

          bus_schedule: [
            ...(bus.bus_schedule || []),
          ].sort(
            (a, b) =>
              Number(a.stop_order) -
              Number(b.stop_order)
          ),
        }));

      setBuses(formattedBuses);

    } catch (err) {
      console.error(err);

      setError(
        "Something went wrong while loading buses."
      );

      setBuses([]);

    } finally {
      setLoading(false);
    }
  };


  /* =======================================================
     INITIAL LOAD
     ======================================================= */

  useEffect(() => {
    loadBuses();

    const refresh = () => {
      loadBuses();
    };

    window.addEventListener(
      "bussinn:buses",
      refresh
    );

    return () => {
      window.removeEventListener(
        "bussinn:buses",
        refresh
      );
    };
  }, []);


  /* =======================================================
     LIVE LOCATION
     ======================================================= */

  useEffect(() => {
    const loadLiveLocations = async () => {
      const {
        data,
        error: locationError,
      } = await supabase
        .from("live_locations")
        .select("*");

      if (locationError) {
        console.warn(
          "Live location error:",
          locationError
        );
        return;
      }

      const locationMap = {};

      (data || []).forEach((location) => {
        if (location.bus_id) {
          locationMap[location.bus_id] =
            location;
        }
      });

      setLiveLocations(locationMap);
    };

    loadLiveLocations();


    const channel = supabase
      .channel("bussinn-live-locations")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_locations",
        },
        (payload) => {
          const newLocation = payload.new;

          if (!newLocation?.bus_id) {
            return;
          }

          setLiveLocations((previous) => ({
            ...previous,

            [newLocation.bus_id]:
              newLocation,
          }));
        }
      )
      .subscribe();


    return () => {
      supabase.removeChannel(channel);
    };
  }, []);


  /* =======================================================
     FILTER BUSES
     ======================================================= */


const matchingBuses = useMemo(() => {
  const fromValue = normalize(from);
  const toValue = normalize(to);

  // Don't show every bus if either search field is empty.
  if (!fromValue || !toValue) return [];

  return buses.filter((bus) => {
    const stops = [...(bus.bus_schedule || [])].sort(
      (a, b) => Number(a.stop_order) - Number(b.stop_order)
    );

    // The schedule is the source of truth for intermediate stops.
    if (stops.length > 0) {
      const fromIndex = stops.findIndex(
        (stop) => normalize(stop.station_name) === fromValue
      );

      const toIndex = stops.findIndex(
        (stop) => normalize(stop.station_name) === toValue
      );

      // Both stops must exist, and the destination must come
      // after the boarding point in the bus's route.
      return (
        fromIndex !== -1 &&
        toIndex !== -1 &&
        fromIndex < toIndex
      );
    }

    // Fallback only for buses without a schedule.
    // Never include unrelated buses.
    return (
      normalize(bus.source) === fromValue &&
      normalize(bus.destination) === toValue
    );
  });
}, [buses, from, to]);



  /* =======================================================
     GET BOARDING / DESTINATION STOPS
     ======================================================= */


const getRouteStops = (bus) => {
  const stops = [...(bus.bus_schedule || [])].sort(
    (a, b) => Number(a.stop_order) - Number(b.stop_order)
  );

  const normalizedFrom = normalize(from);
  const normalizedTo = normalize(to);

  const fromIndex = stops.findIndex(
    (stop) => normalize(stop.station_name) === normalizedFrom
  );

  const toIndex = stops.findIndex(
    (stop) => normalize(stop.station_name) === normalizedTo
  );

  if (
    fromIndex !== -1 &&
    toIndex !== -1 &&
    fromIndex < toIndex
  ) {
    return stops.slice(fromIndex, toIndex + 1);
  }

  // A bus without a schedule is allowed only for an exact
  // source-to-destination match.
  if (
    stops.length === 0 &&
    normalize(bus.source) === normalizedFrom &&
    normalize(bus.destination) === normalizedTo
  ) {
    return [
      {
        id: `${bus.id}-source`,
        stop_order: 1,
        station_name: bus.source,
        departure_time: null,
        arrival_time: null,
      },
      {
        id: `${bus.id}-destination`,
        stop_order: 2,
        station_name: bus.destination,
        departure_time: null,
        arrival_time: null,
      },
    ];
  }

  return [];
};

  /* =======================================================
     LOADING
     ======================================================= */

  if (loading) {
    return (
      <div className="lbr-page">

        <div className="lbr-loading">

          <div className="lbr-loading-icon">
            <BusFront
              size={30}
              strokeWidth={2}
            />
          </div>

          <h2>
            Finding buses...
          </h2>

          <p>
            Checking available buses
            and routes
          </p>

        </div>

      </div>
    );
  }


  /* =======================================================
     MAIN UI
     ======================================================= */

  return (
    <div className="lbr-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="lbr-header">

        <div>
          <h1>
            Live Buses
          </h1>

          <p>
            {from || "Boarding"}{" "}
            <span>→</span>{" "}
            {to || "Destination"}
          </p>
        </div>


        <div className="lbr-live-pill">

          <span />

          LIVE

        </div>

      </header>


      {/* ==================================================
          SEARCH SUMMARY
      ================================================== */}

      <section className="lbr-search-summary">

        <div className="lbr-search-route">

          <div className="lbr-place">

            <span className="lbr-place-dot blue" />

            <div>
              <small>
                FROM
              </small>

              <strong>
                {from ||
                  "Any boarding point"}
              </strong>
            </div>

          </div>


          <div className="lbr-route-arrow">
            →
          </div>


          <div className="lbr-place">

            <span className="lbr-place-dot red" />

            <div>
              <small>
                TO
              </small>

              <strong>
                {to ||
                  "Any destination"}
              </strong>
            </div>

          </div>

        </div>


        {selectedDate && (
          <div className="lbr-date">

            <CalendarDays
              size={14}
              strokeWidth={2}
            />

            {formatDate(
              selectedDate
            )}

          </div>
        )}

      </section>


      {/* ==================================================
          ERROR
      ================================================== */}

      {error && (
        <div className="lbr-error">

          <strong>
            Something went wrong
          </strong>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={loadBuses}
          >
            Try again
          </button>

        </div>
      )}


      {/* ==================================================
          NO BUSES
      ================================================== */}

      {!error &&
        matchingBuses.length === 0 && (
          <div className="lbr-empty">

            <div className="lbr-empty-icon">
              <BusFront
                size={27}
                strokeWidth={1.8}
              />
            </div>

            <h2>
              No buses found
            </h2>

            <p>
              We couldn't find any
              buses for{" "}
              <strong>
                {from ||
                  "your boarding point"}
              </strong>{" "}
              to{" "}
              <strong>
                {to ||
                  "your destination"}
              </strong>

              {selectedDate
                ? ` on ${formatDate(
                    selectedDate
                  )}.`
                : "."}
            </p>

          </div>
        )}


      {/* ==================================================
          BUS LIST
      ================================================== */}

      <main className="lbr-list">

        {matchingBuses.map((bus) => {

          const routeStops =
            getRouteStops(bus);

          const firstStop =
            routeStops[0];

          const lastStop =
            routeStops[
              routeStops.length - 1
            ];

          const liveLocation =
            liveLocations[bus.id];

          const isLive =
            Boolean(liveLocation);

          const duration =
            calculateDuration(
              getStopTime(
                firstStop
              ),
              lastStop?.arrival_time ||
                lastStop?.departure_time
            );


          return (
            <article
              key={bus.id}
              className="lbr-bus-card"
            >

              {/* ==========================================
                  BUS HEADER
              ========================================== */}

              <div className="lbr-card-header">

                <div className="lbr-card-title-area">

                  <h2>
                    {bus.name ||
                      bus.bus_name ||
                      "UPSRTC Bus"}
                  </h2>

                  <p>
                    {bus.operator ||
                      "UPSRTC"}

                    {bus.bus_type && (
                      <>
                        {" "}
                        •{" "}
                        {bus.bus_type}
                      </>
                    )}
                  </p>

                </div>


                {/* TRIP LABEL + BUS IMAGE */}

                <div className="lbr-trip-area">

                  <div className="lbr-trip">
                    {bus.trip_label ||
                      "BUS"}
                  </div>

                  <img
                    src={getBusCategoryImage(
                      bus
                    )}
                    alt={`${getBusCategoryLabel(
                      bus
                    )} bus`}
                    className="lbr-bus-category-image"
                    onError={(event) => {
                      event.currentTarget.src =
                        ORDINARY_BUS_IMAGE;
                    }}
                  />

                  <span className="lbr-category-label">
                    {getBusCategoryLabel(
                      bus
                    )}
                  </span>

                </div>

              </div>


              {/* ==========================================
                  DEPOT / BUS NUMBER
              ========================================== */}

              {(bus.depot ||
                bus.bus_number) && (

                <div className="lbr-meta-row">

                  {bus.depot && (
                    <span className="lbr-meta-item">

                      <Building2
                        size={14}
                        strokeWidth={2}
                      />

                      {bus.depot}

                    </span>
                  )}


                  {bus.bus_number && (
                    <span className="lbr-meta-item">

                      <BusFront
                        size={14}
                        strokeWidth={2}
                      />

                      {bus.bus_number}

                    </span>
                  )}

                </div>

              )}


              {/* ==========================================
                  ROUTE
              ========================================== */}

              <div className="lbr-route-box">

                <div className="lbr-route-station">

                  <span className="lbr-route-label">
                    BOARDING
                  </span>

                  <strong>
                    {firstStop?.station_name ||
                      bus.source}
                  </strong>

                  <span className="lbr-route-time">
                    {formatTime(
                      firstStop?.departure_time ||
                        firstStop?.arrival_time
                    )}
                  </span>

                </div>


                <div className="lbr-route-middle">

                  <span>
                    {duration}
                  </span>

                  <div className="lbr-route-line">

                    <span />

                    <div />

                    <span />

                  </div>

                  <small>
                    {routeStops.length} stops
                  </small>

                </div>


                <div className="lbr-route-station right">

                  <span className="lbr-route-label">
                    ARRIVAL
                  </span>

                  <strong>
                    {lastStop?.station_name ||
                      bus.destination}
                  </strong>

                  <span className="lbr-route-time">
                    {formatTime(
                      lastStop?.arrival_time ||
                        lastStop?.departure_time
                    )}
                  </span>

                </div>

              </div>


              {/* ==========================================
                  INFO
              ========================================== */}

              <div className="lbr-info-row">

                <div>

                  <small>
                    Fare
                  </small>

                  <strong>
                    ₹{bus.fare || 0}
                  </strong>

                </div>


                <div>

                  <small>
                    Stops
                  </small>

                  <strong>
                    {routeStops.length}
                  </strong>

                </div>


                <div>

                  <small>
                    Status
                  </small>

                  <strong
                    className={
                      isLive
                        ? "lbr-green"
                        : "lbr-gray"
                    }
                  >
                    {isLive
                      ? "● Live"
                      : "Scheduled"}
                  </strong>

                </div>

              </div>


              {/* ==========================================
                  ACTION BUTTONS
              ========================================== */}

              <div className="lbr-actions">

                <button
                  type="button"
                  className="lbr-route-button"
                  onClick={() =>
                    setSelectedRoute(
                      bus
                    )
                  }
                >

                  <RouteIcon
                    size={17}
                    strokeWidth={2.2}
                  />

                  <span>
                    Route
                  </span>

                </button>


                <Link
  to="/trackbus"
  search={{
    busId: String(bus.id),
    from: from,
    to: to,
    date: selectedDate,
  }}
  className="lbr-track-button"
>
  <Navigation
    size={17}
    strokeWidth={2.2}
  />

  <span>
    Track
  </span>
</Link>

              </div>


              {/* ==========================================
                  LIVE LOCATION
              ========================================== */}

              {isLive && (
                <div className="lbr-live-location">

                  <span className="lbr-pulse" />

                  <span>
                    {liveLocation.location_name ||
                      "Bus is currently live"}
                  </span>

                  {liveLocation.speed !==
                    null &&
                    liveLocation.speed !==
                      undefined && (

                    <span>
                      {Math.round(
                        Number(
                          liveLocation.speed
                        )
                      )}{" "}
                      km/h
                    </span>

                  )}

                </div>
              )}

            </article>
          );
        })}

      </main>


      {/* ==================================================
          ROUTE MODAL
      ================================================== */}

      {selectedRoute && (

        <div
          className="lbr-modal-overlay"
          onClick={() =>
            setSelectedRoute(null)
          }
        >

          <div
            className="lbr-route-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="lbr-modal-header">

              <div>

                <span>
                  BUS ROUTE
                </span>

                <h2>
                  {selectedRoute.trip_label ||
                    selectedRoute.name}
                </h2>

              </div>


              <button
                type="button"
                className="lbr-modal-close"
                onClick={() =>
                  setSelectedRoute(null)
                }
                aria-label="Close route"
              >

                <X
                  size={20}
                  strokeWidth={2.2}
                />

              </button>

            </div>


            {/* ROUTE STOPS */}

            <div className="lbr-modal-route">

              {getRouteStops(
                selectedRoute
              ).map(
                (
                  stop,
                  index,
                  array
                ) => {

                  const isFirst =
                    index === 0;

                  const isLast =
                    index ===
                    array.length - 1;


                  return (
                    <div
                      key={
                        stop.id ||
                        stop.stop_order ||
                        index
                      }
                      className="lbr-modal-stop"
                    >

                      <div className="lbr-modal-timeline">

                        <span
                          className={
                            isFirst
                              ? "start"
                              : isLast
                              ? "end"
                              : ""
                          }
                        />

                        {!isLast && (
                          <div />
                        )}

                      </div>


                      <div className="lbr-modal-stop-info">

                        <div>

                          <strong>
                            {
                              stop.station_name
                            }
                          </strong>

                          <small>
                            {isFirst
                              ? "Boarding"
                              : isLast
                              ? "Destination"
                              : "Stop"}
                          </small>

                        </div>

                      </div>


                      <div className="lbr-modal-time">

                        <strong>
                          {formatTime(
                            stop.arrival_time ||
                              stop.departure_time
                          )}
                        </strong>

                        {stop.departure_time &&
                          stop.arrival_time &&
                          stop.departure_time !==
                            stop.arrival_time && (

                            <small>
                              Dep.{" "}
                              {formatTime(
                                stop.departure_time
                              )}
                            </small>

                          )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>


            {/* MODAL TRACK BUTTON */}

         <Link
  to="/trackbus"
  search={{
    busId: String(selectedRoute.id),
    from: from,
    to: to,
    date: selectedDate,
  }}
  className="lbr-modal-track"
>
  <Navigation
    size={18}
    strokeWidth={2.2}
  />

  <span>
    Track This Bus
  </span>
</Link>

          </div>

        </div>

      )}


      {/* ==================================================
          BOTTOM NAV
      ================================================== */}

      <PassengerBottomNav />

    </div>
  );
}