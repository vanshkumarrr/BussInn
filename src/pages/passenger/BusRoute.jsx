import { useEffect, useState } from "react";
import { useParams, Link } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import { getBus } from "../../lib/store";
import "../../styles/BusRoute.css";

// Passenger — read-only route for a bus.
const BusRoute = () => {
  const { busId } = useParams({ from: "/passenger/route/$busId" });
  const [bus, setBus] = useState(null);

  useEffect(() => {
    setBus(getBus(busId));
  }, [busId]);

  if (!bus) {
    return (
      <div className="page wide">
        <p className="empty">This bus is no longer available.</p>
        <PassengerBottomNav />
      </div>
    );
  }

  return (
    <div className="page wide">
      <h1 className="header">{bus.name} route</h1>
      <div className="container">
        <p className="helper-text">
          {bus.departStop} → {bus.arriveStop} · {bus.duration}
        </p>
        <ol className="route-list">
          {(bus.stops || []).map((stop, i) => (
            <li key={i}>
              <span className="route-time">{stop.time}</span>
              <span className="route-name">{stop.name}</span>
            </li>
          ))}
        </ol>
        <Link to="/passenger/results" className="text-link">
          Back to results
        </Link>
      </div>

      <PassengerBottomNav />
    </div>
  );
};

export default BusRoute;
