import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import AdminBottomNav from "../../components/AdminBottomNav";
import { addBus } from "../../lib/store";
import "../../styles/Admin.css";

const empty = {
  name: "",
  operator: "",
  rating: "4.5",
  reviews: "0",
  confidence: "80",
  distanceAway: "2 km away",
  departTime: "",
  departStop: "",
  arriveTime: "",
  arriveStop: "",
  duration: "",
  eta: "",
  price: "",
  oldPrice: "",
};

// Admin — add a new bus to the passenger listing (localStorage for now).
const AddBus = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.departStop.trim() || !form.arriveStop.trim()) {
      setError("Bus name, boarding point and drop point are required.");
      return;
    }
    addBus({
      ...form,
      rating: Number(form.rating) || 0,
      reviews: Number(form.reviews) || 0,
      confidence: Number(form.confidence) || 0,
      price: Number(form.price) || 0,
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      live: true,
      accent: "#1a56ff",
      stops: [
        { name: form.departStop, time: form.departTime },
        { name: form.arriveStop, time: form.arriveTime },
      ],
    });
    navigate({ to: "/admin/overview" });
  };

  return (
    <div className="page wide">
      <h1 className="header">Add bus</h1>
      <div className="container">
        <form onSubmit={handleSubmit}>
          <label className="field-label">Bus name</label>
          <input className="field" value={form.name} onChange={set("name")} />

          <label className="field-label">Bus type / operator</label>
          <input className="field" value={form.operator} onChange={set("operator")} />

          <div className="two-col">
            <div>
              <label className="field-label">Departure time</label>
              <input className="field" value={form.departTime} onChange={set("departTime")} />
            </div>
            <div>
              <label className="field-label">Arrival time</label>
              <input className="field" value={form.arriveTime} onChange={set("arriveTime")} />
            </div>
            <div>
              <label className="field-label">Boarding point</label>
              <input className="field" value={form.departStop} onChange={set("departStop")} />
            </div>
            <div>
              <label className="field-label">Drop point</label>
              <input className="field" value={form.arriveStop} onChange={set("arriveStop")} />
            </div>
            <div>
              <label className="field-label">Duration</label>
              <input className="field" value={form.duration} onChange={set("duration")} />
            </div>
            <div>
              <label className="field-label">ETA</label>
              <input className="field" value={form.eta} onChange={set("eta")} />
            </div>
            <div>
              <label className="field-label">Fare (₹)</label>
              <input className="field" value={form.price} onChange={set("price")} />
            </div>
            <div>
              <label className="field-label">Old fare (₹)</label>
              <input className="field" value={form.oldPrice} onChange={set("oldPrice")} />
            </div>
            <div>
              <label className="field-label">Rating</label>
              <input className="field" value={form.rating} onChange={set("rating")} />
            </div>
            <div>
              <label className="field-label">Reviews</label>
              <input className="field" value={form.reviews} onChange={set("reviews")} />
            </div>
            <div>
              <label className="field-label">Confidence %</label>
              <input className="field" value={form.confidence} onChange={set("confidence")} />
            </div>
            <div>
              <label className="field-label">Distance away</label>
              <input className="field" value={form.distanceAway} onChange={set("distanceAway")} />
            </div>
          </div>

          {error ? <p className="field-error">{error}</p> : null}

          <button type="submit" className="content">
            Add bus to listing
          </button>
        </form>
      </div>

      <AdminBottomNav />
    </div>
  );
};

export default AddBus;
