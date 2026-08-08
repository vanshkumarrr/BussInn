import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import PassengerBottomNav from "../../components/PassengerBottomNav";
import "../../styles/PassengerSearch.css";

// Formats a Date object into "Wed, 22 Sep" style string
const formatDisplayDate = (d) => {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
};

// Formats a Date object into "YYYY-MM-DD" for the native date input value
const formatInputDate = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const PassengerSearch = () => {
  const navigate = useNavigate();
  const [from, setFrom] = useState("Pune");
  const [to, setTo] = useState("Mumbai");

  // Keep the actual Date object as source of truth, derive the display string from it
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [date, setDate] = useState(formatDisplayDate(new Date()));

  const dateInputRef = useRef(null);

  // Swap from and to locations
  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  // Opens the native date picker when the calendar icon or date text is clicked
  const openDatePicker = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === "function") {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  };

  // Fired when the user picks a date from the native picker
  const handleDateInputChange = (e) => {
    if (!e.target.value) return;
    const [year, month, day] = e.target.value.split("-").map(Number);
    const newDate = new Date(year, month - 1, day);
    setSelectedDate(newDate);
    setDate(formatDisplayDate(newDate));
  };

  const handleSetToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setDate(formatDisplayDate(today));
  };

  const handleSetTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow);
    setDate(formatDisplayDate(tomorrow));
  };

  // Handle Search Execution
  const handleSearch = (e) => {
    e.preventDefault();
    if (!from.trim() || !to.trim()) return;

    // Navigate to results page
    navigate({ to: "/passenger/results" });
  };

  return (
    <div className="passenger-choice-page">
      <div className="app-content">
        
        {/* BEGIN: Header Section */}
        <header className="passenger-header-search">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white">Find Your Ride</h1>
            <div className="flex items-center space-x-2 bg-white/20 px-3 py-1.5 rounded-full backdrop-blur-sm text-white">
              <span className="material-symbols-outlined text-xl">directions_bus</span>
              <span className="font-semibold text-sm">BussInn</span>
            </div>
          </div>
        </header>
        {/* END: Header Section */}

        {/* BEGIN: Search Form Section */}
        <main className="passenger-main-content-search">
          <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1 relative">
            <div className="flex flex-col relative">
              
              {/* From Field */}
              <div className="flex items-center px-4 py-4 border-b border-gray-100 group focus-within:bg-gray-50 transition-colors rounded-t-xl">
                <span className="material-symbols-outlined text-gray-400 text-xl mr-3">location_on</span>
                <div className="flex-1">
                  <label className="sr-only" htmlFor="from">From</label>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-gray-800 text-lg font-medium placeholder-gray-400 focus:ring-0 outline-none" 
                    id="from" 
                    type="text" 
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Leaving from..." 
                    required
                  />
                </div>
              </div>

              {/* Swap Button */}
              <button 
                type="button"
                onClick={handleSwap}
                className="absolute right-6 top-[3.25rem] transform -translate-y-1/2 bg-gray-800 text-white rounded-full p-2 shadow-md hover:bg-gray-700 transition-colors z-20 focus:outline-none flex items-center justify-center cursor-pointer"
                title="Swap locations"
              >
                <span className="material-symbols-outlined text-lg leading-none">swap_vert</span>
              </button>

              {/* To Field */}
              <div className="flex items-center px-4 py-4 border-b border-gray-100 group focus-within:bg-gray-50 transition-colors">
                <span className="material-symbols-outlined text-gray-400 text-xl mr-3">near_me</span>
                <div className="flex-1">
                  <label className="sr-only" htmlFor="to">To</label>
                  <input 
                    className="w-full bg-transparent border-none p-0 text-gray-800 text-lg font-medium placeholder-gray-400 focus:ring-0 outline-none" 
                    id="to" 
                    type="text" 
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Going to..." 
                    required
                  />
                </div>
              </div>

              {/* Date Field */}
              <div className="flex items-center px-4 py-4 border-b border-gray-100 relative">
                <span
                  className="material-symbols-outlined text-gray-400 text-xl mr-3 cursor-pointer"
                  onClick={openDatePicker}
                >
                  calendar_month
                </span>
                <div className="flex-1 flex justify-between items-center">
                  <span
                    className="text-gray-800 text-medium font-medium cursor-pointer"
                    onClick={openDatePicker}
                  >
                    {date}
                  </span>
                  <div className="flex space-x-3 text-sm font-bold text-primary">
                    <button type="button" onClick={handleSetToday} className="uppercase hover:text-blue-700 transition-colors focus:outline-none cursor-pointer">Today</button>
                    <button type="button" onClick={handleSetTomorrow} className="uppercase hover:text-blue-700 transition-colors focus:outline-none cursor-pointer">Tomorrow</button>
                  </div>
                </div>

                {/* Hidden native date input */}
                <input
                  ref={dateInputRef}
                  type="date"
                  className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                  value={formatInputDate(selectedDate)}
                  min={formatInputDate(new Date())}
                  onChange={handleDateInputChange}
                  tabIndex={-1}
                  aria-hidden="true"
                />
              </div>

              {/* Search Button */}
              <div className="p-4">
                <button 
                  type="submit"
                  className="w-full bg-[#0052CC] hover:bg-blue-700 text-white text-lg font-bold py-4 rounded-xl transition-colors shadow-lg shadow-blue-500/30 uppercase tracking-wide focus:outline-none cursor-pointer"
                >
                  Search
                </button>
              </div>

            </div>
          </form>

          {/* Are You Inside The Bus? Section */}
          <div className="mt-6 px-1 pb-24">
            <Link 
              to="/passenger/ride/$rideId" 
              className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 hover:shadow-md transition-all group cursor-pointer text-left"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mr-4 shadow-md group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-white text-2xl">directions_bus</span>
                </div>
                <div>
                  <h3 className="text-gray-900 font-bold text-base">Are you inside the bus?</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Track your live journey & share route details</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-blue-600 font-bold group-hover:translate-x-1 transition-transform">chevron_right</span>
            </Link>
          </div>

        </main>
        {/* END: Search Form Section */}

        {/* Bottom Navigation Bar */}
        <PassengerBottomNav />

      </div>
    </div>
  );
};

export default PassengerSearch;