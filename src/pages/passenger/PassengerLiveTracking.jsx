import { Link } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/PassengerLiveTracking.css";

// PassengerLiveTracking page — placeholder only. UI will be designed later.
const PassengerLiveTracking = () => {
  // TODO: Add Google Maps integration here
  // TODO: Add Socket.IO live updates here
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Passenger Live Tracking Page</h1>
        <Link to="/passenger/history" className="content">End / View Ride History</Link>
      </div>

      <PassengerBottomNav />
    </div>
  );
};

export default PassengerLiveTracking;
