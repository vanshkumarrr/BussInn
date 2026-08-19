// Local-storage backed data store.
// TODO: Replace every function here with real backend/database calls later.

import { supabase } from "./supabase";

const BUSES_KEY = "bussinn.buses";
const AUTH_KEY = "bussinn.auth";

export const ADMIN_EMAIL = "flawless4keditx@gmail.com";
export const ADMIN_PASSWORD = "BussInn@123";

const SEED_BUSES = [
  {
    id: "bus-1",
    name: "Bus 1",
    operator: "Bharat Benz A/C Seater /Sleeper (2+1)",
    rating: 4.8,
    reviews: 209,
    confidence: 95,
    distanceAway: "1.4 km away",
    departTime: "22:00",
    departStop: "Swargate",
    arriveTime: "05:15",
    arriveStop: "Andheri East",
    duration: "7h 15m",
    eta: "12 mins",
    price: 559,
    oldPrice: 699,
    live: true,
    accent: "#12b76a",
    stops: [
      { name: "Swargate", time: "22:00" },
      { name: "Katraj", time: "22:40" },
      { name: "Lonavala", time: "00:10" },
      { name: "Andheri East", time: "05:15" },
    ],
  },
  {
    id: "bus-2",
    name: "Bus 2",
  
    rating: 4.6,
    reviews: 128,
    confidence: 65,
    distanceAway: "5.6 km away",
    departTime: "23:15",
    departStop: "Katraj",
    arriveTime: "06:00",
    arriveStop: "Sion",
    duration: "6h 45m",
    eta: "45 mins",
    price: 649,
    oldPrice: null,
    live: true,
    accent: "#f79009",
    stops: [
      { name: "Katraj", time: "23:15" },
      { name: "Chandani Chowk", time: "23:50" },
      { name: "Panvel", time: "03:20" },
      { name: "Sion", time: "06:00" },
    ],
  },
];

const isBrowser = () => typeof window !== "undefined";


export async function getBuses() {
  const { data, error } = await supabase
    .from("buses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching buses:", error);
    return [];
  }

  return data || [];
}

function saveBuses(buses) {
  if (!isBrowser()) return;
  window.localStorage.setItem(BUSES_KEY, JSON.stringify(buses));
  window.dispatchEvent(new Event("bussinn:buses"));
}


export async function addBus(bus) {
  const { data, error } = await supabase
    .from("buses")
    .insert([
      {
        name: bus.name,
        operator: bus.operator,
        rating: bus.rating,
        reviews: 0,
        confidence: bus.confidence,
        price: bus.price,
        old_price: null,
        departure_time: bus.departTime,
        arrival_time: bus.arriveTime,
        live: bus.live,
        accent: bus.accent,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error adding bus:", error);
    throw error;
  }


  return data;
}

export async function updateBus(id, patch) {
  console.log("UPDATE ID:", id);
  console.log("UPDATE PATCH:", patch);

  const { data, error } = await supabase
    .from("buses")
    .update(patch)
    .eq("id", id)
    .select("*");

  console.log("SUPABASE UPDATE DATA:", data);
  console.log("SUPABASE UPDATE ERROR:", error);

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteBus(id) {
  console.log("Deleting bus:", id);

  const { data, error } = await supabase
    .from("buses")
    .delete()
    .eq("id", id);

  console.log("DELETE DATA:", data);
  console.log("DELETE ERROR:", error);

  if (error) {
    console.error("DELETE FAILED:", error);
    throw error;
  }

  return data;
}
export async function getBus(id) {
  const { data, error } = await supabase
    .from("buses")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching bus:", error);
    return null;
  }

  return data;
}

/* ---------- auth (local only) ---------- */

export function getSession() {
  if (!isBrowser()) return null;
  try {
    return JSON.parse(window.localStorage.getItem(AUTH_KEY) || "null");
  } catch {
    return null;
  }
}

export function signIn(email, password) {
  const isAdmin =
    email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
  const session = { email: email.trim(), role: isAdmin ? "admin" : "passenger" };
  if (isBrowser()) window.localStorage.setItem(AUTH_KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  if (isBrowser()) window.localStorage.removeItem(AUTH_KEY);
}
