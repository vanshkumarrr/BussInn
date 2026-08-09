import type { GPSPoint } from "./types";

/**
 * Returns true if latitude and longitude are valid.
 */
export function isValidCoordinate(point: GPSPoint): boolean {
  return (
    point.latitude >= -90 &&
    point.latitude <= 90 &&
    point.longitude >= -180 &&
    point.longitude <= 180
  );
}

/**
 * Calculates the distance between two GPS points in meters
 * using the Haversine Formula.
 */
export function calculateDistance(
  pointA: GPSPoint,
  pointB: GPSPoint
): number {
  const EARTH_RADIUS = 6371000;

  const toRadians = (degree: number) => (degree * Math.PI) / 180;

  const lat1 = toRadians(pointA.latitude);
  const lat2 = toRadians(pointB.latitude);

  const deltaLat = toRadians(pointB.latitude - pointA.latitude);
  const deltaLon = toRadians(pointB.longitude - pointA.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}