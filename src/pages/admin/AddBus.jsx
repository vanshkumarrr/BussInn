import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import AdminBottomNav from "../../components/AdminBottomNav";
import { supabase } from "../../lib/supabase";
import "../../styles/AddBus.css";

const createEmptyStop = () => ({
  station_name: "",
  arrival_time: "",
  departure_time: "",
});

const emptyForm = {
  name: "",
  operator: "UPSRTC",
  trip_label: "",
  bus_type: "NON AC ORDINARY",
  depot: "",
  bus_number: "",
  service_date: "",
  source: "",
  destination: "",
  fare: "",
};

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
    <rect x="6" y="5.5" width="12" height="5" rx="1" fill="white" />
    <circle cx="7.5" cy="16.5" r="1.25" fill="white" />
    <circle cx="16.5" cy="16.5" r="1.25" fill="white" />
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

const AddBus = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);

  const [stops, setStops] = useState([
    createEmptyStop(),
    createEmptyStop(),
  ]);

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const setField = (key) => (e) => {
    setForm((previous) => ({
      ...previous,
      [key]: e.target.value,
    }));
  };

  const updateStop = (index, key, value) => {
    setStops((previous) =>
      previous.map((stop, i) =>
        i === index
          ? {
              ...stop,
              [key]: value,
            }
          : stop
      )
    );
  };

  const addStop = () => {
    setStops((previous) => [
      ...previous,
      createEmptyStop(),
    ]);
  };

  const removeStop = (index) => {
    if (stops.length <= 2) return;

    setStops((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError("Enter the bus name.");
      return;
    }

    if (!form.trip_label.trim()) {
      setError("Enter the trip label.");
      return;
    }

    if (!form.bus_type.trim()) {
      setError("Enter the bus type.");
      return;
    }

    if (!form.depot.trim()) {
      setError("Enter the depot.");
      return;
    }

    if (!form.source.trim()) {
      setError("Enter the source/starting station.");
      return;
    }

    if (!form.destination.trim()) {
      setError("Enter the destination.");
      return;
    }

    if (!form.service_date) {
      setError("Select the service date.");
      return;
    }

    if (!form.fare || Number(form.fare) < 0) {
      setError("Enter a valid fare.");
      return;
    }

    if (stops.length < 2) {
      setError("A bus must have at least two stops.");
      return;
    }

    const invalidStop = stops.find(
      (stop) =>
        !stop.station_name.trim() ||
        (!stop.arrival_time && !stop.departure_time)
    );

    if (invalidStop) {
      setError(
        "Every stop needs a station name and at least an arrival or departure time."
      );
      return;
    }

    const formattedStops = stops.map((stop, index) => ({
      stop_order: index + 1,
      station_name: stop.station_name.trim(),
      arrival_time: stop.arrival_time || null,
      departure_time: stop.departure_time || null,
    }));

    try {
      setSaving(true);

      const { data, error: rpcError } = await supabase.rpc(
        "admin_add_bus",
        {
          p_name: form.name.trim(),
          p_operator: form.operator.trim(),
          p_trip_label: form.trip_label.trim(),
          p_bus_type: form.bus_type.trim(),
          p_depot: form.depot.trim(),
          p_source: form.source.trim(),
          p_destination: form.destination.trim(),
          p_fare: Number(form.fare),
          p_service_date: form.service_date,
          p_bus_number: form.bus_number.trim() || null,
          p_stops: formattedStops,
        }
      );

      if (rpcError) {
        console.error("Add bus error:", rpcError);
        setError(rpcError.message || "Failed to add bus.");
        return;
      }

      console.log("BUS CREATED:", data);

      // Tell other already-open BussInn pages to refresh.
      window.dispatchEvent(new Event("bussinn:buses"));

      navigate({
        to: "/admin/overview",
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong while adding the bus.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="addbus-page">
      <div className="addbus-content">

        {/* HEADER */}
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
          Add complete bus information and its full station schedule.
        </p>

        <form
          onSubmit={handleSubmit}
          className="addbus-form-card"
        >

          {/* ================= BUS INFORMATION ================= */}

          <h3>Bus Information</h3>

          <div className="addbus-form-grid">

            <div className="form-group">
              <label>Bus name</label>
              <input
                className="field"
                value={form.name}
                onChange={setField("name")}
                placeholder="e.g. Anand Vihar - Hamirpur"
              />
            </div>

            <div className="form-group">
              <label>Operator</label>
              <input
                className="field"
                value={form.operator}
                onChange={setField("operator")}
                placeholder="e.g. UPSRTC"
              />
            </div>

            <div className="form-group">
              <label>Trip Label</label>
              <input
                className="field"
                value={form.trip_label}
                onChange={setField("trip_label")}
                placeholder="e.g. HMR0310"
              />
            </div>

            <div className="form-group">
              <label>Bus Type</label>
              <input
                className="field"
                value={form.bus_type}
                onChange={setField("bus_type")}
                placeholder="e.g. NON AC ORDINARY"
              />
            </div>

            <div className="form-group">
              <label>Depot</label>
              <input
                className="field"
                value={form.depot}
                onChange={setField("depot")}
                placeholder="e.g. HAMIRPUR"
              />
            </div>

            <div className="form-group">
              <label>Bus Number</label>
              <input
                className="field"
                value={form.bus_number}
                onChange={setField("bus_number")}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label>Service Date</label>
              <input
                className="field"
                type="date"
                value={form.service_date}
                onChange={setField("service_date")}
              />
            </div>

            <div className="form-group">
              <label>Fare per seat (₹)</label>
              <input
                className="field"
                type="number"
                min="0"
                value={form.fare}
                onChange={setField("fare")}
                placeholder="724"
              />
            </div>

            <div className="form-group">
              <label>Source</label>
              <input
                className="field"
                value={form.source}
                onChange={setField("source")}
                placeholder="ANAND VIHAR"
              />
            </div>

            <div className="form-group">
              <label>Destination</label>
              <input
                className="field"
                value={form.destination}
                onChange={setField("destination")}
                placeholder="HAMIRPUR"
              />
            </div>

          </div>

          {/* ================= STOPS ================= */}

          <div className="stops-editor">

            <div className="stops-editor-header">
              <div>
                <h3>Bus Schedule</h3>
                <p>
                  Add every station with arrival and departure time.
                </p>
              </div>

              <button
                type="button"
                className="btn-add-stop"
                onClick={addStop}
              >
                <PlusIcon />
                Add Stop
              </button>
            </div>

            <div className="stop-table">

              <div className="stop-table-header">
                <span>#</span>
                <span>Station Name</span>
                <span>Arrival</span>
                <span>Departure</span>
                <span></span>
              </div>

              {stops.map((stop, index) => (

                <div
                  className="stop-table-row"
                  key={index}
                >

                  <span className="stop-number">
                    {index + 1}
                  </span>

                  <input
                    className="field"
                    value={stop.station_name}
                    onChange={(e) =>
                      updateStop(
                        index,
                        "station_name",
                        e.target.value
                      )
                    }
                    placeholder="Station name"
                  />

                  <input
                    className="field"
                    type="time"
                    value={stop.arrival_time}
                    onChange={(e) =>
                      updateStop(
                        index,
                        "arrival_time",
                        e.target.value
                      )
                    }
                  />

                  <input
                    className="field"
                    type="time"
                    value={stop.departure_time}
                    onChange={(e) =>
                      updateStop(
                        index,
                        "departure_time",
                        e.target.value
                      )
                    }
                  />

                  <button
                    type="button"
                    className="btn-remove-stop"
                    onClick={() =>
                      removeStop(index)
                    }
                    disabled={stops.length <= 2}
                  >
                    ×
                  </button>

                </div>

              ))}

            </div>

          </div>

          {error && (
            <p className="field-error">
              {error}
            </p>
          )}

          {/* ================= ACTIONS ================= */}

          <div className="addbus-actions-row">

            <button
              type="submit"
              className="btn-submit-addbus"
              disabled={saving}
            >
              <PlusIcon />

              {saving
                ? "Adding Bus..."
                : "Add Bus to Listing"}
            </button>

            <button
              type="button"
              className="btn-cancel-addbus"
              disabled={saving}
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