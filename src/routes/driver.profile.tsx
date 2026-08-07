import { createFileRoute } from "@tanstack/react-router";
import DriverProfile from "../pages/driver/DriverProfile";

export const Route = createFileRoute("/driver/profile")({
  head: () => ({
    meta: [
      { title: "DriverProfile | Bussinn" },
      { name: "description", content: "Bussinn transit app — DriverProfile screen." },
      { property: "og:title", content: "DriverProfile | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — DriverProfile screen." },
    ],
  }),
  component: DriverProfile,
});
