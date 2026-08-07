import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import BusCard from "../../components/BusCard";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import { getBuses } from "../../lib/store";
import "../../styles/LiveBusResults.css";

// LiveBusResults — shows the buses currently listed in the app.
const LiveBusResults = () => {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    const load = () => setBuses(getBuses());
    load();
    window.addEventListener("bussinn:buses", load);
    return () => window.removeEventListener("bussinn:buses", load);
  }, []);

  return (
    <div className="page wide">
      <div className="list-head">
        <h1 className="header">Live buses</h1>
        <span className="count-pill">{buses.length} results</span>
      </div>

      {buses.length === 0 ? (
        <p className="empty">No buses listed right now. Please check back soon.</p>
      ) : (
        buses.map((bus) => <BusCard key={bus.id} bus={bus} />)
      )}

      <Link to="/passenger/search" className="text-link">
        Change search
      </Link>

      <PassengerBottomNav />
    </div>
  );
};

export default LiveBusResults;
