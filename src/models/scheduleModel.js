/**
 * Schedule / Trip data model.
 *
 * Represents a scheduled bus journey on a route.
 * Designed to map cleanly to the future Supabase schedule/trip table.
 */

export function createSchedule({
  id,
  busId,
  routeId,
  departureTime,
  arrivalTime,
  operatingDays = [],
  status = "ACTIVE",
}) {
  return {
    id,
    busId,
    routeId,
    departureTime,
    arrivalTime,
    operatingDays: Array.isArray(operatingDays)
      ? operatingDays
      : [],
    status,
  };
}

export function validateSchedule(schedule) {
  if (!schedule || !schedule.id) {
    return false;
  }

  if (!schedule.busId || !schedule.routeId) {
    return false;
  }

  if (!schedule.departureTime || !schedule.arrivalTime) {
    return false;
  }

  if (!Array.isArray(schedule.operatingDays)) {
    return false;
  }

  if (!schedule.status) {
    return false;
  }

  return true;
}