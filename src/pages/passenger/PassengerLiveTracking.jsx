import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "@tanstack/react-router";

import {
  ArrowLeft,
  Check,
  Clock3,
  Navigation,
  PhoneCall,
  Route as RouteIcon,
  ShieldAlert,
  Star,
  Ticket,
  MapPin,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/PassengerLiveTracking.css";

// Bus icons
const ORDINARY_BUS_IMAGE =
  "https://www.onlineupsrtc.co.in/assets/icons/Ordinary.png";

const AC_BUS_IMAGE =
  "https://www.onlineupsrtc.co.in/assets/icons/bus_ac_janrath_2x2.png";

const STOP_CONFIRMATION_MINUTES = 10;
const DROP_RADIUS_METERS = 20_000;
const DEMO_RIDE_REWARD_COINS = 10;

const REASONS = [
  "Bus wasn't clean",
  "Seat wasn't comfortable",
  "Bus was overcrowded",
  "Ride was delayed",
  "Staff behaviour could be better",
];

const normalize = (value) =>
  String(value ?? "")
    .trim()
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

const getName = (stop) =>
  typeof stop === "string"
    ? stop
    : stop?.station_name ||
      stop?.name ||
      stop?.stop_name ||
      "";

const getBusImage = (type) =>
  /ordinary|non\s*ac/i.test(String(type || ""))
    ? ORDINARY_BUS_IMAGE
    : AC_BUS_IMAGE;

const formatTime = (time) => {
  if (!time) return "--";

  const parts = String(time).split(":").map(Number);

  if (
    !Number.isFinite(parts[0]) ||
    !Number.isFinite(parts[1])
  ) {
    return String(time);
  }

  const [hours, minutes] = parts;
  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getStoredRide = () => {
  try {
    return JSON.parse(
      localStorage.getItem("active_ride_details") || "{}"
    );
  } catch {
    return {};
  }
};

const getEndpoint = (ride, keys, fallback) => {
  for (const key of keys) {
    if (
      ride?.[key] != null &&
      String(ride[key]).trim()
    ) {
      return String(ride[key]).trim();
    }
  }

  return fallback;
};

const parseCoordinates = (object) => {
  if (!object) return null;

  const lat = Number(
    object.latitude ??
      object.lat ??
      object.dropLatitude ??
      object.dropLat
  );

  const lng = Number(
    object.longitude ??
      object.lng ??
      object.lon ??
      object.dropLongitude ??
      object.dropLng
  );

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return null;
  }

  return { lat, lng };
};

const toScheduledDate = (time) => {
  if (!time) return null;

  const match = String(time).match(/^(\d{1,2}):(\d{2})/);

  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (hours > 23 || minutes > 59) return null;

  const scheduled = new Date();
  scheduled.setHours(hours, minutes, 0, 0);

  const difference = scheduled.getTime() - Date.now();

  if (difference < -12 * 60 * 60 * 1000) {
    scheduled.setDate(scheduled.getDate() + 1);
  } else if (difference > 12 * 60 * 60 * 1000) {
    scheduled.setDate(scheduled.getDate() - 1);
  }

  return scheduled;
};

const distanceInMeters = (a, b) => {
  if (!a || !b) return Infinity;

  const toRadians = (degrees) =>
    (degrees * Math.PI) / 180;

  const earthRadius = 6_371_000;

  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(dLng / 2) ** 2;

  return (
    2 *
    earthRadius *
    Math.asin(Math.sqrt(haversine))
  );
};

const getEndedRideIds = () => {
  try {
    const value = JSON.parse(
      localStorage.getItem("bussinn_ended_ride_ids") ||
        "[]"
    );

    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export default function PassengerLiveTracking() {
  const navigate = useNavigate();

  const [rideDetails] = useState(() => getStoredRide());
  const [scheduleStops, setScheduleStops] = useState([]);
  const [loadingStops, setLoadingStops] = useState(true);
  const [activeStopIndex, setActiveStopIndex] = useState(0);
  const [now, setNow] = useState(Date.now());

  const [showEarlyEndModal, setShowEarlyEndModal] =
    useState(false);
  const [showRatingModal, setShowRatingModal] =
    useState(false);
  const [rating, setRating] = useState(5);
  const [selectedReasons, setSelectedReasons] =
    useState([]);
  const [savingTrip, setSavingTrip] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState("");
  const [currentLocation, setCurrentLocation] =
    useState(null);
  const [tripEnded, setTripEnded] = useState(false);
  const [rewardResult, setRewardResult] = useState(null);

  const pickup = getEndpoint(
    rideDetails,
    [
      "startLocation",
      "pickupPoint",
      "from",
      "pickup",
      "boardingStop",
    ],
    "Pickup point"
  );

  const drop = getEndpoint(
    rideDetails,
    [
      "endLocation",
      "dropPoint",
      "to",
      "drop",
      "destination",
    ],
    "Drop point"
  );

  const busName = getEndpoint(
    rideDetails,
    ["busName", "name", "bus_name"],
    "Your bus"
  );

  const busType = getEndpoint(
    rideDetails,
    ["serviceType", "busType", "bus_type", "category"],
    "Ordinary"
  );

  const busId =
    rideDetails.busId ||
    rideDetails.bus_id ||
    rideDetails.id ||
    null;

  const busImage = getBusImage(busType);

  const rideLockId = String(
    rideDetails.rideId ||
      rideDetails.bookingId ||
      rideDetails.booking_id ||
      `${busId || "bus"}-${normalize(pickup)}-${normalize(drop)}`
  );

  const dropStop = scheduleStops[scheduleStops.length - 1];

  const dropScheduledTime = useMemo(
    () =>
      toScheduledDate(
        dropStop?.arrival_time ||
          dropStop?.departure_time ||
          rideDetails.busEndTime ||
          rideDetails.arrival_time
      ),
    [
      dropStop?.arrival_time,
      dropStop?.departure_time,
      rideDetails.busEndTime,
      rideDetails.arrival_time,
    ]
  );

  const activeStop = scheduleStops[activeStopIndex];
  const nextStop = scheduleStops[activeStopIndex + 1];

  const nextStopTime = useMemo(
    () =>
      toScheduledDate(
        nextStop?.arrival_time ||
          nextStop?.departure_time
      ),
    [
      nextStop?.arrival_time,
      nextStop?.departure_time,
      now,
    ]
  );

  const stopWindowOpensAt =
    nextStopTime?.getTime() ?? Infinity;

  const stopWindowClosesAt =
    stopWindowOpensAt +
    STOP_CONFIRMATION_MINUTES * 60_000;

  const canMarkCurrentStop =
    !tripEnded &&
    !loadingStops &&
    Boolean(nextStop) &&
    now >= stopWindowOpensAt &&
    now <= stopWindowClosesAt;

  const stopWindowMessage = useMemo(() => {
    if (!nextStop) return "No more stops to confirm";

    if (!nextStopTime) {
      return "No valid arrival time is available for this stop.";
    }

    if (now < stopWindowOpensAt) {
      return `Confirmation opens at ${formatTime(
        nextStop.arrival_time ||
          nextStop.departure_time
      )}`;
    }

    if (now > stopWindowClosesAt) {
      return "Confirmation window has passed. You can continue your ride.";
    }

    const minutesLeft = Math.max(
      0,
      Math.ceil(
        (stopWindowClosesAt - now) / 60_000
      )
    );

    return `Optional confirmation available for ${minutesLeft} more minute${
      minutesLeft === 1 ? "" : "s"
    }`;
  }, [
    nextStop,
    nextStopTime,
    now,
    stopWindowOpensAt,
    stopWindowClosesAt,
  ]);

  const reachedLastStop =
    scheduleStops.length > 0 &&
    activeStopIndex === scheduleStops.length - 1;

  const progress =
    scheduleStops.length > 1
      ? Math.round(
          (activeStopIndex /
            (scheduleStops.length - 1)) *
            100
        )
      : 0;

  useEffect(() => {
    const interval = window.setInterval(
      () => setNow(Date.now()),
      15_000
    );

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const endedIds = getEndedRideIds();

    if (endedIds.includes(rideLockId)) {
      setTripEnded(true);
      navigate({ to: "/passenger/history" });
    }
  }, [rideLockId, navigate]);

  useEffect(() => {
    let cancelled = false;

    const loadSchedule = async () => {
      setLoadingStops(true);

      let sourceStops = Array.isArray(
        rideDetails.scheduleStops
      )
        ? rideDetails.scheduleStops
        : Array.isArray(rideDetails.routeStops)
          ? rideDetails.routeStops
          : Array.isArray(rideDetails.stops)
            ? rideDetails.stops
            : [];

      if (busId) {
        try {
          const { data, error } = await supabase
            .from("bus_schedule")
            .select(
              "id,bus_id,stop_order,station_name,arrival_time,departure_time,latitude,longitude"
            )
            .eq("bus_id", busId)
            .order("stop_order", {
              ascending: true,
            });

          if (
            !error &&
            Array.isArray(data) &&
            data.length
          ) {
            sourceStops = data;
          } else if (error) {
            const fallback = await supabase
              .from("bus_schedule")
              .select(
                "id,bus_id,stop_order,station_name,arrival_time,departure_time"
              )
              .eq("bus_id", busId)
              .order("stop_order", {
                ascending: true,
              });

            if (
              !fallback.error &&
              Array.isArray(fallback.data) &&
              fallback.data.length
            ) {
              sourceStops = fallback.data;
            }
          }
        } catch (error) {
          console.warn(
            "Unable to load bus schedule:",
            error
          );
        }
      }

      const names = sourceStops
        .map((stop) => ({
          ...(typeof stop === "object" && stop
            ? stop
            : {}),
          station_name: getName(stop),
        }))
        .filter((stop) => stop.station_name);

      const pickupIndex = names.findIndex(
        (stop) =>
          normalize(stop.station_name) ===
          normalize(pickup)
      );

      const dropIndex = names.findIndex(
        (stop, index) =>
          index > Math.max(pickupIndex, -1) &&
          normalize(stop.station_name) ===
            normalize(drop)
      );

      let route = [];

      if (
        pickupIndex >= 0 &&
        dropIndex > pickupIndex
      ) {
        route = names.slice(
          pickupIndex,
          dropIndex + 1
        );
      } else if (
        pickupIndex >= 0 &&
        normalize(pickup) === normalize(drop)
      ) {
        route = [names[pickupIndex]];
      } else {
        // Never invent intermediate stops.
        route = [
          {
            station_name: pickup,
            _endpoint: "pickup",
          },
        ];

        if (normalize(pickup) !== normalize(drop)) {
          route.push({
            station_name: drop,
            _endpoint: "drop",
          });
        }
      }

      if (!cancelled) {
        setScheduleStops(route);
        setActiveStopIndex(0);
        setLoadingStops(false);
      }
    };

    loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [
    busId,
    pickup,
    drop,
    rideDetails.scheduleStops,
    rideDetails.routeStops,
    rideDetails.stops,
  ]);

  const getDropCoordinates = useCallback(() => {
    const fromRide = parseCoordinates({
      latitude:
        rideDetails.dropLatitude ??
        rideDetails.dropLat ??
        rideDetails.destinationLatitude,
      longitude:
        rideDetails.dropLongitude ??
        rideDetails.dropLng ??
        rideDetails.destinationLongitude,
    });

    if (fromRide) return fromRide;

    return parseCoordinates(dropStop);
  }, [rideDetails, dropStop]);

  const fetchGps = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "This browser does not support GPS location."
          )
        );
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
        },
        (error) => {
          const message =
            error.code === 1
              ? "Please allow location permission to verify the drop location."
              : error.code === 2
                ? "Your current location is unavailable. Try again outdoors."
                : "GPS timed out. Please try again.";

          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 15_000,
          maximumAge: 0,
        }
      );
    });
  }, []);

  const saveCompletedRide = useCallback(
    async ({
      eligibleForCoins,
      distanceMeters,
      reason,
    }) => {
      if (tripEnded || savingTrip) return false;

      setSavingTrip(true);

      const nowDate = new Date();
      const savedRideId =
        rideDetails.rideId || `RIDE-${Date.now()}`;

      const ride = {
        id: savedRideId,
        rideLockId,
        from: pickup,
        to: drop,
        startLocation: pickup,
        endLocation: drop,
        pickupPoint: pickup,
        dropPoint: drop,
        busName,
        busId,
        serviceType: busType,
        fare:
          rideDetails.fare ||
          rideDetails.ticketPrice ||
          "--",
        date: nowDate.toLocaleDateString("en-IN"),
        time: nowDate.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        departureTime:
          rideDetails.busStartTime ||
          rideDetails.departure_time ||
          null,
        stops: scheduleStops.map(
          (stop) => stop.station_name
        ),
        status: eligibleForCoins
          ? "Completed"
          : "Ended early",
        completed: true,
        rewardEligible: eligibleForCoins,
        coinsEarned: eligibleForCoins
          ? DEMO_RIDE_REWARD_COINS
          : 0,
        rewardReason: reason,
        dropDistanceMeters:
          Number.isFinite(distanceMeters)
            ? Math.round(distanceMeters)
            : null,
        rating: null,
        feedbackReasons: [],
        completedAt: nowDate.toISOString(),
      };

      try {
        const key = "bussinn_completed_rides";
        const previous = JSON.parse(
          localStorage.getItem(key) || "[]"
        );
        const rides = Array.isArray(previous)
          ? previous
          : [];

        if (
          !rides.some(
            (item) => item.rideLockId === rideLockId
          )
        ) {
          localStorage.setItem(
            key,
            JSON.stringify([ride, ...rides])
          );
        }

        localStorage.setItem(
          "last_completed_ride",
          JSON.stringify(ride)
        );

        const endedIds = getEndedRideIds();

        if (!endedIds.includes(rideLockId)) {
          localStorage.setItem(
            "bussinn_ended_ride_ids",
            JSON.stringify([
              ...endedIds,
              rideLockId,
            ])
          );
        }

        localStorage.removeItem("active_ride_details");

        setTripEnded(true);
        setRewardResult({
          eligible: eligibleForCoins,
          coins: eligibleForCoins
            ? DEMO_RIDE_REWARD_COINS
            : 0,
          reason,
        });

        window.dispatchEvent(
          new Event("bussinn-ride-history-updated")
        );

        return true;
      } catch (error) {
        console.error(
          "Could not save completed ride:",
          error
        );
        setGpsMessage(
          "Could not save this ride. Please try again."
        );
        return false;
      } finally {
        setSavingTrip(false);
      }
    },
    [
      tripEnded,
      savingTrip,
      rideDetails,
      rideLockId,
      pickup,
      drop,
      busName,
      busId,
      busType,
      scheduleStops,
    ]
  );

  const markNextStopReached = () => {
    if (
      !canMarkCurrentStop ||
      !nextStop ||
      tripEnded
    ) {
      return;
    }

    setActiveStopIndex((index) =>
      Math.min(index + 1, scheduleStops.length - 1)
    );
  };

  const endRide = async () => {
    if (tripEnded || savingTrip) return;

    setGpsMessage("");
    setGpsLoading(true);

    try {
      const gps = await fetchGps();
      setCurrentLocation(gps);

      const target = getDropCoordinates();

      if (!target) {
        const saved = await saveCompletedRide({
          eligibleForCoins: false,
          distanceMeters: null,
          reason:
            "Drop coordinates are not configured; ride saved without coin reward.",
        });

        if (saved) {
          setGpsMessage(
            "Ride saved, but coins were not awarded because the drop coordinates are missing."
          );
          setShowEarlyEndModal(false);
          setShowRatingModal(true);
        }

        return;
      }

      const distance = distanceInMeters(gps, target);

      const timeReached =
        dropScheduledTime &&
        Date.now() >= dropScheduledTime.getTime();

      const withinRadius =
        distance <= DROP_RADIUS_METERS;

      const eligibleForCoins = Boolean(
        timeReached && withinRadius
      );

      const reason = eligibleForCoins
        ? "Scheduled drop time reached and GPS is within 20 km."
        : !timeReached
          ? "Ride ended before the scheduled drop time."
          : "GPS location is outside the 20 km drop radius.";

      const saved = await saveCompletedRide({
        eligibleForCoins,
        distanceMeters: distance,
        reason,
      });

      if (saved) {
        setShowEarlyEndModal(false);
        setShowRatingModal(true);
      }
    } catch (error) {
      setGpsMessage(
        error.message ||
          "Could not verify your location."
      );
    } finally {
      setGpsLoading(false);
    }
  };

  const endWithoutCoins = async () => {
    const saved = await saveCompletedRide({
      eligibleForCoins: false,
      distanceMeters: null,
      reason:
        "Passenger ended the ride without successful GPS verification.",
    });

    if (saved) {
      setShowEarlyEndModal(false);
      setShowRatingModal(true);
    }
  };

  const finishRating = (skip = false) => {
    try {
      const key = "bussinn_completed_rides";
      const rides = JSON.parse(
        localStorage.getItem(key) || "[]"
      );

      const savedRide = rides.find(
        (ride) => ride.rideLockId === rideLockId
      );

      if (savedRide && !skip) {
        const updated = rides.map((ride) =>
          ride.rideLockId === rideLockId
            ? {
                ...ride,
                rating,
                feedbackReasons:
                  rating < 5 ? selectedReasons : [],
              }
            : ride
        );

        localStorage.setItem(
          key,
          JSON.stringify(updated)
        );

        window.dispatchEvent(
          new Event("bussinn-ride-history-updated")
        );
      }
    } catch (error) {
      console.error("Could not save rating:", error);
    }

    setShowRatingModal(false);
    navigate({ to: "/passenger/history" });
  };

  const toggleReason = (reason) => {
    setSelectedReasons((current) =>
      current.includes(reason)
        ? current.filter((item) => item !== reason)
        : [...current, reason]
    );
  };

  const callEmergency = () => {
    window.location.href = "tel:112";
  };

  if (tripEnded && !showRatingModal) {
    return (
      <div className="live-track-page">
        <main className="live-ended-card">
          <Check size={34} />
          <h1>Ride has ended</h1>
          <p>
            This ride is saved in your history and can no
            longer be tracked.
          </p>

          {rewardResult?.eligible && (
            <strong>
              Eligible reward: {rewardResult.coins} demo
              coins
            </strong>
          )}

          <button
            type="button"
            className="live-primary-button"
            onClick={() =>
              navigate({ to: "/passenger/history" })
            }
          >
            View ride history
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="live-track-page">
      <header className="track-header live-track-header">
        <button
          type="button"
          className="track-back-button"
          onClick={() =>
            navigate({ to: "/passenger/results" })
          }
          aria-label="Go back"
        >
          <ArrowLeft size={21} />
        </button>

        <div className="track-header-title">
          Live bus tracking
        </div>

        <span className="live-status-pill">
          <span />
          Ride active
        </span>
      </header>

      <main className="live-track-content">
        <section
          className="live-map-placeholder"
          aria-label="Map placeholder"
        >
          <div className="live-map-grid" />
          <div className="live-map-road live-map-road-a" />
          <div className="live-map-road live-map-road-b" />
          <div className="live-map-route" />

          {scheduleStops.map((stop, index) => (
            <div
              key={`${stop.id || stop.station_name}-${index}`}
              className={`live-map-stop ${
                index <= activeStopIndex
                  ? "is-reached"
                  : ""
              }`}
              style={{
                left: `${
                  10 +
                  index *
                    (80 /
                      Math.max(
                        scheduleStops.length - 1,
                        1
                      ))
                }%`,
              }}
              title={stop.station_name}
            />
          ))}

          <div className="live-map-placeholder-label">
            <Navigation size={14} />
            Map integration coming soon
          </div>

          <div className="live-map-bus-marker">
            <img src={busImage} alt="Bus" />
          </div>
        </section>

        <section className="live-track-sheet">
          <div className="live-bus-summary">
            <div className="live-bus-image-wrap">
              <img src={busImage} alt="Bus type" />
            </div>

            <div className="live-bus-summary-text">
              <h1>{busName}</h1>
              <p>{busType} bus · Your journey</p>
            </div>
          </div>

          <section className="live-route-card">
            <div className="live-section-heading">
              <div>
                <span className="track-label">
                  CURRENT STOP
                </span>
                <h2>
                  {activeStop?.station_name || pickup}
                </h2>
              </div>

              <span
                className={`live-stop-badge ${
                  reachedLastStop ? "done" : ""
                }`}
              >
                {reachedLastStop
                  ? "Final stop"
                  : "Ride active"}
              </span>
            </div>

            <div className="live-current-meta">
              <Clock3 size={15} />
              Next stop:{" "}
              {nextStop?.station_name ||
                "Journey complete"}
            </div>

            <div className="live-progress-track">
              <div style={{ width: `${progress}%` }} />
            </div>

            <div className="live-progress-caption">
              <span>
                {scheduleStops.length
                  ? activeStopIndex + 1
                  : 0}{" "}
                of {scheduleStops.length} stops confirmed
              </span>
              <strong>{progress}%</strong>
            </div>
          </section>

          <section className="live-route-card">
            <div className="track-section-title">
              <RouteIcon size={19} />
              <h2>Your route</h2>
            </div>

            {loadingStops ? (
              <p className="live-muted">
                Loading bus schedule…
              </p>
            ) : (
              <div className="track-timeline live-timeline">
                {scheduleStops.map((stop, index) => {
                  const passed = index < activeStopIndex;
                  const current =
                    index === activeStopIndex;
                  const last =
                    index === scheduleStops.length - 1;

                  return (
                    <div
                      className={`track-stop ${
                        passed
                          ? "passed"
                          : current
                            ? "current"
                            : ""
                      }`}
                      key={
                        stop.id ||
                        `${stop.station_name}-${index}`
                      }
                    >
                      {!last && (
                        <div className="track-stop-line" />
                      )}

                      <div className="track-stop-dot">
                        {passed ? (
                          <Check size={10} />
                        ) : current ? (
                          <span />
                        ) : null}
                      </div>

                      <div className="track-stop-content">
                        <div className="track-stop-main">
                          <h4>{stop.station_name}</h4>

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
                          {index === 0
                            ? "Pickup point"
                            : last
                              ? "Drop point"
                              : passed
                                ? "Confirmed"
                                : current
                                  ? "Current stop"
                                  : "Upcoming"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {!loadingStops && nextStop && (
            <section className="live-confirm-stop-card">
              <div className="live-confirm-stop-heading">
                <Clock3 size={18} />
                <div>
                  <strong>
                    Optional stop confirmation
                  </strong>
                  <p>{stopWindowMessage}</p>
                </div>
              </div>

              {canMarkCurrentStop && (
                <button
                  type="button"
                  className="live-primary-button"
                  onClick={markNextStopReached}
                >
                  <Check size={17} />
                  Mark {nextStop.station_name} as reached
                </button>
              )}
            </section>
          )}

          <section className="live-route-card">
            <div className="track-section-title">
              <Ticket size={19} />
              <h2>Ride details</h2>
            </div>

            <div className="track-info-grid">
              <div className="track-info-item">
                <span>Pickup</span>
                <strong>{pickup}</strong>
              </div>

              <div className="track-info-item">
                <span>Drop</span>
                <strong>{drop}</strong>
              </div>

              <div className="track-info-item">
                <span>Bus type</span>
                <strong>{busType}</strong>
              </div>

              <div className="track-info-item">
                <span>Fare</span>
                <strong>
                  {rideDetails.fare ||
                    rideDetails.ticketPrice ||
                    "--"}
                </strong>
              </div>

              <div className="track-info-item">
                <span>Departure</span>
                <strong>
                  {formatTime(
                    rideDetails.busStartTime ||
                      rideDetails.departure_time
                  )}
                </strong>
              </div>

              <div className="track-info-item">
                <span>Bus / Trip ID</span>
                <strong>
                  {busId || rideDetails.rideId || "--"}
                </strong>
              </div>
            </div>
          </section>

          <section className="live-action-grid">
            <button
              type="button"
              className="live-action-card live-sos-card"
              onClick={callEmergency}
            >
              <span className="live-action-icon">
                <ShieldAlert size={20} />
              </span>
              <span>
                <strong>Emergency SOS</strong>
                <small>Call emergency number 112</small>
              </span>
              <PhoneCall size={17} />
            </button>

            <div className="live-action-card">
              <span className="live-action-icon">
                <MapPin size={20} />
              </span>
              <span>
                <strong>Drop verification</strong>
                <small>
                  {currentLocation
                    ? `GPS accuracy ±${Math.round(
                        currentLocation.accuracy
                      )} m`
                    : "Checked when you end the ride"}
                </small>
              </span>
            </div>
          </section>

          {gpsMessage && (
            <p className="live-gps-message" role="status">
              {gpsMessage}
            </p>
          )}

          <div className="live-trip-buttons">
            <button
              type="button"
              className="live-primary-button"
              onClick={() =>
                setShowEarlyEndModal(true)
              }
              disabled={
                savingTrip || gpsLoading || tripEnded
              }
            >
              <Ticket size={17} />
              End ride
            </button>
          </div>

          <p className="live-reward-disclaimer">
            Coin eligibility depends on scheduled time and
            GPS distance. Stop confirmation is optional and
            does not itself award coins.
          </p>
        </section>
      </main>

      <PassengerBottomNav />

      {showEarlyEndModal && (
        <div className="live-modal-backdrop">
          <section
            className="live-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-ride-title"
          >
            <div className="live-modal-symbol warning">
              <ShieldAlert size={25} />
            </div>

            <h2 id="end-ride-title">End this ride?</h2>

            <p>
              We'll save this ride in your history. Coins
              are only eligible if the scheduled drop time
              has arrived and GPS places you within 20 km
              of the drop.
            </p>

            {gpsMessage && (
              <p className="live-gps-message">
                {gpsMessage}
              </p>
            )}

            <div className="live-modal-actions">
              <button
                type="button"
                className="live-secondary-button"
                onClick={() => {
                  setShowEarlyEndModal(false);
                  setGpsMessage("");
                }}
                disabled={gpsLoading || savingTrip}
              >
                Keep riding
              </button>

              <button
                type="button"
                className="live-danger-button"
                onClick={endRide}
                disabled={gpsLoading || savingTrip}
              >
                {gpsLoading
                  ? "Checking GPS…"
                  : savingTrip
                    ? "Saving ride…"
                    : "End ride"}
              </button>
            </div>

            <button
              type="button"
              className="live-end-without-gps"
              onClick={endWithoutCoins}
              disabled={savingTrip}
            >
              End without GPS verification (no coins)
            </button>
          </section>
        </div>
      )}

      {showRatingModal && (
        <div className="live-modal-backdrop">
          <section
            className="live-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rate-ride-title"
          >
            <div className="live-modal-symbol">
              <Star size={25} />
            </div>

            <h2 id="rate-ride-title">Rate your ride</h2>

            <p>
              How was your journey from {pickup} to {drop}?
            </p>

            <div className="live-rating-bus">
              <img src={busImage} alt="Bus" />
              <div>
                <strong>{busName}</strong>
                <small>{busType} service</small>
              </div>
            </div>

            <div className="live-star-picker">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={
                    value <= rating ? "selected" : ""
                  }
                  onClick={() => setRating(value)}
                  aria-label={`${value} star${
                    value === 1 ? "" : "s"
                  }`}
                >
                  <Star
                    size={28}
                    fill={
                      value <= rating
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
              ))}
            </div>

            <p className="live-rating-caption">
              {rating === 5
                ? "Excellent!"
                : rating === 4
                  ? "Good"
                  : rating === 3
                    ? "Average"
                    : rating === 2
                      ? "Below average"
                      : "Poor"}
            </p>

            {rating < 5 && (
              <div className="live-reasons">
                <p>What could be improved?</p>

                {REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={
                      selectedReasons.includes(reason)
                        ? "checked"
                        : ""
                    }
                  >
                    <input
                      type="checkbox"
                      checked={selectedReasons.includes(
                        reason
                      )}
                      onChange={() =>
                        toggleReason(reason)
                      }
                    />
                    {reason}
                  </label>
                ))}
              </div>
            )}

            <div className="rating-actions">
              <button
                type="button"
                className="live-primary-button"
                onClick={() => finishRating(false)}
              >
                Submit rating
              </button>

              <button
                type="button"
                className="live-end-without-gps"
                onClick={() => finishRating(true)}
              >
                Skip for now
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}