import { Link } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/PassengerSearch.css";

// PassengerSearch page — placeholder only. UI will be designed later.
const PassengerSearch = () => {
  // TODO: Add source/destination inputs and recent search history
  // TODO: Call search API here
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Passenger Search Page</h1>
        <Link to="/passenger/results" className="content">Search</Link>
      </div>

      <PassengerBottomNav />
    </div>
  );
};

export default PassengerSearch;
