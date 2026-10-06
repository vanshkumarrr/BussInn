import type { BusStop } from "./types";
import { isSameStop } from "./searchUtils";

/**
 * Returns true if a bus travels from the given source
 * stop to the given destination stop in the correct order.
 */
export function matchesRoute(
  stops: BusStop[],
  from: string,
  to: string
): boolean {
  const fromIndex = stops.findIndex((stop) =>
    isSameStop(stop.name, from)
  );

  const toIndex = stops.findIndex((stop) =>
    isSameStop(stop.name, to)
  );

  if (fromIndex === -1 || toIndex === -1) {
    return false;
  }

  return fromIndex < toIndex;
}