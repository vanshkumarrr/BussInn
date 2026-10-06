import { createFileRoute } from "@tanstack/react-router";
import DriverRecentTrips from "../pages/driver/DriverRecentTrips";

export const Route = createFileRoute("/driver/recent-trips")({
  head: () => ({
    meta: [
      { title: "DriverRecentTrips | Bussinn" },
      { name: "description", content: "Bussinn transit app — DriverRecentTrips screen." },
      { property: "og:title", content: "DriverRecentTrips | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — DriverRecentTrips screen." },
    ],
  }),
  component: DriverRecentTrips,
});
