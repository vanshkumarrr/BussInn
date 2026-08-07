import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import AdminBottomNav from "../../components/AdminBottomNav";
import { getBus, updateBus } from "../../lib/store";
import "../../styles/Admin.css";

const FIELDS = [
  ["name", "Bus name"],
  ["operator", "Bus type / operator"],
  ["departTime", "Departure time"],
  ["arriveTime", "Arrival time"],
  ["departStop", "Boarding point"],
  ["arriveStop", "Drop point"],
  ["duration", "Duration"],
  ["eta", "ETA"],
  ["price", "Fare (₹)"],
  ["oldPrice", "Old fare (₹)"],
  ["rating", "Rating"],
  ["reviews", "Reviews"],
  ["confidence", "Confidence %"],
  ["distanceAway", "Distance away"],
];

// Admin — edit an existing bus listing.
const EditBus = () => {
  const { busId } = useParams({ from: "/admin/edit-bus/$busId" });
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const bus = getBus(busId);
    if (bus) {
      const next = {};
      FIELDS.forEach(([key]) => {
        next[key] = bus[key] ?? "";
      });
      setForm(next);
    }
  }, [busId]);

  if (!form) {
    return (
      <div className="page wide">
        <p className="empty">This bus no longer exists.</p>
        <AdminBottomNav />
      </div>
    );
  }

  return (
    <div className="page wide">
      <h1 className="header">Edit bus</h1>
      <div className="container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateBus(busId, {
              ...form,
              rating: Number(form.rating) || 0,
              reviews: Number(form.reviews) || 0,
              confidence: Number(form.confidence) || 0,
              price: Number(form.price) || 0,
              oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
            });
            navigate({ to: "/admin/overview" });
          }}
        >
          <div className="two-col">
            {FIELDS.map(([key, label]) => (
              <div key={key}>
                <label className="field-label">{label}</label>
                <input
                  className="field"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
          </div>
          <button type="submit" className="content">
            Save changes
          </button>
        </form>
      </div>

      <AdminBottomNav />
    </div>
  );
};

export default EditBus;
