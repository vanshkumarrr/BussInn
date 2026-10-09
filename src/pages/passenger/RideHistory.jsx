import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  History,
  Star,
  Ticket,
} from "lucide-react";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import { getCompletedRides } from "../../lib/rideHistory";
import "../../styles/RideHistory.css";
import "../../styles/RideHistory.css";

const readLocalRideHistory = () => {
  try {
    const stored = JSON.parse(
      localStorage.getItem("bussinn_completed_rides") || "[]"
    );

    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const RideHistory = () => {
  const [completedRides, setCompletedRides] = useState([]);

  useEffect(() => {
    const loadRides = () => {
      let helperRides = [];

      try {
        const result = getCompletedRides();

        if (Array.isArray(result)) {
          helperRides = result;
        }
      } catch (error) {
        console.warn(
          "Ride history helper could not load rides",
          error
        );
      }

      const localRides = readLocalRideHistory();
      const merged = [...localRides, ...helperRides];

      const unique = merged.filter((ride, index, array) => {
        const id =
          ride.id ||
          `${ride.from || ride.startLocation}-${
            ride.to || ride.endLocation
          }-${ride.date}-${ride.time}`;

        return (
          array.findIndex((item) => {
            const itemId =
              item.id ||
              `${item.from || item.startLocation}-${
                item.to || item.endLocation
              }-${item.date}-${item.time}`;

            return itemId === id;
          }) === index
        );
      });

      setCompletedRides(unique);
    };

    loadRides();

    window.addEventListener(
      "bussinn-ride-history-updated",
      loadRides
    );
    window.addEventListener("storage", loadRides);

    return () => {
      window.removeEventListener(
        "bussinn-ride-history-updated",
        loadRides
      );
      window.removeEventListener("storage", loadRides);
    };
  }, []);

  return (
    <main className="ride-history-page">
      <section className="ride-history-app">
        <header className="passenger-header-history">
          <div className="history-header-top">
            <div className="history-brand" aria-label="BussInn">
              <BusFront
                className="history-brand-icon"
                aria-hidden="true"
              />
              <span>BussInn</span>
            </div>

            <div className="history-header-label">
              <History aria-hidden="true" />
              <span>RIDE HISTORY</span>
            </div>
          </div>

          <div className="history-title-area">
            <h1>Your journeys</h1>
            <p>View completed rides and travel details.</p>
          </div>
        </header>

        <section className="passenger-main-content-history">
          <div className="rides-list-container">
            {completedRides.length === 0 ? (
              <div className="ride-history-empty">
                <BusFront size={30} />
                <h2>No rides yet</h2>
                <p>
                  Your completed trips will appear here with pickup,
                  drop, bus and fare details.
                </p>
                <Link to="/passenger/results">Find a bus</Link>
              </div>
            ) : (
              completedRides.map((ride, index) => {
                const from =
                  ride.from ||
                  ride.startLocation ||
                  ride.pickupPoint ||
                  "Pickup not saved";

                const to =
                  ride.to ||
                  ride.endLocation ||
                  ride.dropPoint ||
                  "Drop not saved";

                const status = ride.status || "Completed";

                const isCompleted = status
                  .toLowerCase()
                  .includes("completed");

                const busType =
                  ride.serviceType ||
                  ride.bus_type ||
                  ride.busType ||
                  "Bus";

                return (
                  <article
                    key={ride.id || `${from}-${to}-${index}`}
                    className="ride-card"
                  >
                    <div className="ride-card-top">
                      <div className="ride-route-group">
                        <span className="ride-city">{from}</span>
                        <ArrowRight
                          className="ride-arrow"
                          aria-hidden="true"
                        />
                        <span className="ride-city">{to}</span>
                      </div>

                      <span
                        className={`ride-status ${
                          isCompleted ? "completed" : "ended-early"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="ride-card-details">
                      <div className="detail-item">
                        <BusFront aria-hidden="true" />
                        <span>
                          {ride.busName ? `${ride.busName} · ` : ""}
                          {busType} bus
                        </span>
                      </div>

                      <div className="detail-item">
                        <CalendarDays aria-hidden="true" />
                        <span>
                          {ride.date || "Date not saved"}
                          {ride.time ? ` · ${ride.time}` : ""}
                        </span>
                      </div>

                      {ride.departureTime && (
                        <div className="detail-item">
                          <CalendarDays aria-hidden="true" />
                          <span>
                            Departure: {ride.departureTime}
                          </span>
                        </div>
                      )}

                      {ride.busId && (
                        <div className="detail-item">
                          <Ticket aria-hidden="true" />
                          <span>Bus / Trip ID: {ride.busId}</span>
                        </div>
                      )}

                      {Array.isArray(ride.stops) &&
                        ride.stops.length > 0 && (
                          <div className="detail-item ride-history-stops">
                            <History aria-hidden="true" />
                            <span>
                              Stops: {ride.stops.join(" → ")}
                            </span>
                          </div>
                        )}

                      {ride.rating != null && (
                        <div className="detail-item">
                          <Star aria-hidden="true" />
                          <span>
                            Rated {ride.rating}/5
                            {ride.feedbackReasons?.length
                              ? ` · ${ride.feedbackReasons.join(", ")}`
                              : ""}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="ride-card-footer">
                      <span className="ride-id">
                        {ride.id || "Ride record"}
                      </span>

                      <span className="ride-fare">
                        <Ticket aria-hidden="true" />
                        {ride.fare ||
                          ride.ticketPrice ||
                          "Fare not saved"}
                      </span>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        <PassengerBottomNav />
      </section>
    </main>
  );
};

export default RideHistory;