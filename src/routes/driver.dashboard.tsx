import { createFileRoute } from "@tanstack/react-router";
import DriverDashboard from "../pages/driver/DriverDashboard";

export const Route = createFileRoute("/driver/dashboard")({
  head: () => ({
    meta: [
      { title: "DriverDashboard | Bussinn" },
      { name: "description", content: "Bussinn transit app — DriverDashboard screen." },
      { property: "og:title", content: "DriverDashboard | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — DriverDashboard screen." },
    ],
  }),
  component: DriverDashboard,
});
