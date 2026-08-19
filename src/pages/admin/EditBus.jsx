import { useEffect, useState } from "react";
import { useParams, useNavigate } from "@tanstack/react-router";
import AdminBottomNav from "../../components/AdminBottomNav";
import { getBus, updateBus } from "../../lib/store";
import "../../styles/Admin.css";

const FIELDS = [
  ["name", "Bus name", "text"],
  ["operator", "Bus type / operator", "text"],
  ["departTime", "Departure time", "time"],
  ["arriveTime", "Arrival time", "time"],
  ["departStop", "Boarding point", "text"],
  ["arriveStop", "Drop point", "text"],
  ["price", "Fare (₹)", "number"],
];

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

  const calculateDuration = (depart, arrive) => {
    if (!depart || !arrive) return "N/A";
    try {
      const [depH, depM] = depart.split(":").map(Number);
      const [arrH, arrM] = arrive.split(":").map(Number);
      
      let depTotalMins = depH * 60 + depM;
      let arrTotalMins = arrH * 60 + arrM;

      if (arrTotalMins < depTotalMins) {
        arrTotalMins += 24 * 60;
      }

      const diffMins = arrTotalMins - depTotalMins;
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      if (hours === 0) return `${mins}m`;
      if (mins === 0) return `${hours}h`;
      return `${hours}h ${mins}m`;
    } catch {
      return "N/A";
    }
  };

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
            const calculatedDuration = calculateDuration(form.departTime, form.arriveTime);
            
            updateBus(busId, {
              ...form,
              duration: calculatedDuration,
              price: Number(form.price) || 0,
            });
            navigate({ to: "/admin/overview" });
          }}
        >
          <div className="two-col">
            {FIELDS.map(([key, label, type]) => (
              <div key={key}>
                <label className="field-label">{label}</label>
                <input
                  type={type}
                  className="field"
                  value={form[key] ?? ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  {...(type === "time" ? { placeholder: "HH:MM" } : {})}
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