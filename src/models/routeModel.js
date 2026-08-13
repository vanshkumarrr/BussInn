/**
 * Route data model.
 *
 * A route contains an ordered list of stops.
 * This structure is designed to match the future
 * Supabase `routes` and `route_stops` tables.
 */

export function createRoute({
  id,
  routeName,
  stops = [],
}) {
  return {
    id,
    routeName,
    stops: stops.map((stop, index) => ({
      id: stop.id || `${id}-stop-${index + 1}`,
      routeId: id,
      stopName: stop.stopName || stop.name || "",
      latitude: Number(stop.latitude) || 0,
      longitude: Number(stop.longitude) || 0,
      stopOrder: Number(stop.stopOrder) || index + 1,
    })),
  };
}

export function validateRoute(route) {
  if (!route || !route.id || !route.routeName) {
    return false;
  }

  if (!Array.isArray(route.stops) || route.stops.length === 0) {
    return false;
  }

  return route.stops.every(
    (stop) =>
      stop.stopName &&
      Number.isFinite(stop.latitude) &&
      Number.isFinite(stop.longitude) &&
      Number.isInteger(stop.stopOrder)
  );
}