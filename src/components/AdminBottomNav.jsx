import { Link } from "@tanstack/react-router";
import { LayoutGrid, BusFront, Route } from "lucide-react";
import "../styles/BottomNav.css";

// Admin bottom navigation — icons only.
const AdminBottomNav = () => {
  return (
    <nav className="bottom-nav admin-nav">
      <Link to="/admin/overview" className="bottom-nav-item icon-only" aria-label="Overview">
        <LayoutGrid size={20} />
      </Link>
      <Link to="/admin/add-bus" className="bottom-nav-item icon-only" aria-label="Add bus">
        <BusFront size={20} />
      </Link>
      <Link to="/admin/add-route" className="bottom-nav-item icon-only" aria-label="Add route">
        <Route size={20} />
      </Link>
    </nav>
  );
};

export default AdminBottomNav;
