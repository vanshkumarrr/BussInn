import { getBuses } from "../lib/store";

/**
 * Fetch all buses.
 * Currently reads from local storage.
 * Later this will fetch from Supabase.
 */
export async function fetchBuses() {
  return getBuses();
}