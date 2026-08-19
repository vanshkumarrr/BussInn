import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import { Trash2, Plus } from "lucide-react";
import AdminBottomNav from "../../components/AdminBottomNav";
import { supabase } from "../../lib/supabase";
import {
  fetchRouteByBus,
  saveRouteStops,
} from "../../services/routeService";
import "../../styles/Admin.css";

// Admin — edit the stops of a bus route.
const EditRoute = () => {
  const { busId } = useParams({ from: "/admin/route/$busId" });
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [stops, setStops] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRoute = async () => {
      setLoading(true);
      setError("");

      // Get the bus information from Supabase.
      const { data: busData, error: busError } = await supabase
        .from("buses")
        .select("id, name, route_id")
        .eq("id", busId)
        .single();

      if (busError || !busData) {
        console.error("Error loading bus:", busError);
        setError("Unable to find this bus.");
        setLoading(false);
        return;
      }

      setBus(busData);

      // Get the route belonging to this bus.
      const routeData = await fetchRouteByBus(busId);

      if (!routeData) {
        setError("This bus does not have a route assigned.");
        setLoading(false);
        return;
      }

      setRoute(routeData);
      setStops(routeData.stops || []);

      setLoading(false);
    };

    loadRoute();
  }, [busId]);

  const updateStop = (index, key, value) => {
    setStops((currentStops) =>
      currentStops.map((stop, i) =>
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
    setStops((currentStops) => [
      ...currentStops,
      {
        id: null,
        name: "",
        latitude: 0,
        longitude: 0,
        arrivalTime: "",
        departureTime: "",
        time: "",
      },
    ]);
  };

  const removeStop = (index) => {
    setStops((currentStops) =>
      currentStops.filter((_, i) => i !== index)
    );
  };

  const handleSave = async () => {
    if (!route?.id) {
      setError("Route information is missing.");
      return;
    }

    const validStops = stops.filter(
      (stop) => stop.name && stop.name.trim()
    );

    if (validStops.length === 0) {
      setError("Add at least one stop before saving.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await saveRouteStops(route.id, validStops);

      navigate({ to: "/admin/overview" });
    } catch (err) {
      console.error("Error saving route:", err);
      setError(
        err?.message || "Unable to save the route."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page wide">
        <p className="empty">Loading route...</p>
        <AdminBottomNav />
      </div>
    );
  }

  if (!bus || !route) {
    return (
      <div className="page wide">
        <p className="empty">
          {error || "This route could not be loaded."}
        </p>

        <AdminBottomNav />
      </div>
    );
  }

  return (
    <div className="page wide">
      <h1 className="header">
        Route · {bus.name}
      </h1>

      <div className="container">
        {error ? (
          <p className="helper-text">
            {error}
          </p>
        ) : null}

        {stops.map((stop, index) => (
          <div className="stop-row" key={index}>
            <input
              className="field"
              placeholder="Stop name"
              value={stop.name || ""}
              onChange={(e) =>
                updateStop(
                  index,
                  "name",
                  e.target.value
                )
              }
            />

            <input
              className="field"
              placeholder="Time"
              value={
                stop.departureTime ||
                stop.arrivalTime ||
                stop.time ||
                ""
              }
              onChange={(e) => {
                updateStop(
                  index,
                  "time",
                  e.target.value
                );

                updateStop(
                  index,
                  "departureTime",
                  e.target.value
                );
              }}
            />

            <button
              type="button"
              className="icon-btn"
              aria-label="Remove stop"
              onClick={() => removeStop(index)}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}

        <button
          type="button"
          className="content ghost"
          onClick={addStop}
          disabled={saving}
        >
          <Plus size={14} />
          Add stop
        </button>

        <button
          type="button"
          className="content"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save route"}
        </button>
      </div>

      <AdminBottomNav />
    </div>
  );
};

export default EditRoute;