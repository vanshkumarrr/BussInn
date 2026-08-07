import { Link } from "@tanstack/react-router";
import "../styles/BottomNav.css";

// Passenger bottom navigation — placeholder only, no styling.
// TODO: Design this bar (icons + active state) later.
const PassengerBottomNav = () => {
  return (
    <nav className="bottom-nav">
      <Link to="/passenger/search" className="bottom-nav-item">
        Search
      </Link>
      <Link to="/passenger/history" className="bottom-nav-item">
        Ride
      </Link>
      <Link to="/passenger/rewards" className="bottom-nav-item">
        Rewards
      </Link>
      <Link to="/passenger/profile" className="bottom-nav-item">
        Profile
      </Link>
    </nav>
  );
};

export default PassengerBottomNav;
