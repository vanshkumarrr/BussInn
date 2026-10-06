import type { GPSPoint } from "./types";

/**
 * Calculates the total distance travelled by a passenger
 * using the recorded GPS history.
 */

import { calculateDistance } from "./geoUtils";

export function calculateTravelDistance(history: GPSPoint[]): number {
  if (history.length < 2) return 0;

  let total = 0;

  for (let i = 1; i < history.length; i++) {
    total += calculateDistance(history[i - 1]!, history[i]!);
  }

  return total;
}