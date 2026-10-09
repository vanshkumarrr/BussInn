
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  MapPin,
  Navigation,
  Clock3,
  BusFront,
  Search,
  LoaderCircle,
} from "lucide-react";

import { supabase } from "../../lib/supabase";
import locations from "../../data/locations.json";
import "../../styles/RideDetails.css";

const TIME_TOLERANCE_MINUTES = 20;
const MAX_BOARDING_DISTANCE_KM = 20;

const normalize = (value = "") =>
  String(value).trim().toLowerCase().replace(/\s+/g, " ");

const getSuggestions = (query) => {
  const q = normalize(query);
  if (!q) return [];

  return locations
    .filter((location) =>
      [location.name, location.district, location.state].some(
        (value) => normalize(value).startsWith(q)
      )
    )
    .slice(0, 8);
};

const timeToMinutes = (time) => {
  if (!time) return null;

  const parts = String(time).split(":").map(Number);
  if (parts.length < 2 || parts.some(Number.isNaN)) return null;

  return parts[0] * 60 + parts[1];
};

const timeDifference = (first, second) => {
  const a = timeToMinutes(first);
  const b = timeToMinutes(second);

  if (a === null || b === null) return Infinity;

  const difference = Math.abs(a - b);

  // Account for schedules crossing midnight.
  return Math.min(difference, 1440 - difference);
};

const getStopTime = (stop, type) => {
  if (!stop) return null;

  if (type === "boarding") {
    return stop.departure_time || stop.arrival_time || null;
  }

  return stop.arrival_time || stop.departure_time || null;
};

const getSortedStops = (bus) =>
  [...(bus.bus_schedule || [])].sort(
    (a, b) => Number(a.stop_order) - Number(b.stop_order)
  );

const getFinalStop = (bus) => {
  const stops = getSortedStops(bus);

  return stops.length
    ? stops[stops.length - 1].station_name
    : bus.destination || "";
};

const getBusSuggestions = (buses, query) => {
  const q = normalize(query);
  if (!q) return [];

  const unique = new Map();

  buses.forEach((bus) => {
    const destination = getFinalStop(bus);

    if (destination && normalize(destination).startsWith(q)) {
      unique.set(normalize(destination), destination);
    }
  });

  return [...unique.values()].slice(0, 8);
};

const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your browser does not support location verification."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });

const geocodePlace = async (place) => {
  const params = new URLSearchParams({
    q: `${place}, India`,
    format: "jsonv2",
    limit: "1",
    countrycodes: "in",
  });

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?${params}`,
    { headers: { "Accept-Language": "en" } }
  );

  if (!response.ok) {
    throw new Error("Could not verify the selected location.");
  }

  const results = await response.json();

  if (!results.length) {
    throw new Error(
      `Could not verify "${place}". Please select another location.`
    );
  }

  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
  };
};

const distanceInKm = (a, b) => {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = radians(b.latitude - a.latitude);
  const dLon = radians(b.longitude - a.longitude);

  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);

  const haversine =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return (
    earthRadiusKm *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
};

const verifyBoardingLocation = async (startLocation) => {
  let position;

  try {
    position = await getCurrentPosition();
  } catch {
    throw new Error(
      "Location permission is required to verify your boarding point. Enable location access and try again."
    );
  }

  const current = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };

  const selected = await geocodePlace(startLocation);
  const distance = distanceInKm(current, selected);

  if (distance > MAX_BOARDING_DISTANCE_KM) {
    throw new Error(
      `Your current location does not match "${startLocation}". Please check your boarding point and try again.`
    );
  }
};

const matchBuses = (buses, formData) => {
  const requestedStart = normalize(formData.startLocation);
  const requestedDrop = normalize(formData.endLocation);
  const requestedFinal = normalize(formData.busDestination);

  return buses
    .map((bus) => {
      const stops = getSortedStops(bus);

      if (stops.length < 2) return null;

      const boardingIndex = stops.findIndex(
        (stop) => normalize(stop.station_name) === requestedStart
      );

      const dropIndex = stops.findIndex(
        (stop) => normalize(stop.station_name) === requestedDrop
      );

      const finalStop = stops[stops.length - 1];

      // Both passenger stops must be on the same route and in order.
      if (
        boardingIndex < 0 ||
        dropIndex < 0 ||
        boardingIndex >= dropIndex
      ) {
        return null;
      }

      // Destination must be the actual last scheduled stop.
      if (normalize(finalStop.station_name) !== requestedFinal) {
        return null;
      }

      const scheduledBoardingTime = getStopTime(
        stops[boardingIndex],
        "boarding"
      );

      const scheduledDropTime = getStopTime(
        stops[dropIndex],
        "drop"
      );

      const boardingDifference = timeDifference(
        formData.busStartTime,
        scheduledBoardingTime
      );

      const dropDifference = timeDifference(
        formData.busEndTime,
        scheduledDropTime
      );

      if (
        boardingDifference > TIME_TOLERANCE_MINUTES ||
        dropDifference > TIME_TOLERANCE_MINUTES
      ) {
        return null;
      }

      return {
        ...bus,
        matchedBoardingTime: scheduledBoardingTime,
        matchedDropTime: scheduledDropTime,
        boardingDifference,
        dropDifference,
        matchScore: boardingDifference + dropDifference,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.matchScore - b.matchScore);
};

const RideDetails = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    busStartTime: "15:00",
    busEndTime: "16:00",
    startLocation: "",
    endLocation: "",
    busDestination: "",
  });

  const [buses, setBuses] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [error, setError] = useState("");
  const [loadingBuses, setLoadingBuses] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedBusId, setSelectedBusId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const loadBuses = async () => {
      setLoadingBuses(true);

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

      if (cancelled) return;

      if (fetchError) {
        console.error("Could not load bus schedules:", fetchError);
        setError("Unable to load bus schedules. Please try again.");
        setBuses([]);
      } else {
        setBuses(
          (data || []).map((bus) => ({
            ...bus,
            bus_schedule: getSortedStops(bus),
          }))
        );
      }

      setLoadingBuses(false);
    };

    loadBuses();

    return () => {
      cancelled = true;
    };
  }, []);

  const startSuggestions =
    activeField === "startLocation"
      ? getSuggestions(formData.startLocation)
      : [];

  const dropSuggestions =
    activeField === "endLocation"
      ? getSuggestions(formData.endLocation)
      : [];

  const destinationSuggestions = useMemo(
    () =>
      activeField === "busDestination"
        ? getBusSuggestions(buses, formData.busDestination)
        : [],
    [activeField, buses, formData.busDestination]
  );

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setCandidates([]);
    setSelectedBusId(null);
  };

  const selectLocation = (field, location) => {
    setFormData((previous) => ({
      ...previous,
      [field]: location.name,
    }));

    setActiveField(null);
    setError("");
    setCandidates([]);
    setSelectedBusId(null);
  };

  const selectDestination = (destination) => {
    setFormData((previous) => ({
      ...previous,
      busDestination: destination,
    }));

    setActiveField(null);
    setError("");
    setCandidates([]);
    setSelectedBusId(null);
  };

  const renderLocationSuggestions = (field, suggestions, value) => {
    if (activeField !== field || !value.trim()) return null;

    return (
      <ul className="ride-location-suggestions">
        {suggestions.length ? (
          suggestions.map((location) => (
            <li key={`${location.name}-${location.district}`}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectLocation(field, location);
                }}
              >
                <MapPin size={18} />
                <span className="ride-suggestion-copy">
                  <strong>{location.name}</strong>
                  <small>
                    {location.district}, {location.state}
                  </small>
                </span>
                <span className="ride-suggestion-type">
                  {location.type}
                </span>
              </button>
            </li>
          ))
        ) : (
          <li className="ride-no-suggestions">
            <strong>No matching place found</strong>
            <small>Try a different place from the list.</small>
          </li>
        )}
      </ul>
    );
  };

  const renderDestinationSuggestions = () => {
    if (
      activeField !== "busDestination" ||
      !formData.busDestination.trim()
    ) {
      return null;
    }

    return (
      <ul className="ride-location-suggestions">
        {destinationSuggestions.length ? (
          destinationSuggestions.map((destination) => (
            <li key={destination}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectDestination(destination);
                }}
              >
                <BusFront size={18} />
                <span className="ride-suggestion-copy">
                  <strong>{destination}</strong>
                  <small>Final stop of a scheduled bus</small>
                </span>
              </button>
            </li>
          ))
        ) : (
          <li className="ride-no-suggestions">
            <strong>No matching bus destination</strong>
            <small>Choose a final stop from the suggestions.</small>
          </li>
        )}
      </ul>
    );
  };

  const handleFindBus = async (event) => {
    event.preventDefault();
    setError("");
    setCandidates([]);
    setSelectedBusId(null);

    if (loadingBuses) {
      setError("Please wait while bus schedules are loading.");
      return;
    }

    if (!buses.length) {
      setError("No active bus schedules are available right now.");
      return;
    }

    if (
      !formData.busStartTime ||
      !formData.busEndTime ||
      !formData.startLocation.trim() ||
      !formData.endLocation.trim() ||
      !formData.busDestination.trim()
    ) {
      setError("Please complete all fields.");
      return;
    }

    if (
      !locations.some(
        (location) => normalize(location.name) === normalize(formData.startLocation)
      ) ||
      !locations.some(
        (location) => normalize(location.name) === normalize(formData.endLocation)
      )
    ) {
      setError("Please select your boarding and drop points from the suggestions.");
      return;
    }

    if (
      normalize(formData.startLocation) === normalize(formData.endLocation)
    ) {
      setError("Your boarding point and drop point cannot be the same.");
      return;
    }

    if (timeToMinutes(formData.busEndTime) ===
        timeToMinutes(formData.busStartTime)) {
      setError("The boarding and drop times cannot be identical.");
      return;
    }

    if (
      !buses.some(
        (bus) => normalize(getFinalStop(bus)) === normalize(formData.busDestination)
      )
    ) {
      setError("Select the bus's actual final stop from the suggestions.");
      return;
    }

    setIsVerifying(true);

    try {
     // await verifyBoardingLocation(formData.startLocation);

      const matches = matchBuses(buses, formData);

      if (!matches.length) {
        setError(
          "No buses found. Please check your locations, final destination and stop times, then retry."
        );
        return;
      }

      setCandidates(matches);

      // Automatically select only when there is one valid candidate.
      if (matches.length === 1) {
        setSelectedBusId(matches[0].id);
      }
    } catch (verificationError) {
      console.error("Passenger verification:", verificationError);
      setError(
        verificationError.message ||
        "Could not verify your location. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartTracking = () => {
    const selectedBus = candidates.find(
      (bus) => String(bus.id) === String(selectedBusId)
    );

    if (!selectedBus) {
      setError("Select a matching bus before starting tracking.");
      return;
    }

    const rideDetails = {
      ...formData,
      busId: selectedBus.id,
      busName: selectedBus.bus_name || selectedBus.name || "",
      scheduledBoardingTime: selectedBus.matchedBoardingTime,
      scheduledDropTime: selectedBus.matchedDropTime,
      verifiedAt: new Date().toISOString(),
    };

    localStorage.setItem("active_ride_details", JSON.stringify(rideDetails));

    navigate({ to: "/passenger/live-tracking" });
  };

  return (
    <div className="page mobile-page-container">
      <div className="app-content ride-details-layout">
        <header className="dash-header">
          <Link to="/passenger/search" className="back-arrow-btn" title="Back">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="dash-logo">BussInn</h1>
          <span aria-hidden="true" />
        </header>

        <div className="ride-details-header-text">
          <p>Enter your route and schedule so we can identify your bus.</p>
        </div>

        <form className="ride-details-form" onSubmit={handleFindBus}>
          <div className="input-card-field">
            <label className="field-label-mini" htmlFor="busStartTime">
              Time at Boarding Stop
            </label>
            <div className="field-input-row">
              <input
                id="busStartTime"
                type="time"
                value={formData.busStartTime}
                onChange={handleChange("busStartTime")}
                className="transparent-input"
                required
              />
              <Clock3 size={19} color="#9ca3af" />
            </div>
          </div>

          <div className="input-card-field">
            <label className="field-label-mini" htmlFor="busEndTime">
              Time at Drop Stop
            </label>
            <div className="field-input-row">
              <input
                id="busEndTime"
                type="time"
                value={formData.busEndTime}
                onChange={handleChange("busEndTime")}
                className="transparent-input"
                required
              />
              <Clock3 size={19} color="#9ca3af" />
            </div>
          </div>

          <div className="input-card-field ride-location-field">
            <label className="field-label-mini" htmlFor="startLocation">
              Boarding Location
            </label>
            <div className="field-input-row">
              <input
                id="startLocation"
                value={formData.startLocation}
                onChange={handleChange("startLocation")}
                onFocus={() => setActiveField("startLocation")}
                onBlur={() =>
                  window.setTimeout(
                    () => setActiveField((current) =>
                      current === "startLocation" ? null : current
                    ),
                    150
                  )
                }
                placeholder="Search boarding point"
                className="transparent-input"
                autoComplete="off"
                required
              />
              <MapPin size={19} color="#9ca3af" />
            </div>
            {renderLocationSuggestions(
              "startLocation",
              startSuggestions,
              formData.startLocation
            )}
          </div>

          <div className="input-card-field ride-location-field">
            <label className="field-label-mini" htmlFor="endLocation">
              Drop Location
            </label>
            <div className="field-input-row">
              <input
                id="endLocation"
                value={formData.endLocation}
                onChange={handleChange("endLocation")}
                onFocus={() => setActiveField("endLocation")}
                onBlur={() =>
                  window.setTimeout(
                    () => setActiveField((current) =>
                      current === "endLocation" ? null : current
                    ),
                    150
                  )
                }
                placeholder="Search drop point"
                className="transparent-input"
                autoComplete="off"
                required
              />
              <Navigation size={19} color="#9ca3af" />
            </div>
            {renderLocationSuggestions(
              "endLocation",
              dropSuggestions,
              formData.endLocation
            )}
          </div>

          <div className="input-card-field ride-location-field">
            <label className="field-label-mini" htmlFor="busDestination">
              Bus's Final Destination
            </label>
            <div className="field-input-row">
              <input
                id="busDestination"
                value={formData.busDestination}
                onChange={handleChange("busDestination")}
                onFocus={() => setActiveField("busDestination")}
                onBlur={() =>
                  window.setTimeout(
                    () => setActiveField((current) =>
                      current === "busDestination" ? null : current
                    ),
                    150
                  )
                }
                placeholder="Search the bus's last stop"
                className="transparent-input"
                autoComplete="off"
                required
              />
              <BusFront size={19} color="#9ca3af" />
            </div>
            {renderDestinationSuggestions()}
          </div>

          {error && (
            <div
              className="p-3 bg-red-100 border border-red-300 text-red-700 text-xs font-bold rounded-xl text-center"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="ride-details-footer-action">
            <button
              type="submit"
              className="btn-start-tracking"
              disabled={isVerifying || loadingBuses}
            >
              {isVerifying || loadingBuses ? (
                <LoaderCircle size={20} className="animate-spin" />
              ) : (
                <Search size={20} />
              )}
              {loadingBuses
                ? "Loading schedules..."
                : isVerifying
                ? "Verifying details..."
                : "Find My Bus"}
            </button>
          </div>
        </form>

        {candidates.length > 0 && (
          <section className="ride-matched-buses">
            <h2>Matching buses ({candidates.length})</h2>
            <p>Choose the bus whose scheduled times match your journey.</p>

            {candidates.map((bus) => (
              <label className="ride-bus-candidate" key={bus.id}>
                <input
                  type="radio"
                  name="matchedBus"
                  checked={String(selectedBusId) === String(bus.id)}
                  onChange={() => {
                    setSelectedBusId(bus.id);
                    setError("");
                  }}
                />
                <span>
                  <strong>{bus.bus_name || bus.name || `Bus ${bus.id}`}</strong>
                  <small>
                    {formData.startLocation}{" "}
                    {bus.matchedBoardingTime
                      ? `· ${bus.matchedBoardingTime.slice(0, 5)}`
                      : ""}
                  </small>
                  <small>
                    {formData.endLocation}{" "}
                    {bus.matchedDropTime
                      ? `· ${bus.matchedDropTime.slice(0, 5)}`
                      : ""}
                  </small>
                  <small>Final stop: {getFinalStop(bus)}</small>
                </span>
              </label>
            ))}

            <button
              type="button"
              className="btn-start-tracking"
              disabled={!selectedBusId}
              onClick={handleStartTracking}
            >
              <BusFront size={20} />
              Confirm Bus & Start Tracking
            </button>
          </section>
        )}
      </div>
    </div>
  );
};

export default RideDetails;
