import { Link } from "@tanstack/react-router";
import BackButton from "../../components/BackButton";
import "../../styles/Feedback.css";

// Feedback page — placeholder only. UI will be designed later.
const Feedback = () => {
  // TODO: Submit feedback form to backend
  return (
    <div className="page">
      <BackButton fallback="/" />
      <div className="container">
        <h1 className="header">Feedback Page</h1>
      </div>
    </div>
  );
};

export default Feedback;
