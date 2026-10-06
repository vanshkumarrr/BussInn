import { calculateDistance } from "./geoUtils";
import type { BusRoute, GPSPoint } from "./types";

/**
 * Returns a score between 0 and 100.
 * Higher score means passenger is closer to the route.
 */
export function calculateRouteDistanceScore(
  passenger: GPSPoint,
  route: BusRoute
): number {
  let shortestDistance = Number.POSITIVE_INFINITY;

  for (const stop of route.stops) {
    const distance = calculateDistance(passenger, {
      latitude: stop.latitude,
      longitude: stop.longitude,
      timestamp: passenger.timestamp,
    });

    shortestDistance = Math.min(shortestDistance, distance);
  }

  if (shortestDistance <= 50) return 100;
  if (shortestDistance <= 100) return 90;
  if (shortestDistance <= 250) return 75;
  if (shortestDistance <= 500) return 60;
  if (shortestDistance <= 1000) return 40;

  return 0;
}