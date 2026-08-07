import { createFileRoute } from "@tanstack/react-router";
import DriverLiveTracking from "../pages/driver/DriverLiveTracking";

export const Route = createFileRoute("/driver/live-tracking")({
  head: () => ({
    meta: [
      { title: "DriverLiveTracking | Bussinn" },
      { name: "description", content: "Bussinn transit app — DriverLiveTracking screen." },
      { property: "og:title", content: "DriverLiveTracking | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — DriverLiveTracking screen." },
    ],
  }),
  component: DriverLiveTracking,
});
