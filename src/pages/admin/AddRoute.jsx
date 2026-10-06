import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bus, X, Route as RouteIcon } from "lucide-react";
import AdminBottomNav from "../../components/AdminBottomNav";
import { getBuses } from "../../lib/store";
import "../../styles/AdminOverview.css";

// Admin — view and filter bus routes based on boarding and drop points.
const AddRoute = () => {
  const [buses, setBuses] = useState([]);
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");

  useEffect(() => {
  const load = async () => {
    try {
      const data = await getBuses();
      setBuses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading buses:", error);
      setBuses([]);
    }
  };

  load();

  const handleUpdate = () => {
    load();
  };

  window.addEventListener("bussinn:buses", handleUpdate);
  window.addEventListener("storage", handleUpdate);

  return () => {
    window.removeEventListener("bussinn:buses", handleUpdate);
    window.removeEventListener("storage", handleUpdate);
  };
}, []);

  // Filter buses based on selected boarding and drop points
  const filteredBuses = buses.filter((bus) => {
    const depart = (bus.departStop || "").toLowerCase();
    const arrive = (bus.arriveStop || "").toLowerCase();
    const queryFrom = searchFrom.trim().toLowerCase();
    const queryTo = searchTo.trim().toLowerCase();

    const matchesFrom = queryFrom === "" || depart.includes(queryFrom);
    const matchesTo = queryTo === "" || arrive.includes(queryTo);

    return matchesFrom && matchesTo;
  });

  return (
    <div className="admin-choice-page">
      <div className="app-content admin-overview-layout">

        {/* Top Header Card */}
        <div className="admin-topbar-card">
          <div className="admin-brand-group">
            <div className="admin-logo-box">
              <Bus size={20} color="#0052cc" />
            </div>
            <div className="admin-title-group">
              <h2 className="brand-title-text">BussInn</h2>
              <p className="brand-subtitle-text">Your city, connected.</p>
            </div>
          </div>
          <button
            type="button"
            className="admin-close-btn"
            onClick={() => window.history.back()}
            aria-label="Close"
          >
            <X size={18} color="#333333" />
          </button>
        </div>

        <h1 className="section-header-title" style={{ fontSize: "18px", marginBottom: "4px" }}>Route Management</h1>
        <p className="modal-subtitle" style={{ marginBottom: "16px" }}>Filter listed buses by boarding and drop points to view or edit their routes.</p>

        {/* Filter / Search Box Container */}
        <div className="admin-bus-card" style={{ padding: "16px", marginBottom: "20px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div className="form-group" style={{ width: "100%" }}>
              <label>Boarding Point</label>
              <input
                type="text"
                placeholder="e.g. Swargate, Pune"
                value={searchFrom}
                onChange={(e) => setSearchFrom(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ width: "100%" }}>
              <label>Drop Point</label>
              <input
                type="text"
                placeholder="e.g. Mumbai, Andheri"
                value={searchTo}
                onChange={(e) => setSearchTo(e.target.value)}
              />
            </div>
            {(searchFrom || searchTo) && (
              <button
                type="button"
                onClick={() => { setSearchFrom(""); setSearchTo(""); }}
                style={{ background: "none", border: "none", color: "#0052cc", fontSize: "12px", fontWeight: "700", cursor: "pointer", textAlign: "left", padding: "0" }}
              >
                Clear Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* Results List */}
        {filteredBuses.length === 0 ? (
          <p className="empty-state-box">No routes match your search criteria.</p>
        ) : (
          <div className="admin-buses-stack">
            {filteredBuses.map((bus) => (
              <Link
                key={bus.id}
                to="/admin/route/$busId"
                params={{ busId: String(bus.id) }}
                className="admin-bus-card"
                style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "12px", cursor: "pointer" }}
              >
                <div className="bus-card-header-row">
                  <div className="bus-identity">
                    <div className="small-bus-icon">
                      <RouteIcon size={16} color="#0052cc" />
                    </div>
                    <h3 style={{ color: "#1a1c1f" }}>{bus.name}</h3>
                  </div>
                  <span style={{ fontSize: "11px", backgroundColor: "#e6f0ff", color: "#0052cc", padding: "4px 8px", borderRadius: "99px", fontWeight: "700" }}>
                    {bus.stops?.length || 0} Stops
                  </span>
                </div>

                <div className="bus-route-inner-box" style={{ margin: 0 }}>
                  <div className="route-endpoint">
                    <span className="endpoint-label">Boarding</span>
                    <div className="endpoint-city">{bus.departStop || "Pune"}</div>
                  </div>
                  <div className="route-arrow-icon">➔</div>
                  <div className="route-endpoint right">
                    <span className="endpoint-label">Drop</span>
                    <div className="endpoint-city">{bus.arriveStop || "Mumbai"}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <AdminBottomNav />

      </div>
    </div>
  );
};

export default AddRoute;