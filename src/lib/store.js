// Supabase-backed data store.

import { supabase } from "./supabase";

const BUSES_KEY = "bussinn.buses";
const AUTH_KEY = "bussinn.auth";

export const ADMIN_EMAIL = "flawless4keditx@gmail.com";
export const ADMIN_PASSWORD = "BussInn@123";

const isBrowser = () => typeof window !== "undefined";

/* ---------- buses + routes ---------- */

export async function getBuses() {
  const { data: buses, error } = await supabase
    .from("buses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching buses:", error);
    return [];
  }

  if (!buses || buses.length === 0) {
    return [];
  }

  const routeIds = buses
    .map((bus) => bus.route_id)
    .filter(Boolean);

  if (routeIds.length === 0) {
    return buses.map((bus) => ({
      ...bus,
      stops: [],
      routeStops: [],
      departStop: "",
      arriveStop: "",
    }));
  }

  const { data: routeStops, error: routeStopsError } = await supabase
    .from("route_stops")
    .select("*")
    .in("route_id", routeIds)
    .order("stop_order", { ascending: true });

  if (routeStopsError) {
    console.error("Error fetching route stops:", routeStopsError);

    return buses.map((bus) => ({
      ...bus,
      stops: [],
      routeStops: [],
      departStop: "",
      arriveStop: "",
    }));
  }

  const stopIds = [
    ...new Set(
      (routeStops || [])
        .map((routeStop) => routeStop.stop_id)
        .filter(Boolean)
    ),
  ];

  let stops = [];

  if (stopIds.length > 0) {
    const { data: stopData, error: stopsError } = await supabase
      .from("stops")
      .select("*")
      .in("id", stopIds);

    if (stopsError) {
      console.error("Error fetching stops:", stopsError);
    } else {
      stops = stopData || [];
    }
  }

  return buses.map((bus) => {
    const busRouteStops = (routeStops || [])
      .filter(
        (routeStop) => routeStop.route_id === bus.route_id
      )
      .sort(
        (a, b) => a.stop_order - b.stop_order
      );

    const completeStops = busRouteStops.map(
      (routeStop) => {
        const stop = stops.find(
          (s) => s.id === routeStop.stop_id
        );

        return {
          id:
            stop?.id ||
            routeStop.stop_id,

          name:
            stop?.name || "",

          latitude:
            stop?.latitude || 0,

          longitude:
            stop?.longitude || 0,

          time:
            routeStop.departure_time ||
            routeStop.arrival_time ||
            "",

          arrivalTime:
            routeStop.arrival_time || "",

          departureTime:
            routeStop.departure_time || "",

          stopOrder:
            routeStop.stop_order,
        };
      }
    );

    return {
      ...bus,

      stops: completeStops,

      routeStops: completeStops,

      departStop:
        completeStops[0]?.name || "",

      arriveStop:
        completeStops[
          completeStops.length - 1
        ]?.name || "",
    };
  });
}

/* ---------- add bus ---------- */

export async function addBus(bus) {
  // 1. Create route
  const { data: route, error: routeError } =
    await supabase
      .from("routes")
      .insert([
        {
          name: `${bus.departStop} → ${bus.arriveStop}`,
        },
      ])
      .select()
      .single();

  if (routeError) {
    console.error(
      "Error creating route:",
      routeError
    );

    throw routeError;
  }

  // 2. Create bus and attach route
  const { data: newBus, error: busError } =
    await supabase
      .from("buses")
      .insert([
        {
          name: bus.name,
          operator: bus.operator,
          route_id: route.id,

          rating:
            Number(bus.rating) || 0,

          reviews: 0,

          confidence:
            Number(bus.confidence) || 0,

          price:
            Number(bus.price) || 0,

          old_price: null,

          departure_time:
            bus.departTime,

          arrival_time:
            bus.arriveTime,

          live:
            bus.live,

          accent:
            bus.accent,
        },
      ])
      .select()
      .single();

  if (busError) {
    console.error(
      "Error adding bus:",
      busError
    );

    throw busError;
  }

  // 3. Create stops
  const stops = bus.stops || [
    {
      name: bus.departStop,
      time: bus.departTime,
    },
    {
      name: bus.arriveStop,
      time: bus.arriveTime,
    },
  ];

  const createdStops = [];

  for (
    let i = 0;
    i < stops.length;
    i++
  ) {
    const stop = stops[i];

    const {
      data: newStop,
      error: stopError,
    } = await supabase
      .from("stops")
      .insert([
        {
          name:
            stop.name,

          latitude:
            Number(stop.latitude) || 0,

          longitude:
            Number(stop.longitude) || 0,
        },
      ])
      .select()
      .single();

    if (stopError) {
      console.error(
        "Error creating stop:",
        stopError
      );

      throw stopError;
    }

    createdStops.push(newStop);

    // 4. Connect stop to route
    const {
      error: routeStopError,
    } = await supabase
      .from("route_stops")
      .insert([
        {
          route_id:
            route.id,

          stop_id:
            newStop.id,

          stop_order:
            i + 1,

          arrival_time:
            stop.arrivalTime ||
            stop.time ||
            null,

          departure_time:
            stop.departureTime ||
            stop.time ||
            null,
        },
      ]);

    if (routeStopError) {
      console.error(
        "Error creating route stop:",
        routeStopError
      );

      throw routeStopError;
    }
  }

  return {
    ...newBus,

    route_id:
      route.id,

    stops:
      createdStops,
  };
}

/* ---------- update bus ---------- */

export async function updateBus(
  id,
  patch
) {
  console.log(
    "UPDATE ID:",
    id
  );

  console.log(
    "UPDATE PATCH:",
    patch
  );

  const {
    data,
    error,
  } = await supabase
    .from("buses")
    .update(patch)
    .eq("id", id)
    .select("*");

  console.log(
    "SUPABASE UPDATE DATA:",
    data
  );

  console.log(
    "SUPABASE UPDATE ERROR:",
    error
  );

  if (error) {
    throw error;
  }

  return data;
}

/* ---------- delete bus ---------- */

export async function deleteBus(
  id
) {
  console.log(
    "Deleting bus:",
    id
  );

  const {
    data,
    error,
  } = await supabase
    .from("buses")
    .delete()
    .eq("id", id);

  console.log(
    "DELETE DATA:",
    data
  );

  console.log(
    "DELETE ERROR:",
    error
  );

  if (error) {
    console.error(
      "DELETE FAILED:",
      error
    );

    throw error;
  }

  return data;
}

/* ---------- get one bus ---------- */

export async function getBus(
  id
) {
  const {
    data,
    error,
  } = await supabase
    .from("buses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(
      "Error fetching bus:",
      error
    );

    return null;
  }

  return data;
}

/* ---------- local storage helpers ---------- */

function saveBuses(buses) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(
    BUSES_KEY,
    JSON.stringify(buses)
  );

  window.dispatchEvent(
    new Event("bussinn:buses")
  );
}

/* ---------- local auth compatibility ---------- */

export function getSession() {
  if (!isBrowser()) {
    return null;
  }

  try {
    return JSON.parse(
      window.localStorage.getItem(
        AUTH_KEY
      ) || "null"
    );
  } catch {
    return null;
  }
}

export function signIn(
  email,
  password
) {
  const isAdmin =
    email
      .trim()
      .toLowerCase() ===
      ADMIN_EMAIL &&
    password ===
      ADMIN_PASSWORD;

  const session = {
    email:
      email.trim(),

    role:
      isAdmin
        ? "admin"
        : "passenger",
  };

  if (isBrowser()) {
    window.localStorage.setItem(
      AUTH_KEY,
      JSON.stringify(session)
    );
  }

  return session;
}

export function signOut() {
  if (isBrowser()) {
    window.localStorage.removeItem(
      AUTH_KEY
    );
  }
}