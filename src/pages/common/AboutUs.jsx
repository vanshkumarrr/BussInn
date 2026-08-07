import { Link } from "@tanstack/react-router";
import BackButton from "../../components/BackButton";
import "../../styles/AboutUs.css";

// AboutUs page — placeholder only. UI will be designed later.
const AboutUs = () => {
  // TODO: Add static about content
  return (
    <div className="page">
      <BackButton fallback="/" />
      <div className="container">
        <h1 className="header">About Us Page</h1>
      </div>
    </div>
  );
};

export default AboutUs;
