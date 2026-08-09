import { calculateDistance } from "./geoUtils";
import type { BusRoute, GPSPoint } from "./types";

export function findNearestRoute(
  passengerLocation: GPSPoint,
  routes: BusRoute[]
): BusRoute | null {
  let nearestRoute: BusRoute | null = null;
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (const route of routes) {
    for (const stop of route.stops) {
      const distance = calculateDistance(passengerLocation, {
        latitude: stop.latitude,
        longitude: stop.longitude,
        timestamp: passengerLocation.timestamp,
      });

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestRoute = route;
      }
    }
  }

  return nearestRoute;
}