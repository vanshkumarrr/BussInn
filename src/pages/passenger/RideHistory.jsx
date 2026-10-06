import { useEffect, useState } from "react";
import {
  ArrowRight,
  BusFront,
  CalendarDays,
  History,
  Ticket
} from "lucide-react";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import { getCompletedRides } from "../../lib/rideHistory";
import "../../styles/RideHistory.css";

const demoRides = [
  {
    id: "DEMO-001",
    from: "Pune",
    to: "Mumbai",
    serviceType: "Ordinary",
    date: "22 Sep, 2021",
    time: "08:30 AM",
    fare: "₹450",
    status: "Completed"
  },
  {
    id: "DEMO-002",
    from: "Central Station",
    to: "Airport",
    serviceType: "AC",
    date: "20 Sep, 2021",
    time: "02:15 PM",
    fare: "₹120",
    status: "Completed"
  }
];

const RideHistory = () => {
  const [completedRides, setCompletedRides] = useState([]);

  useEffect(() => {
    const loadRides = () => {
      setCompletedRides(getCompletedRides());
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

  const rides = [...completedRides, ...demoRides];

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

        <main className="passenger-main-content-history">
          <div className="rides-list-container">
            {rides.map((ride) => (
              <article key={ride.id} className="ride-card">
                <div className="ride-card-top">
                  <div className="ride-route-group">
                    <span className="ride-city">{ride.from}</span>
                    <ArrowRight className="ride-arrow" aria-hidden="true" />
                    <span className="ride-city">{ride.to}</span>
                  </div>

                  <span className="ride-status completed">
                    {ride.status}
                  </span>
                </div>

                <div className="ride-card-details">
                  <div className="detail-item">
                    <BusFront aria-hidden="true" />
                    <span>{ride.serviceType} bus</span>
                  </div>

                  <div className="detail-item">
                    <CalendarDays aria-hidden="true" />
                    <span>
                      {ride.date} · {ride.time}
                    </span>
                  </div>
                </div>

                <div className="ride-card-footer">
                  <span className="ride-id">
                    {ride.id.startsWith("DEMO")
                      ? "Demo journey"
                      : ride.id}
                  </span>

                  <span className="ride-fare">
                    <Ticket aria-hidden="true" />
                    {ride.fare}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </main>

        <PassengerBottomNav />
      </section>
    </main>
  );
};

export default RideHistory;