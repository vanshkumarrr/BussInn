import { Link } from "@tanstack/react-router";
import DriverBottomNav from "../../components/DriverBottomNav";
import "../../styles/DriverRecentTrips.css";

// DriverRecentTrips page — placeholder only. UI will be designed later.
const DriverRecentTrips = () => {
  // TODO: Fetch driver trips here
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Driver Recent Trips Page</h1>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverRecentTrips;
