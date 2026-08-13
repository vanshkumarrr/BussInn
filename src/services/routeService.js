/**
 * Route Service
 *
 * Currently reads route information from local bus data.
 * Later this service will fetch routes and route_stops from Supabase.
 */

import { getBuses } from "../lib/store";
import { createRoute } from "../models/routeModel";

export async function fetchRoutes() {
  const buses = getBuses();

  return buses.map((bus) =>
    createRoute({
      id: bus.id,
      routeName: `${bus.departStop} → ${bus.arriveStop}`,
      stops: bus.stops || [],
    })
  );
}

export async function fetchRouteByBus(busId) {
  const buses = getBuses();
  const bus = buses.find((b) => b.id === busId);

  if (!bus) return null;

  return createRoute({
    id: bus.id,
    routeName: `${bus.departStop} → ${bus.arriveStop}`,
    stops: bus.stops || [],
  });
}