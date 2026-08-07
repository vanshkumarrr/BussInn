import { Link } from "@tanstack/react-router";
import DriverBottomNav from "../../components/DriverBottomNav";
import "../../styles/DriverCoins.css";

// DriverCoins page — placeholder only. UI will be designed later.
const DriverCoins = () => {
  // TODO: Fetch driver coin balance / earnings here
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Driver Coins Page</h1>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default DriverCoins;
