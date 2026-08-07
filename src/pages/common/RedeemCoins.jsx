import { Link } from "@tanstack/react-router";
import BackButton from "../../components/BackButton";
import "../../styles/RedeemCoins.css";

// RedeemCoins page — placeholder only. UI will be designed later.
const RedeemCoins = () => {
  // TODO: Connect rewards API here (redeem catalogue)
  return (
    <div className="page">
      <BackButton fallback="/" />
      <div className="container">
        <h1 className="header">Redeem Coins Page</h1>
      </div>
    </div>
  );
};

export default RedeemCoins;
