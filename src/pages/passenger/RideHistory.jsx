import { Link } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/RideHistory.css";

// RideHistory page — placeholder only. UI will be designed later.
const RideHistory = () => {
  // TODO: Fetch passenger ride history here
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Ride History Page</h1>
      </div>

      <PassengerBottomNav />
    </div>
  );
};

export default RideHistory;
