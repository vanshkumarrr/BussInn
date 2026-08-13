import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import AdminBottomNav from "../../components/AdminBottomNav";
import { addBus } from "../../lib/store";
import "../../styles/AddBus.css";

const empty = {
  busNumber: "",
  name: "",
  operator: "",
  busType: "",
  registrationNumber: "",
  capacity: "40",
  status: "ACTIVE",
  rating: "4.5",
  confidence: "80",
  departTime: "",
  departStop: "",
  arriveTime: "",
  arriveStop: "",
  price: "",
};

/* Turns two 24h "HH:MM" times into a duration label,
   handling overnight trips. */
const calcDuration = (start, end) => {
  if (!start || !end) return { minutes: 0, label: "--" };

  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);

  if (
    [sh, sm, eh, em].some((n) => Number.isNaN(n))
  ) {
    return { minutes: 0, label: "--" };
  }

  let diff = eh * 60 + em - (sh * 60 + sm);

  if (diff <= 0) {
    diff += 24 * 60;
  }

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;

  const label =
    hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return {
    minutes: diff,
    label,
  };
};

/* Inline icons */
const BusIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4 16c0 .74.4 1.38 1 1.72V19a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.28c.6-.34 1-.98 1-1.72V6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v10Z"
      fill="currentColor"
    />
    <rect
      x="6"
      y="5.5"
      width="12"
      height="5"
      rx="1"
      fill="white"
    />
    <circle
      cx="7.5"
      cy="16.5"
      r="1.25"
      fill="white"
    />
    <circle
      cx="16.5"
      cy="16.5"
      r="1.25"
      fill="white"
    />
  </svg>
);

const BackIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 19l-7-7 7-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 5v14M5 12h14"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="12"
      cy="12"
      r="8.2"
      stroke="currentColor"
      strokeWidth="1.6"
    />
    <path
      d="M12 8v4.3l3 1.9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Admin — add a new bus to the passenger listing.
const AddBus = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const set = (key) => (e) =>
    setForm({
      ...form,
      [key]: e.target.value,
    });

  // Calculate duration automatically from departure and arrival.
  const duration = useMemo(
    () =>
      calcDuration(
        form.departTime,
        form.arriveTime
      ),
    [form.departTime, form.arriveTime]
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (
      !form.name.trim() ||
      !form.departStop.trim() ||
      !form.arriveStop.trim()
    ) {
      setError(
        "Bus name, boarding point and drop point are required."
      );
      return;
    }

    if (
      !form.busNumber.trim() ||
      !form.registrationNumber.trim()
    ) {
      setError(
        "Bus number and registration number are required."
      );
      return;
    }

    if (!form.busType.trim()) {
      setError("Bus type is required.");
      return;
    }

    if (
      !form.capacity ||
      Number(form.capacity) <= 0
    ) {
      setError("Enter a valid bus capacity.");
      return;
    }

    if (!form.departTime || !form.arriveTime) {
      setError(
        "Pick both a departure time and an arrival time."
      );
      return;
    }

    setError("");

    addBus({
      ...form,

      capacity: Number(form.capacity) || 40,
      rating: Number(form.rating) || 0,
      confidence: Number(form.confidence) || 0,
      price: Number(form.price) || 0,

      duration: duration.label,
      eta: duration.label,

      live: form.status === "ACTIVE",
      accent: "#1a56ff",

      stops: [
        {
          name: form.departStop,
          time: form.departTime,
        },
        {
          name: form.arriveStop,
          time: form.arriveTime,
        },
      ],
    });

    // Notify other parts of the app that the bus list changed.
    window.dispatchEvent(
      new Event("bussinn:buses")
    );

    navigate({
      to: "/admin/overview",
    });
  };

  return (
    <div className="addbus-page">
      <div className="addbus-content">

        {/* Top Header */}
        <div className="addbus-topbar-card">
          <div className="addbus-brand-group">
            <BusIcon className="addbus-logo-icon" />

            <div className="addbus-title-group">
              <h2>BussInn</h2>
              <p>Your city, connected.</p>
            </div>
          </div>

          <button
            type="button"
            className="addbus-back-btn"
            onClick={() =>
              navigate({
                to: "/admin/overview",
              })
            }
          >
            <BackIcon />
            Back
          </button>
        </div>

        <h2 className="addbus-section-title">
          Add New Bus
        </h2>

        <p className="addbus-section-subtitle">
          Fill in the trip details below — it'll appear
          in your Fleet Management Directory right away.
        </p>

        {/* Add Bus Form */}
        <form
          onSubmit={handleSubmit}
          className="addbus-form-card"
        >
          <div className="addbus-form-grid">

            {/* Bus Number */}
            <div className="form-group">
              <label>Bus number</label>

              <input
                className="field"
                value={form.busNumber}
                onChange={set("busNumber")}
                placeholder="e.g. BUS-101"
              />
            </div>

            {/* Registration Number */}
            <div className="form-group">
              <label>Registration number</label>

              <input
                className="field"
                value={form.registrationNumber}
                onChange={set(
                  "registrationNumber"
                )}
                placeholder="e.g. UP16AB1234"
              />
            </div>

            {/* Bus Name */}
            <div className="form-group full-width">
              <label>Bus name</label>

              <input
                className="field"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Bus 3"
              />
            </div>

            {/* Operator */}
            <div className="form-group full-width">
              <label>Bus type / operator</label>

              <input
                className="field"
                value={form.operator}
                onChange={set("operator")}
                placeholder="e.g. Volvo Multi-Axle A/C Sleeper"
              />
            </div>

            {/* Bus Type */}
            <div className="form-group">
              <label>Bus type</label>

              <input
                className="field"
                value={form.busType}
                onChange={set("busType")}
                placeholder="e.g. AC Sleeper"
              />
            </div>

            {/* Capacity */}
            <div className="form-group">
              <label>Capacity</label>

              <input
                className="field"
                type="number"
                min="1"
                value={form.capacity}
                onChange={set("capacity")}
                placeholder="40"
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label>Status</label>

              <select
                className="field"
                value={form.status}
                onChange={set("status")}
              >
                <option value="ACTIVE">
                  Active
                </option>

                <option value="INACTIVE">
                  Inactive
                </option>

                <option value="MAINTENANCE">
                  Maintenance
                </option>
              </select>
            </div>

            {/* Departure Time */}
            <div className="form-group">
              <label>Departure time</label>

              <input
                className="field field-time"
                type="time"
                value={form.departTime}
                onChange={set("departTime")}
              />
            </div>

            {/* Arrival Time */}
            <div className="form-group">
              <label>Arrival time</label>

              <input
                className="field field-time"
                type="time"
                value={form.arriveTime}
                onChange={set("arriveTime")}
              />
            </div>

            {/* Boarding Point */}
            <div className="form-group">
              <label>Boarding point</label>

              <input
                className="field"
                value={form.departStop}
                onChange={set("departStop")}
                placeholder="Swargate"
              />
            </div>

            {/* Drop Point */}
            <div className="form-group">
              <label>Drop point</label>

              <input
                className="field"
                value={form.arriveStop}
                onChange={set("arriveStop")}
                placeholder="Andheri East"
              />
            </div>

            {/* Auto-calculated Duration */}
            <div className="form-group full-width">
              <div className="duration-display">
                <ClockIcon className="duration-icon" />

                <div className="duration-text">
                  <span className="duration-label">
                    Trip duration &amp; ETA
                    (auto-calculated)
                  </span>

                  <strong className="duration-value">
                    {duration.label}
                  </strong>
                </div>
              </div>
            </div>

            {/* Fare */}
            <div className="form-group full-width">
              <label>Fare (₹)</label>

              <input
                className="field"
                value={form.price}
                onChange={set("price")}
                placeholder="559"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Error */}
          {error ? (
            <p className="field-error">
              {error}
            </p>
          ) : null}

          {/* Actions */}
          <div className="addbus-actions-row">

            <button
              type="submit"
              className="btn-submit-addbus"
            >
              <PlusIcon />
              Add Bus to Listing
            </button>

            <button
              type="button"
              className="btn-cancel-addbus"
              onClick={() =>
                navigate({
                  to: "/admin/overview",
                })
              }
            >
              Cancel
            </button>

          </div>
        </form>
      </div>

      <AdminBottomNav />
    </div>
  );
};

export default AddBus;