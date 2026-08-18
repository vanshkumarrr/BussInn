import { useEffect, useState } from "react";
import AdminBottomNav from "../../components/AdminBottomNav";
import { getBuses, deleteBus, updateBus } from "../../lib/store";
import "../../styles/AdminOverview.css";

const SAMPLE_ADMIN_BUSES = [
  {
    id: "1",
    name: "Bus 1",
    operator: "Bharat Travels",
    departStop: "Swargate",
    arriveStop: "Andheri East",
    startTime: "22:00",
    arrivalTime: "05:15",
    duration: "7h 15m",
    eta: "12 mins",
    price: 559,
    originalPrice: 699,
    rating: 4.8,
    reviewsCount: 209,
    confidence: "95%",
    distanceAway: "1.4 km away",
    stops: [
      { name: "Swargate", time: "22:00" },
      { name: "Katraj", time: "22:40" },
      { name: "Andheri East", time: "05:15" }
    ]
  },
  {
    id: "2",
    name: "Bus 2",
    operator: "SRS Travels",
    departStop: "Katraj",
    arriveStop: "Sion",
    startTime: "23:15",
    arrivalTime: "06:00",
    duration: "6h 45m",
    eta: "45 mins",
    price: 649,
    originalPrice: 799,
    rating: 4.6,
    reviewsCount: 128,
    confidence: "65%",
    distanceAway: "5.6 km away",
    stops: [
      { name: "Katraj", time: "23:15" },
      { name: "Sion", time: "06:00" }
    ]
  }
];

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

const RouteIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="5" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    <circle cx="19" cy="18" r="2.2" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M6.8 7.6c0 4 2 4 5.2 6 3.2 2 5.2 2 5.2 2.4"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeDasharray="2.5 2.5"
    />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M4 20h4l10-10-4-4L4 16v4Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0-1 12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 7h12Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FleetIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="6" width="14" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M17 9h2.4L21 12v3h-4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    <circle cx="8" cy="17" r="1.6" fill="currentColor" />
    <circle cx="18" cy="17" r="1.6" fill="currentColor" />
  </svg>
);

const PinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
  </svg>
);

const AdminOverview = () => {
  const [buses, setBuses] = useState([]);
  const [editingBus, setEditingBus] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  useEffect(() => {
  const loadBuses = async () => {
    try {
      const stored = await getBuses();

      if (Array.isArray(stored) && stored.length > 0) {
        setBuses(stored);
      } else {
        setBuses(SAMPLE_ADMIN_BUSES);
      }
    } catch (e) {
      console.error("Error loading buses:", e);
      setBuses(SAMPLE_ADMIN_BUSES);
    }
  };

  loadBuses();

  window.addEventListener("bussinn:buses", loadBuses);
  window.addEventListener("storage", loadBuses);

  return () => {
    window.removeEventListener("bussinn:buses", loadBuses);
    window.removeEventListener("storage", loadBuses);
  };
}, []);
 const handleDelete = async (id) => {
  console.log("DELETE BUTTON CLICKED");
  console.log("Bus ID:", id);

  try {
    const result = await deleteBus(id);

    console.log("DELETE RESULT:", result);

    const updated = await getBuses();

    console.log("BUSES AFTER DELETE:", updated);

    setBuses(updated);
  } catch (error) {
    console.error("DELETE ERROR:", error);
  }
};

  const handleSaveBus = async (e) => {
  e.preventDefault();

  try {
    const updatedBus = await updateBus(editingBus.id, {
      name: editingBus.name,
      operator: editingBus.operator,
      rating: editingBus.rating,
      reviews: editingBus.reviewsCount,
      confidence: editingBus.confidence,
      price: editingBus.price,
      old_price: editingBus.originalPrice,
      departure_time: editingBus.startTime,
      arrival_time: editingBus.arrivalTime,
    });

    console.log("BUS UPDATED SUCCESSFULLY:", updatedBus);

    const updatedBuses = await getBuses();
    setBuses(updatedBuses);

    setEditingBus(null);
  } catch (error) {
    console.error("ERROR UPDATING BUS:", error);
  }
};

  const handleSaveRoute = (e) => {
    e.preventDefault();
    const updatedBuses = buses.map((b) => (b.id === editingRoute.id ? editingRoute : b));
    setBuses(updatedBuses);
    localStorage.setItem("bussinn_buses", JSON.stringify(updatedBuses));
    window.dispatchEvent(new Event("bussinn:buses"));
    setEditingRoute(null);
  };

  const totalStops = Array.isArray(buses) ? buses.reduce((n, b) => n + (b?.stops?.length || 0), 0) : 0;

  return (
    <div className="admin-choice-page">
      <div className="app-content admin-overview-layout">
        {/* Top Header Card — BussInn brand mark */}
        <div className="admin-topbar-card">
          <div className="admin-brand-group">
            <BusIcon className="admin-logo-icon" />
            <div className="admin-title-group">
              <h2>BussInn</h2>
              <p>Your city, connected.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => { window.location.href = "/"; }}
            style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              border: "1px solid #fecaca",
              padding: "6px 14px",
              borderRadius: "20px",
              fontWeight: "650",
              cursor: "pointer",
              fontSize: "14px",
              transition: "background-color 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#fecaca"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#fee2e2"}
          >
            Log Out
          </button>
        </div>

        {/* Statistics Grid Cards */}
        <div className="stat-grid-cards">
          <div className="stat-box-card">
            <div className="stat-box-icon">
              <FleetIcon />
            </div>
            <div className="stat-box-text">
              <strong>{buses?.length || 0}</strong>
              <span>Buses Listed</span>
            </div>
          </div>
          <div className="stat-box-card">
            <div className="stat-box-icon">
              <PinIcon />
            </div>
            <div className="stat-box-text">
              <strong>{totalStops}</strong>
              <span>Route Stops</span>
            </div>
          </div>
        </div>

        <h2 className="section-header-title">Fleet Management Directory</h2>

        {!buses || buses.length === 0 ? (
          <p className="empty-state-box">No buses registered yet. Add one from the menu below.</p>
        ) : (
          <div className="admin-buses-stack">
            {buses.map((bus) => (
              <div key={bus?.id || Math.random()} className="admin-bus-card">
                <div className="bus-card-header-row">
                  <div className="bus-identity">
                    <div className="small-bus-icon">
                      <BusIcon />
                    </div>
                    <div>
                      <h3>{bus?.name || `Bus #${bus?.id}`}</h3>
                      {bus?.operator && <div className="bus-operator">{bus.operator}</div>}
                    </div>
                  </div>
                  <div className="bus-price-tag">₹{bus?.price || 559}</div>
                </div>

                <div className="bus-route-inner-box">
                  <div className="route-endpoint">
                    <span className="endpoint-label">DEPARTURE</span>
                    <div className="endpoint-city">{bus?.departStop || "Swargate"}</div>
                    <div className="endpoint-time">{bus?.departure_time || "22:00"}</div>
                  </div>

                  <div className="route-arrow-icon">
                    <span>➔</span>
                  </div>

                  <div className="route-endpoint right">
                    <span className="endpoint-label">ARRIVAL</span>
                    <div className="endpoint-city">{bus?.arriveStop || "Andheri East"}</div>
                    <div className="endpoint-time">{bus?.arrival_time || "05:15"}</div>
                  </div>
                </div>

                <div className="bus-card-actions-row">
                  <button
                    onClick={() => setEditingRoute(JSON.parse(JSON.stringify(bus)))}
                    className="btn-admin-action outline"
                    type="button"
                  >
                    <RouteIcon />
                    Edit Route
                  </button>
                  <button
                    onClick={() => setEditingBus(JSON.parse(JSON.stringify(bus)))}
                    className="btn-admin-action primary"
                    type="button"
                  >
                    <EditIcon />
                    Edit Bus
                  </button>
                  <button
                    onClick={() => handleDelete(bus?.id)}
                    className="btn-admin-action danger"
                    type="button"
                  >
                    <TrashIcon />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EDIT BUS MODAL */}
        {editingBus && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card">
              <h3>Edit Bus Listing</h3>
              <form onSubmit={handleSaveBus} className="admin-form-grid">
                <div className="form-group">
                  <label>Bus name / operator</label>
                  <input
                    type="text"
                    value={editingBus.name || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Bus type</label>
                  <input
                    type="text"
                    value={editingBus.operator || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, operator: e.target.value })}
                    placeholder="e.g. A/C Sleeper"
                  />
                </div>
                <div className="form-group">
                  <label>Departure time</label>
                  <input
                    type="text"
                    value={editingBus.startTime || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Arrival time</label>
                  <input
                    type="text"
                    value={editingBus.arrivalTime || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, arrivalTime: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Boarding point</label>
                  <input
                    type="text"
                    value={editingBus.departStop || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, departStop: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Drop point</label>
                  <input
                    type="text"
                    value={editingBus.arriveStop || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, arriveStop: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input
                    type="text"
                    value={editingBus.duration || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, duration: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>ETA</label>
                  <input
                    type="text"
                    value={editingBus.eta || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, eta: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Fare (₹)</label>
                  <input
                    type="number"
                    value={editingBus.price || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, price: Number(e.target.value) })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Old fare (₹)</label>
                  <input
                    type="number"
                    value={editingBus.originalPrice || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, originalPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBus.rating || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, rating: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Reviews count</label>
                  <input
                    type="number"
                    value={editingBus.reviewsCount || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, reviewsCount: Number(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label>Confidence %</label>
                  <input
                    type="text"
                    value={editingBus.confidence || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, confidence: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Distance away</label>
                  <input
                    type="text"
                    value={editingBus.distanceAway || ""}
                    onChange={(e) => setEditingBus({ ...editingBus, distanceAway: e.target.value })}
                  />
                </div>

                <div className="modal-buttons-row">
                  <button type="submit" className="btn-submit-modal">
                    Update Bus Listing
                  </button>
                  <button type="button" onClick={() => setEditingBus(null)} className="btn-cancel-modal">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* EDIT ROUTE MODAL */}
        {editingRoute && (
          <div className="admin-modal-overlay">
            <div className="admin-modal-card">
              <h3>Edit Route Sequence</h3>
              <p className="modal-subtitle">
                Modify starting point, boarding point, and intermediate stops for {editingRoute.name}
              </p>

              <form onSubmit={handleSaveRoute} className="admin-form-grid">
                <div className="form-group full-width">
                  <label>Starting / Boarding Point</label>
                  <input
                    type="text"
                    value={editingRoute.departStop || ""}
                    onChange={(e) => setEditingRoute({ ...editingRoute, departStop: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label style={{ fontWeight: "700", marginTop: "8px", display: "block" }}>
                    Route Stops Sequence
                  </label>
                  {editingRoute.stops.map((stop, idx) => (
                    <div key={idx} className="stop-input-row">
                      <input
                        type="text"
                        value={stop.name}
                        onChange={(e) => {
                          const newStops = [...editingRoute.stops];
                          newStops[idx].name = e.target.value;
                          setEditingRoute({ ...editingRoute, stops: newStops });
                        }}
                        placeholder="Stop name"
                        required
                      />
                      <input
                        type="text"
                        value={stop.time}
                        onChange={(e) => {
                          const newStops = [...editingRoute.stops];
                          newStops[idx].time = e.target.value;
                          setEditingRoute({ ...editingRoute, stops: newStops });
                        }}
                        placeholder="Time"
                        style={{ width: "90px" }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newStops = editingRoute.stops.filter((_, i) => i !== idx);
                          setEditingRoute({ ...editingRoute, stops: newStops });
                        }}
                        className="btn-delete-stop"
                      >
                        ✕
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingRoute({
                        ...editingRoute,
                        stops: [...editingRoute.stops, { name: "", time: "00:00" }]
                      });
                    }}
                    className="btn-add-stop"
                  >
                    + Add Stop
                  </button>
                </div>

                <div className="form-group full-width">
                  <label>Destination / Drop Point</label>
                  <input
                    type="text"
                    value={editingRoute.arriveStop || ""}
                    onChange={(e) => setEditingRoute({ ...editingRoute, arriveStop: e.target.value })}
                    required
                  />
                </div>

                <div className="modal-buttons-row">
                  <button type="submit" className="btn-submit-modal">
                    Save Route
                  </button>
                  <button type="button" onClick={() => setEditingRoute(null)} className="btn-cancel-modal">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <AdminBottomNav />
      </div>
    </div>
  );
};

export default AdminOverview;