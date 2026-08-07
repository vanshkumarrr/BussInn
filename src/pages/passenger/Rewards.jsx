import { Link } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/Rewards.css";

// Rewards page — placeholder only. UI will be designed later.
const Rewards = () => {
  // TODO: Connect rewards API here
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Rewards Page</h1>
        <Link to="/redeem-coins" className="content">Redeem Coins</Link>
      </div>

      <PassengerBottomNav />
    </div>
  );
};

export default Rewards;
