import { useEffect, useState } from "react";
import { Bus } from "lucide-react";
import AdminBottomNav from "../../components/AdminBottomNav";
import BusCard from "../../components/BusCard";
import { getBuses, deleteBus } from "../../lib/store";
import "../../styles/Admin.css";

// Admin overview — every bus listed in the app.
const AdminOverview = () => {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const load = () => setBuses(getBuses());
    load();
    window.addEventListener("bussinn:buses", load);
    return () => window.removeEventListener("bussinn:buses", load);
  }, []);

  const totalStops = buses.reduce((n, b) => n + (b.stops?.length || 0), 0);
  const liveCount = buses.filter((b) => b.live).length;

  return (
    <div className="page wide">
      <div className="admin-topbar">
        <div className="admin-brand">
          <span className="admin-logo">
            <Bus size={18} />
          </span>
          <span>
            BussInn
            <small>Transit Management</small>
          </span>
        </div>
        <span className="count-pill">Admin</span>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <strong>{buses.length}</strong>
          <span>Buses listed</span>
        </div>
        <div className="stat-card">
          <strong>{liveCount}</strong>
          <span>Live now</span>
        </div>
        <div className="stat-card">
          <strong>{totalStops}</strong>
          <span>Route stops</span>
        </div>
      </div>

      <h2 className="header">All buses</h2>
      {buses.length === 0 ? (
        <p className="empty">No buses yet. Add one from the bus icon below.</p>
      ) : (
        buses.map((bus) => (
          <BusCard key={bus.id} bus={bus} admin onDelete={(id) => setBuses(deleteBus(id))} />
        ))
      )}

      <AdminBottomNav />
    </div>
  );
};

export default AdminOverview;
