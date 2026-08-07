import { Link, useMatchRoute } from "@tanstack/react-router";
import "../styles/BottomNav.css";

const DriverBottomNav = () => {
  const matchRoute = useMatchRoute();

  const isActive = (path) => {
    return matchRoute({ to: path }) ? "active-tab" : "";
  };

  return (
    <nav className="bottom-nav">
      
      {/* Dashboard Tab */}
      <Link 
        to="/driver/dashboard" 
        className={`bottom-nav-item ${isActive("/driver/dashboard")}`}
      >
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>Dashboard</span>
      </Link>

      {/* Recent Trips Tab */}
      <Link 
        to="/driver/recent-trips" 
        className={`bottom-nav-item ${isActive("/driver/recent-trips")}`}
      >
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
        <span>Trips</span>
      </Link>

      {/* Coins Tab */}
      <Link 
        to="/driver/coins" 
        className={`bottom-nav-item ${isActive("/driver/coins")}`}
      >
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
        <span>Coins</span>
      </Link>

      {/* Profile Tab */}
      <Link 
        to="/driver/profile" 
        className={`bottom-nav-item ${isActive("/driver/profile")}`}
      >
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Profile</span>
      </Link>

    </nav>
  );
};

export default DriverBottomNav;