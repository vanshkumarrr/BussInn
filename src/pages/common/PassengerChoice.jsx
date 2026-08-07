import { Link } from "@tanstack/react-router";
import "../../styles/PassengerChoice.css";

// PassengerChoice page — placeholder only. UI will be designed later.
const PassengerChoice = () => {
  // TODO: Branch passenger experience based on this choice
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Passenger Choice Page</h1>
        <Link to="/passenger/search" className="content">I am Searching For Bus</Link>
        <Link to="/passenger/inside-bus" className="content">I am Inside Bus</Link>
      </div>
    </div>
  );
};

export default PassengerChoice;
