import { Link } from "@tanstack/react-router";
import "../styles/BottomNav.css";

// Driver bottom navigation — placeholder only, no styling.
// TODO: Design this bar (icons + active state) later.
const DriverBottomNav = () => {
  return (
    <nav className="bottom-nav">
      <Link to="/driver/dashboard" className="bottom-nav-item">
        Dashboard
      </Link>
      <Link to="/driver/recent-trips" className="bottom-nav-item">
        Recent Trips
      </Link>
      <Link to="/driver/coins" className="bottom-nav-item">
        Coins
      </Link>
      <Link to="/driver/profile" className="bottom-nav-item">
        Profile
      </Link>
    </nav>
  );
};

export default DriverBottomNav;
