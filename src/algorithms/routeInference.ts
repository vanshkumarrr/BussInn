import type { GPSPoint, BusRoute } from "./types";
import { calculateTravelDistance } from "./movement";

export interface RouteResult {
  routeId: string;
  score: number;
}

export function inferBestRoute(
  history: GPSPoint[],
  routes: BusRoute[]
): RouteResult | null {
  if (history.length < 2 || routes.length === 0) {
    return null;
  }

  const travelDistance = calculateTravelDistance(history);

  let bestRoute: RouteResult | null = null;

  for (const route of routes) {
    const score = Math.min(travelDistance / 1000, 100);

    if (!bestRoute || score > bestRoute.score) {
      bestRoute = {
        routeId: route.id,
        score,
      };
    }
  }

  return bestRoute;
}