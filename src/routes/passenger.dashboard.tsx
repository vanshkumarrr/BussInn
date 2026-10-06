import { createFileRoute } from "@tanstack/react-router";
import PassengerDashboard from "../pages/passenger/PassengerDashboard";

export const Route = createFileRoute("/passenger/dashboard")({
  head: () => ({
    meta: [
      { title: "PassengerDashboard | Bussinn" },
      { name: "description", content: "Bussinn transit app — PassengerDashboard screen." },
      { property: "og:title", content: "PassengerDashboard | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — PassengerDashboard screen." },
    ],
  }),
  component: PassengerDashboard,
});
