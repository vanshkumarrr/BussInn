import { createFileRoute } from "@tanstack/react-router";
import PassengerLiveTracking from "../pages/passenger/PassengerLiveTracking";

export const Route = createFileRoute("/passenger/live-tracking")({
  head: () => ({
    meta: [
      { title: "PassengerLiveTracking | Bussinn" },
      { name: "description", content: "Bussinn transit app — PassengerLiveTracking screen." },
      { property: "og:title", content: "PassengerLiveTracking | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — PassengerLiveTracking screen." },
    ],
  }),
  component: PassengerLiveTracking,
});
