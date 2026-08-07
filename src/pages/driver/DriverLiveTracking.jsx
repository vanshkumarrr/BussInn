import { Link } from "@tanstack/react-router";
import DriverBottomNav from "../../components/DriverBottomNav";
import "../../styles/DriverLiveTracking.css";

// DriverLiveTracking page — placeholder only. UI will be designed later.
const DriverLiveTracking = () => {
  // TODO: Add Google Maps integration here
  // TODO: Fetch live location here (navigator.geolocation.watchPosition)
  // TODO: Add Socket.IO live updates here
  // TODO: Backend logic for ending a trip goes here
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Driver Live Tracking Page</h1>
        <Link to="/driver/recent-trips" className="content">End Trip</Link>
        <Link to="/driver/dashboard" className="content">Back to Dashboard</Link>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverLiveTracking;
