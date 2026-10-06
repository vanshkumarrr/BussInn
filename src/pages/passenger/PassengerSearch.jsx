import { useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowUpDown,
  BusFront,
  CalendarDays,
  ChevronRight,
  MapPin,
  Navigation,
  Search
} from "lucide-react";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import locations from "../../data/locations.json";
import "../../styles/PassengerSearch.css";

const formatDisplayDate = (date) =>
  date.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });

const formatInputDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const getSuggestions = (query) => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return [];

  return locations
    .filter((location) => {
      const name = location.name.toLowerCase();
      const district = location.district.toLowerCase();
      const state = location.state.toLowerCase();

      return (
        name.startsWith(normalizedQuery) ||
        district.startsWith(normalizedQuery) ||
        state.startsWith(normalizedQuery)
      );
    })
    .slice(0, 8);
};

const findExactLocation = (value) => {
  const normalizedValue = value.trim().toLowerCase();

  return locations.find(
    (location) => location.name.toLowerCase() === normalizedValue
  );
};

const PassengerSearch = () => {
  const navigate = useNavigate();
  const dateInputRef = useRef(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({
    from: "",
    to: ""
  });
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fromSuggestions =
    activeField === "from" ? getSuggestions(from) : [];

  const toSuggestions =
    activeField === "to" ? getSuggestions(to) : [];

  const updateLocation = (field, value) => {
    if (field === "from") {
      setFrom(value);
    } else {
      setTo(value);
    }

    setFieldErrors((current) => ({
      ...current,
      [field]: ""
    }));
  };

  const validateLocation = (field, value) => {
    if (!value.trim()) {
      setFieldErrors((current) => ({
        ...current,
        [field]: "Please select a location."
      }));
      return false;
    }

    if (!findExactLocation(value)) {
      setFieldErrors((current) => ({
        ...current,
        [field]: "No such place found. Select a place from the list."
      }));
      return false;
    }

    setFieldErrors((current) => ({
      ...current,
      [field]: ""
    }));

    return true;
  };

  const handleSelectLocation = (field, location) => {
    updateLocation(field, location.name);
    setActiveField(null);
  };

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setActiveField(null);
    setFieldErrors({
      from: "",
      to: ""
    });
  };

  const openDatePicker = () => {
    if (!dateInputRef.current) return;

    if (typeof dateInputRef.current.showPicker === "function") {
      dateInputRef.current.showPicker();
      return;
    }

    dateInputRef.current.focus();
    dateInputRef.current.click();
  };

  const handleDateInputChange = (event) => {
    if (!event.target.value) return;

    const [year, month, day] = event.target.value.split("-").map(Number);
    setSelectedDate(new Date(year, month - 1, day));
  };

  const handleSetToday = () => {
    setSelectedDate(new Date());
  };

  const handleSetTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
  };

  const handleSearch = (event) => {
    event.preventDefault();

    const isFromValid = validateLocation("from", from);
    const isToValid = validateLocation("to", to);

    if (!isFromValid || !isToValid) return;

    navigate({
      to: "/passenger/results",
      search: {
        from: from.trim(),
        to: to.trim(),
        date: formatInputDate(selectedDate)
      }
    });
  };

  const renderSuggestions = (field, suggestions, value) => {
    if (activeField !== field || !value.trim()) return null;

    if (!suggestions.length) {
      return (
        <div className="location-suggestions empty-location-suggestions">
          <MapPin aria-hidden="true" />
          <div>
            <strong>No matching place found</strong>
            <small>Add the place to locations.json before searching it.</small>
          </div>
        </div>
      );
    }

    return (
      <ul className="location-suggestions">
        {suggestions.map((location) => (
          <li key={`${location.name}-${location.district}`}>
            <button
              type="button"
              onMouseDown={() => handleSelectLocation(field, location)}
            >
              {field === "from" ? (
                <MapPin aria-hidden="true" />
              ) : (
                <Navigation aria-hidden="true" />
              )}

              <span>
                <strong>{location.name}</strong>
                <small>
                  {location.district}, {location.state}
                </small>
              </span>

              <em>{location.type}</em>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <main className="passenger-choice-page">
      <section className="passenger-search-app">
        <header className="passenger-search-header">
          <div className="passenger-header-top">
            <div className="passenger-logo" aria-label="BussInn">
              <BusFront className="passenger-logo-icon" aria-hidden="true" />
              <span>BussInn</span>
            </div>

            <div className="passenger-header-copy">
              <span>PLAN YOUR JOURNEY</span>
              <h1>Find your ride</h1>
              <p>Search local buses</p>
            </div>
          </div>
        </header>

        <main className="passenger-main-content-search">
          <form className="passenger-search-card" onSubmit={handleSearch}>
            <div className="route-fields">
              <div className="location-field">
                <div className="location-icon from-icon">
                  <MapPin aria-hidden="true" />
                </div>

                <div className="location-input-wrap">
                  <label htmlFor="from">From</label>
                  <input
                    id="from"
                    type="text"
                    value={from}
                    onChange={(event) =>
                      updateLocation("from", event.target.value)
                    }
                    onFocus={() => setActiveField("from")}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setActiveField(null);
                        if (from.trim()) validateLocation("from", from);
                      }, 150);
                    }}
                    placeholder="Leaving from"
                    autoComplete="off"
                    required
                  />

                  {renderSuggestions("from", fromSuggestions, from)}

                  {fieldErrors.from && (
                    <p className="location-error">{fieldErrors.from}</p>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSwap}
                className="swap-locations-button"
                title="Swap locations"
                aria-label="Swap from and to locations"
              >
                <ArrowUpDown aria-hidden="true" />
              </button>

              <div className="location-field">
                <div className="location-icon to-icon">
                  <Navigation aria-hidden="true" />
                </div>

                <div className="location-input-wrap">
                  <label htmlFor="to">To</label>
                  <input
                    id="to"
                    type="text"
                    value={to}
                    onChange={(event) =>
                      updateLocation("to", event.target.value)
                    }
                    onFocus={() => setActiveField("to")}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setActiveField(null);
                        if (to.trim()) validateLocation("to", to);
                      }, 150);
                    }}
                    placeholder="Going to"
                    autoComplete="off"
                    required
                  />

                  {renderSuggestions("to", toSuggestions, to)}

                  {fieldErrors.to && (
                    <p className="location-error">{fieldErrors.to}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="date-section">
              <button
                type="button"
                className="date-main-button"
                onClick={openDatePicker}
              >
                <CalendarDays aria-hidden="true" />
                <span>
                  <small>Travel date</small>
                  <strong>{formatDisplayDate(selectedDate)}</strong>
                </span>
              </button>

              <div className="quick-date-actions">
                <button type="button" onClick={handleSetToday}>
                  Today
                </button>
                <button type="button" onClick={handleSetTomorrow}>
                  Tomorrow
                </button>
              </div>

              <input
                ref={dateInputRef}
                type="date"
                className="hidden-date-input"
                value={formatInputDate(selectedDate)}
                min={formatInputDate(new Date())}
                onChange={handleDateInputChange}
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>

            <button type="submit" className="passenger-search-button">
              <Search aria-hidden="true" />
              <span>Search buses</span>
            </button>
          </form>

          <Link to="/passenger/ride/$rideId" className="inside-bus-card">
            <div className="inside-bus-icon">
              <BusFront aria-hidden="true" />
            </div>

            <div>
              <h2>Already inside a bus?</h2>
              <p>Share your journey and help other passengers.</p>
            </div>

            <ChevronRight className="inside-bus-arrow" aria-hidden="true" />
          </Link>
        </main>

        <PassengerBottomNav />
      </section>
    </main>
  );
};

export default PassengerSearch;