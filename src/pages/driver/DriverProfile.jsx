import { Link } from "@tanstack/react-router";
import DriverBottomNav from "../../components/DriverBottomNav";
import "../../styles/DriverProfile.css";

// DriverProfile page — placeholder only. UI will be designed later.
const DriverProfile = () => {
  // TODO: Fetch driver profile here
  // TODO: Clear auth session on logout before navigating to /login
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Driver Profile Page</h1>
        <Link to="/redeem-coins" className="content">Redeem Coins</Link>
        <Link to="/refer-earn" className="content">Refer & Earn</Link>
        <Link to="/about-us" className="content">About Us</Link>
        <Link to="/help" className="content">Help</Link>
        <Link to="/feedback" className="content">Feedback</Link>
        <Link to="/login" className="content">Logout</Link>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverProfile;
