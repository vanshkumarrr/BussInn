import { Link } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/PassengerDashboard.css";

// PassengerDashboard page — placeholder only. UI will be designed later.
const PassengerDashboard = () => {
  // TODO: Optional landing UI for passengers
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Passenger Dashboard Page</h1>
        <Link to="/passenger/search" className="content">Search a bus</Link>
      </div>

      <PassengerBottomNav />
    </div>
  );
};

export default PassengerDashboard;
