import { Link } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/RideDetails.css";

// RideDetails page — placeholder only. UI will be designed later.
const RideDetails = () => {
  // TODO: Fetch ride details for the selected bus here
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Ride Details Page</h1>
        <Link to="/passenger/live-tracking" className="content">Track Live Bus</Link>
      </div>

      <PassengerBottomNav />
    </div>
  );
};

export default RideDetails;
