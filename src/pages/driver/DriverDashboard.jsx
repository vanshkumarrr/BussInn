import { Link } from "@tanstack/react-router";
import DriverBottomNav from "../../components/DriverBottomNav";
import "../../styles/DriverDashboard.css";

// DriverDashboard page — placeholder only. UI will be designed later.
const DriverDashboard = () => {
  // TODO: Dashboard UI will come here (today's route, stats, status toggle)
  // TODO: Fetch driver profile + assigned route here
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Driver Dashboard Page</h1>
        <Link to="/driver/live-tracking" className="content">Start Trip</Link>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverDashboard;
