import { createFileRoute } from "@tanstack/react-router";
import RideDetails from "../pages/passenger/RideDetails";

export const Route = createFileRoute("/passenger/ride/$rideId")({
  head: () => ({
    meta: [
      { title: "RideDetails | Bussinn" },
      { name: "description", content: "Bussinn transit app — RideDetails screen." },
      { property: "og:title", content: "RideDetails | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — RideDetails screen." },
    ],
  }),
  component: RideDetails,
});
