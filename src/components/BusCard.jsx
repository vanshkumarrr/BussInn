import { Link } from "@tanstack/react-router";
import { Bus, MapPin, Star, BookOpen, Pencil, Trash2 } from "lucide-react";
import "../styles/BusCard.css";

// Reusable bus result card. Used by passenger results and the admin portal.
const BusCard = ({ bus, admin = false, onDelete }) => {
  const routeTo = admin ? "/admin/route/$busId" : "/passenger/route/$busId";

  return (
    <article className="bus-card" style={{ borderLeftColor: bus.accent || "#12b76a" }}>
      <div className="bus-card-top">
        <div className="bus-card-titles">
          <div className="bus-card-badges">
            {bus.live ? <span className="bus-live">● LIVE</span> : null}
            <Bus size={14} className="bus-card-icon" />
          </div>
          <h3 className="bus-card-name">{bus.name}</h3>
          <p className="bus-card-operator">{bus.operator}</p>
          <p className="bus-card-away">
            <MapPin size={12} /> {bus.distanceAway}
          </p>
        </div>

        <div className="bus-card-rating-wrap">
          <span className="bus-card-rating">
            <Star size={12} fill="currentColor" /> {bus.rating}
          </span>
          <span className="bus-card-reviews">{bus.reviews} Reviews</span>
          <div className="bus-confidence">
            <div className="bus-confidence-track">
              <div
                className="bus-confidence-fill"
                style={{
                  width: `${bus.confidence}%`,
                  background: bus.confidence >= 80 ? "#12b76a" : "#f79009",
                }}
              />
            </div>
            <span className="bus-confidence-label">{bus.confidence}% CONFIDENCE</span>
          </div>
        </div>
      </div>

      <div className="bus-card-timeline">
        <div className="bus-time-block">
          <strong>{bus.departTime}</strong>
          <span>{bus.departStop}</span>
        </div>
        <div className="bus-track">
          <span className="bus-duration">{bus.duration}</span>
          <div className="bus-line">
            <i className="dot" />
            <i className="rail" />
            <Bus size={14} className="bus-track-icon" />
            <i className="rail" />
            <i className="dot" />
          </div>
        </div>
        <div className="bus-time-block right">
          <strong>{bus.arriveTime}</strong>
          <span className="bus-eta">ETA: {bus.eta}</span>
          <span>{bus.arriveStop}</span>
        </div>
      </div>

      <div className="bus-card-bottom">
        <div className="bus-price">
          {bus.oldPrice ? <s>₹{bus.oldPrice}</s> : null}
          <strong>₹{bus.price}</strong>
        </div>
        <Link to={routeTo} params={{ busId: bus.id }} className="bus-route-btn">
          Route
        </Link>
      </div>

      <div className="bus-card-links">
        {admin ? (
          <>
            <Link to="/admin/route/$busId" params={{ busId: bus.id }} className="bus-link">
              <Pencil size={13} /> Edit route
            </Link>
            <Link to="/admin/edit-bus/$busId" params={{ busId: bus.id }} className="bus-link">
              <Pencil size={13} /> Edit bus
            </Link>
            <button type="button" className="bus-link danger" onClick={() => onDelete?.(bus.id)}>
              <Trash2 size={13} /> Delete
            </button>
          </>
        ) : (
          <>
            <span className="bus-link">Highlights</span>
            <span className="bus-link">Boarding/Dropping</span>
            <span className="bus-link">Policies</span>
            <Link to="/passenger/route/$busId" params={{ busId: bus.id }} className="bus-link">
              <BookOpen size={13} /> Show Route
            </Link>
          </>
        )}
      </div>
    </article>
  );
};

export default BusCard;
