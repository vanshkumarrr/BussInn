import { Link } from "@tanstack/react-router";
import BackButton from "../../components/BackButton";
import "../../styles/ReferEarn.css";

// ReferEarn page — placeholder only. UI will be designed later.
const ReferEarn = () => {
  // TODO: Fetch referral code and share links here
  return (
    <div className="page">
      <BackButton fallback="/" />
      <div className="container">
        <h1 className="header">Refer Earn Page</h1>
      </div>
    </div>
  );
};

export default ReferEarn;
