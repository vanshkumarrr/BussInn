import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Route as RouteIcon } from "lucide-react";
import AdminBottomNav from "../../components/AdminBottomNav";
import { getBuses } from "../../lib/store";
import "../../styles/Admin.css";

// Admin — pick a bus to build or edit its route.
const AddRoute = () => {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const load = () => setBuses(getBuses());
    load();
    window.addEventListener("bussinn:buses", load);
    return () => window.removeEventListener("bussinn:buses", load);
  }, []);

  return (
    <div className="page wide">
      <h1 className="header">Add route</h1>
      <p className="helper-text">Select a bus to add or edit the stops on its route.</p>

      {buses.length === 0 ? (
        <p className="empty">Add a bus first, then build its route here.</p>
      ) : (
        buses.map((bus) => (
          <Link
            key={bus.id}
            to="/admin/route/$busId"
            params={{ busId: bus.id }}
            className="container route-pick"
          >
            <span className="admin-logo">
              <RouteIcon size={18} />
            </span>
            <span>
              <strong>{bus.name}</strong>
              <small>
                {bus.departStop} → {bus.arriveStop} · {bus.stops?.length || 0} stops
              </small>
            </span>
          </Link>
        ))
      )}

      <AdminBottomNav />
    </div>
  );
};

export default AddRoute;
