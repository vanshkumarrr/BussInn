import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Trash2, Plus } from "lucide-react";
import AdminBottomNav from "../../components/AdminBottomNav";
import { getBus, setBusStops } from "../../lib/store";
import "../../styles/Admin.css";

// Admin — edit the stops of a bus route.
const EditRoute = () => {
  const { busId } = useParams({ from: "/admin/route/$busId" });
  const navigate = useNavigate();
  const [bus, setBus] = useState(null);
  const [stops, setStops] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const found = getBus(busId);
    setBus(found);
    setStops(found?.stops || []);
  }, [busId]);

  if (!bus) {
    return (
      <div className="page wide">
        <p className="empty">This bus no longer exists.</p>
        <AdminBottomNav />
      </div>
    );
  }

  const updateStop = (i, key, value) =>
    setStops(stops.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)));

  return (
    <div className="page wide">
      <h1 className="header">Route · {bus.name}</h1>
      <div className="container">
        {stops.map((stop, i) => (
          <div className="stop-row" key={i}>
            <input
              className="field"
              placeholder="Stop name"
              value={stop.name}
              onChange={(e) => updateStop(i, "name", e.target.value)}
            />
            <input
              className="field"
              placeholder="Time"
              value={stop.time}
              onChange={(e) => updateStop(i, "time", e.target.value)}
            />
            <button
              type="button"
              className="icon-btn"
              aria-label="Remove stop"
              onClick={() => setStops(stops.filter((_, idx) => idx !== i))}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button
          type="button"
          className="content ghost"
          onClick={() => setStops([...stops, { name: "", time: "" }])}
        >
          <Plus size={14} /> Add stop
        </button>

        <button
          type="button"
          className="content"
          onClick={() => {
            setBusStops(bus.id, stops.filter((s) => s.name.trim()));
            setSaved(true);
            navigate({ to: "/admin/overview" });
          }}
        >
          Save route
        </button>
        {saved ? <p className="helper-text">Route saved.</p> : null}
      </div>

      <AdminBottomNav />
    </div>
  );
};

export default EditRoute;
