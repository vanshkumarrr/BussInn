import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import AdminBottomNav from "../../components/AdminBottomNav";
import { addBus } from "../../lib/store";
import "../../styles/AddBus.css";

const empty = {
  name: "",
  operator: "",
  rating: "4.5",
  confidence: "80",
  departTime: "",
  departStop: "",
  arriveTime: "",
  arriveStop: "",
  price: "",
};

/* Turns two 24h "HH:MM" times into a duration label, handling
   overnight trips (arrival time earlier than departure = next day). */
const calcDuration = (start, end) => {
  if (!start || !end) return { minutes: 0, label: "--" };
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return { minutes: 0, label: "--" };

  let diff = eh * 60 + em - (sh * 60 + sm);
  if (diff <= 0) diff += 24 * 60; // trip rolls past midnight

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  const label = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  return { minutes: diff, label };
};

/* Inline icons — kept local to this file so AddBus has zero image
   requests and matches the BussInn glyph used on the overview page. */
const BusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 16c0 .74.4 1.38 1 1.72V19a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h8v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1.28c.6-.34 1-.98 1-1.72V6a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v10Z"
      fill="currentColor"
    />
    <rect x="6" y="5.5" width="12" height="5" rx="1" fill="white" />
    <circle cx="7.5" cy="16.5" r="1.25" fill="white" />
    <circle cx="16.5" cy="16.5" r="1.25" fill="white" />
  </svg>
);

const BackIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M12 8v4.3l3 1.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Admin — add a new bus to the passenger listing (localStorage for now).
const AddBus = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  // Duration and ETA are both derived from the departure/arrival time
  // gap — no manual entry, so they can never drift out of sync with
  // the times actually picked.
  const duration = useMemo(() => calcDuration(form.departTime, form.arriveTime), [
    form.departTime,
    form.arriveTime,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.departStop.trim() || !form.arriveStop.trim()) {
      setError("Bus name, boarding point and drop point are required.");
      return;
    }
    if (!form.departTime || !form.arriveTime) {
      setError("Pick both a departure time and an arrival time.");
      return;
    }
    setError("");

    // -----------------------------------------------------------------
    // BACKEND TODO: once a real API exists, POST here instead:
    //
    //   await fetch("/api/buses", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });
    //
    // Until then, addBus() writes straight into localStorage under the
    // same "bussinn_buses" key that AdminOverview reads from.
    // -----------------------------------------------------------------
await  addBus({
      ...form,
      rating: Number(form.rating) || 0,
      confidence: Number(form.confidence) || 0,
      price: Number(form.price) || 0,
      duration: duration.label,
      eta: duration.label,
      live: true,
      accent: "#1a56ff",
      stops: [
        { name: form.departStop, time: form.departTime },
        { name: form.arriveStop, time: form.arriveTime },
      ],
    });

    // This is what makes the new bus show up on AdminOverview immediately:
    // that page listens for "bussinn:buses" and re-reads the store.
    window.dispatchEvent(new Event("bussinn:buses"));

    navigate({ to: "/admin/overview" });
  };

  return (
    <div className="addbus-page">
      <div className="addbus-content">
        {/* Top Header Card — same brand mark as AdminOverview */}
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
            onClick={() => navigate({ to: "/admin/overview" })}
          >
            <BackIcon />
            Back
          </button>
        </div>

        <h2 className="addbus-section-title">Add New Bus</h2>
        <p className="addbus-section-subtitle">
          Fill in the trip details below — it'll appear in your Fleet Management Directory right away.
        </p>

        <form onSubmit={handleSubmit} className="addbus-form-card">
          <div className="addbus-form-grid">
            <div className="form-group full-width">
              <label>Bus name</label>
              <input className="field" value={form.name} onChange={set("name")} placeholder="e.g. Bus 3" />
            </div>

            <div className="form-group full-width">
              <label>Bus type / operator</label>
              <input
                className="field"
                value={form.operator}
                onChange={set("operator")}
                placeholder="e.g. Volvo Multi-Axle A/C Sleeper"
              />
            </div>

            <div className="form-group">
              <label>Departure time</label>
              <input
                className="field field-time"
                type="time"
                value={form.departTime}
                onChange={set("departTime")}
              />
            </div>
            <div className="form-group">
              <label>Arrival time</label>
              <input
                className="field field-time"
                type="time"
                value={form.arriveTime}
                onChange={set("arriveTime")}
              />
            </div>

            <div className="form-group">
              <label>Boarding point</label>
              <input className="field" value={form.departStop} onChange={set("departStop")} placeholder="Swargate" />
            </div>
            <div className="form-group">
              <label>Drop point</label>
              <input className="field" value={form.arriveStop} onChange={set("arriveStop")} placeholder="Andheri East" />
            </div>

            {/* Auto-calculated — not editable, always in sync with the times above */}
            <div className="form-group full-width">
              <div className="duration-display">
                <ClockIcon className="duration-icon" />
                <div className="duration-text">
                  <span className="duration-label">Trip duration &amp; ETA (auto-calculated)</span>
                  <strong className="duration-value">{duration.label}</strong>
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Fare (₹)</label>
              <input className="field" value={form.price} onChange={set("price")} placeholder="559" inputMode="numeric" />
            </div>


            
          </div>

          {error ? <p className="field-error">{error}</p> : null}

          <div className="addbus-actions-row">
            <button type="submit" className="btn-submit-addbus">
              <PlusIcon />
              Add Bus to Listing
            </button>
            <button
              type="button"
              className="btn-cancel-addbus"
              onClick={() => navigate({ to: "/admin/overview" })}
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