const STORAGE_KEY = "bussinn_completed_rides";

export const getCompletedRides = () => {
  try {
    const savedRides = localStorage.getItem(STORAGE_KEY);
    return savedRides ? JSON.parse(savedRides) : [];
  } catch {
    return [];
  }
};

export const saveCompletedRide = (ride) => {
  const existingRides = getCompletedRides();

  const completedRide = {
    id: `RIDE-${Date.now()}`,
    from: ride.from,
    to: ride.to,
    serviceType: ride.serviceType || "Ordinary",
    date: ride.date,
    time: ride.time,
    fare: ride.fare || "₹0",
    status: "Completed",
    completedAt: new Date().toISOString()
  };

  const updatedRides = [completedRide, ...existingRides];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRides));

  window.dispatchEvent(
    new CustomEvent("bussinn-ride-history-updated")
  );

  return completedRide;
};