import { Link } from "@tanstack/react-router";
import BackButton from "../../components/BackButton";
import "../../styles/Help.css";

// Help page — placeholder only. UI will be designed later.
const Help = () => {
  // TODO: Add help / FAQ content and support contact API
  return (
    <div className="page">
      <BackButton fallback="/" />
      <div className="container">
        <h1 className="header">Help Page</h1>
      </div>
    </div>
  );
};

export default Help;
