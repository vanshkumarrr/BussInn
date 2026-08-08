import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/RideDetails.css";

const RideDetails = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    busStartTime: "18:38",
    busEndTime: "",
    startLocation: "",
    endLocation: "",
    busDestination: ""
  });

  const [error, setError] = useState("");
  const [isLocating, setIsLocating] = useState(false);

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
    if (error) setError("");
  };

  const handleFetchLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await response.json();
          const address = data.address || {};
          const areaName = 
            address.suburb || 
            address.neighbourhood || 
            address.city_district || 
            address.town || 
            address.city || 
            address.state_district || 
            "Current Area";

          setFormData(prev => ({ ...prev, startLocation: areaName }));
        } catch (err) {
          console.error("Geocoding error:", err);
          setFormData(prev => ({ ...prev, startLocation: "Current Location" }));
        } finally {
          setIsLocating(false);
          if (error) setError("");
        }
      },
      (err) => {
        console.error(err);
        alert("Unable to retrieve your location.");
        setIsLocating(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleStartTracking = (e) => {
    e.preventDefault();

    if (
      !formData.busStartTime.trim() ||
      !formData.busEndTime.trim() ||
      !formData.startLocation.trim() ||
      !formData.endLocation.trim() ||
      !formData.busDestination.trim()
    ) {
      setError("Please fill in all fields before starting tracking.");
      return;
    }

    // Save ride details including drop point to localStorage
    localStorage.setItem("active_ride_details", JSON.stringify(formData));
    navigate({ to: "/passenger/live-tracking" });
  };

  return (
    <div className="page mobile-page-container">
      <div className="app-content ride-details-layout">
        
        <header className="dash-header">
          <Link to="/passenger/search" className="back-arrow-btn" title="Back">
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
          <h1 className="dash-logo">BussInn</h1>
          <button className="btn-lang-pill" type="button">
            <span className="material-symbols-outlined text-sm">translate</span>
          </button>
        </header>

        <div className="ride-details-header-text">
          <p>Help us track your bus accurately.</p>
        </div>

        <form className="ride-details-form" onSubmit={handleStartTracking}>
          
          <div className="input-card-field">
            <label className="field-label-mini">Bus Start Time</label>
            <div className="field-input-row">
              <input
                type="time"
                value={formData.busStartTime}
                onChange={handleChange("busStartTime")}
                className="transparent-input"
                required
              />
              <span className="material-symbols-outlined text-gray-400">schedule</span>
            </div>
          </div>

          <div className="input-card-field">
            <label className="field-label-mini">Bus End Time</label>
            <div className="field-input-row">
              <input
                type="time"
                value={formData.busEndTime}
                onChange={handleChange("busEndTime")}
                className="transparent-input"
                required
              />
              <span className="material-symbols-outlined text-gray-400">schedule</span>
            </div>
          </div>

          <div className="input-card-field">
            <label className="field-label-mini">Start Location</label>
            <div className="field-input-row">
              <input
                type="text"
                placeholder={isLocating ? "Detecting area..." : "Tap icon for current area"}
                value={formData.startLocation}
                onChange={handleChange("startLocation")}
                className="transparent-input"
                required
              />
              <button 
                type="button" 
                onClick={handleFetchLiveLocation} 
                className="location-target-btn cursor-pointer bg-transparent border-none p-0 flex items-center"
              >
                <span className="material-symbols-outlined text-blue-600">my_location</span>
              </button>
            </div>
          </div>

          <div className="input-card-field">
            <label className="field-label-mini">End Location (Drop Point)</label>
            <div className="field-input-row">
              <input
                type="text"
                placeholder="Enter drop location"
                value={formData.endLocation}
                onChange={handleChange("endLocation")}
                className="transparent-input"
                required
              />
              <span className="material-symbols-outlined text-gray-400">map</span>
            </div>
          </div>

          <div className="input-card-field">
            <label className="field-label-mini">Bus Destination</label>
            <div className="field-input-row">
              <input
                type="text"
                placeholder="Bus Destination (you can ask from driver)"
                value={formData.busDestination}
                onChange={handleChange("busDestination")}
                className="transparent-input"
                required
              />
              <span className="material-symbols-outlined text-gray-400">near_me</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="ride-details-footer-action">
            <button type="submit" className="btn-start-tracking cursor-pointer">
              <span className="material-symbols-outlined">directions_bus</span>
              Start Tracking
            </button>
          </div>

        </form>

       

      </div>
    </div>
  );
};

export default RideDetails;