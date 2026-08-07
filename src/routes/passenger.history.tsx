import { createFileRoute } from "@tanstack/react-router";
import RideHistory from "../pages/passenger/RideHistory";

export const Route = createFileRoute("/passenger/history")({
  head: () => ({
    meta: [
      { title: "RideHistory | Bussinn" },
      { name: "description", content: "Bussinn transit app — RideHistory screen." },
      { property: "og:title", content: "RideHistory | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — RideHistory screen." },
    ],
  }),
  component: RideHistory,
});
