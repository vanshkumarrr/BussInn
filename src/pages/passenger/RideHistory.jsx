import { useState } from "react";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/RideHistory.css";

const RideHistory = () => {
  // Placeholder mock data for past and active rides
  // This will be replaced or populated when you hook up your backend API later
  const [rides] = useState([
    {
      id: "RIDE-8492",
      from: "Pune",
      to: "Mumbai",
      busNo: "MH-12-AB-5678",
      date: "22 Sep, 2021",
      time: "08:30 AM",
      fare: "₹450",
      status: "Completed"
    },
    {
      id: "RIDE-7321",
      from: "Central Station",
      to: "Airport",
      busNo: "MH-14-XY-9012",
      date: "20 Sep, 2021",
      time: "02:15 PM",
      fare: "₹120",
      status: "Completed"
    },
    {
      id: "RIDE-5510",
      from: "Swargate",
      to: "Hinjawadi",
      busNo: "MH-12-Q-3341",
      date: "15 Sep, 2021",
      time: "09:00 AM",
      fare: "₹65",
      status: "Cancelled"
    }
  ]);

  return (
    <div className="passenger-choice-page">
      <div className="app-content">
        
        {/* Header Section */}
        <header className="passenger-header-history">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">Ride History</h1>
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm text-white">
              <span className="material-symbols-outlined text-xl">history</span>
              <span className="font-semibold text-sm">BussInn</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="passenger-main-content-history">
          <div className="rides-list-container">
            {rides.length === 0 ? (
              <div className="text-center py-10">
                <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">directions_bus</span>
                <p className="text-gray-500 font-medium">No ride history found.</p>
              </div>
            ) : (
              rides.map((ride) => (
                <div key={ride.id} className="ride-card">
                  <div className="ride-card-top">
                    <div className="ride-route-group">
                      <span className="ride-city">{ride.from}</span>
                      <span className="material-symbols-outlined ride-arrow">arrow_forward</span>
                      <span className="ride-city">{ride.to}</span>
                    </div>
                    <span className={`ride-status ${ride.status.toLowerCase()}`}>
                      {ride.status}
                    </span>
                  </div>

                  <div className="ride-card-details">
                    <div className="detail-item">
                      <span className="material-symbols-outlined">directions_bus</span>
                      <span>Bus: {ride.busNo}</span>
                    </div>
                    <div className="detail-item">
                      <span className="material-symbols-outlined">calendar_month</span>
                      <span>{ride.date} • {ride.time}</span>
                    </div>
                  </div>

                  <div className="ride-card-footer">
                    <span className="ride-id">{ride.id}</span>
                    <span className="ride-fare">{ride.fare}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Bottom Navigation Bar */}
        <PassengerBottomNav />

      </div>
    </div>
  );
};

export default RideHistory;