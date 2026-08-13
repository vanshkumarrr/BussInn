/**
 * Schedule Service
 *
 * Currently derives schedule information from local bus data.
 * Later this will fetch schedules/trips from Supabase.
 */

import { getBuses } from "../lib/store";
import { createSchedule } from "../models/scheduleModel";

export async function fetchSchedules() {
  const buses = getBuses();

  return buses.map((bus) =>
    createSchedule({
      id: `${bus.id}-schedule`,
      busId: bus.id,
      routeId: bus.id,
      departureTime: bus.departTime || bus.startTime || "",
      arrivalTime: bus.arriveTime || bus.arrivalTime || "",
      operatingDays: bus.operatingDays || [],
      status: bus.status || "ACTIVE",
    })
  );
}

export async function fetchScheduleByBus(busId) {
  const schedules = await fetchSchedules();

  return schedules.find((schedule) => schedule.busId === busId) || null;
}