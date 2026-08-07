import { Link } from "@tanstack/react-router";
import "../../styles/NotFound.css";

// NotFound page — placeholder only. UI will be designed later.
const NotFound = () => {
  // 404 fallback page
  return (
    <div className="page">
      <div className="container">
        <h1 className="header">Not Found Page</h1>
        <Link to="/" className="content">Go home</Link>
      </div>
    </div>
  );
};

export default NotFound;
