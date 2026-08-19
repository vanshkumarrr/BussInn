import { supabase } from "../lib/supabase";

export async function fetchRoutes() {
  const { data, error } = await supabase
    .from("routes")
    .select(`
      id,
      name,
      created_at,
      route_stops (
        id,
        route_id,
        stop_id,
        stop_order,
        arrival_time,
        departure_time,
        stops (
          id,
          name,
          latitude,
          longitude
        )
      )
    `)
    .order("name");

  if (error) {
    console.error("Error fetching routes:", error);
    return [];
  }

  return (data || []).map(normalizeRoute);
}

export async function fetchRouteByBus(busId) {
  // First find which route belongs to this bus.
  const { data: bus, error: busError } = await supabase
    .from("buses")
    .select("id, route_id")
    .eq("id", busId)
    .single();

  if (busError) {
    console.error("Error fetching bus route:", busError);
    return null;
  }

  if (!bus?.route_id) {
    console.warn("This bus does not have a route assigned.");
    return null;
  }

  // Then fetch the route and its ordered stops.
  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select(`
      id,
      name,
      created_at,
      route_stops (
        id,
        route_id,
        stop_id,
        stop_order,
        arrival_time,
        departure_time,
        stops (
          id,
          name,
          latitude,
          longitude
        )
      )
    `)
    .eq("id", bus.route_id)
    .single();

  if (routeError) {
    console.error("Error fetching route:", routeError);
    return null;
  }

  return normalizeRoute(route);
}

function normalizeRoute(route) {
  const routeStops = [...(route.route_stops || [])].sort(
    (a, b) => a.stop_order - b.stop_order
  );

  return {
    id: route.id,
    routeName: route.name,
    stops: routeStops.map((routeStop) => ({
      id: routeStop.stop_id,
      routeStopId: routeStop.id,
      routeId: routeStop.route_id,

      name: routeStop.stops?.name || "",
      originalName: routeStop.stops?.name || "",
      latitude: Number(routeStop.stops?.latitude) || 0,
      longitude: Number(routeStop.stops?.longitude) || 0,

      stopOrder: routeStop.stop_order,

      arrivalTime: routeStop.arrival_time || "",
      departureTime: routeStop.departure_time || "",

      time:
        routeStop.departure_time ||
        routeStop.arrival_time ||
        "",
    })),
  };
}

export async function saveRouteStops(routeId, stops) {
  // 1. Remove the old route-stop relationships
  const { error: deleteError } = await supabase
    .from("route_stops")
    .delete()
    .eq("route_id", routeId);

  if (deleteError) {
    console.error("Error deleting old route stops:", deleteError);
    throw deleteError;
  }

  const validStops = stops.filter(
    (stop) => stop.name && stop.name.trim()
  );

  if (validStops.length === 0) {
    return;
  }

  const rows = [];

  // 2. Update/create stops and rebuild route-stop relationships
  for (let index = 0; index < validStops.length; index++) {
    const stop = validStops[index];

    let stopId = stop.id;

    // Existing stop → UPDATE its name/location
    if (stopId) {
      const { error: updateStopError } = await supabase
        .from("stops")
        .update({
          name: stop.name.trim(),
          latitude: Number(stop.latitude) || 0,
          longitude: Number(stop.longitude) || 0,
        })
        .eq("id", stopId);

      if (updateStopError) {
        console.error("Error updating stop:", updateStopError);
        throw updateStopError;
      }
    }

    // New stop → CREATE it
    if (!stopId) {
      const { data: newStop, error: stopError } = await supabase
        .from("stops")
        .insert({
          name: stop.name.trim(),
          latitude: Number(stop.latitude) || 0,
          longitude: Number(stop.longitude) || 0,
        })
        .select("id")
        .single();

      if (stopError) {
        console.error("Error creating stop:", stopError);
        throw stopError;
      }

      stopId = newStop.id;
    }

    // 3. Recreate the route-stop relationship
    rows.push({
      route_id: routeId,
      stop_id: stopId,
      stop_order: index + 1,
      arrival_time: stop.arrivalTime || stop.time || null,
      departure_time: stop.departureTime || stop.time || null,
    });
  }

  // 4. Insert the new ordered route stops
  const { error: insertError } = await supabase
    .from("route_stops")
    .insert(rows);

  if (insertError) {
    console.error("Error saving route stops:", insertError);
    throw insertError;
  }
}