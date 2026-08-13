/**
 * Route Service
 *
 * Currently returns route information from bus objects.
 * Later this will fetch routes from Supabase.
 */

import { getBuses } from "../lib/store";

export async function fetchRoutes() {
  const buses = getBuses();

  return buses.map((bus) => ({
    id: bus.id,
    routeName: `${bus.departStop} → ${bus.arriveStop}`,
    stops: bus.stops || [],
  }));
}

export async function fetchRouteByBus(busId) {
  const buses = getBuses();

  const bus = buses.find((b) => b.id === busId);

  if (!bus) return null;

  return {
    id: bus.id,
    routeName: `${bus.departStop} → ${bus.arriveStop}`,
    stops: bus.stops || [],
  };
}