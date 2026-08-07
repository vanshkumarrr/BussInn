import { Link } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/InsideBus.css";

// InsideBus page — placeholder only. UI will be designed later.
const InsideBus = () => {
  // TODO: Add QR scanner here (or manual Bus ID entry)
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Inside Bus Page</h1>
        <Link to="/passenger/live-tracking" className="content">Continue</Link>
      </div>

      <PassengerBottomNav />
    </div>
  );
};

export default InsideBus;
