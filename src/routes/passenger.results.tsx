import { createFileRoute } from "@tanstack/react-router";
import LiveBusResults from "../pages/passenger/LiveBusResults";

export const Route = createFileRoute("/passenger/results")({
  head: () => ({
    meta: [
      { title: "LiveBusResults | Bussinn" },
      { name: "description", content: "Bussinn transit app — LiveBusResults screen." },
      { property: "og:title", content: "LiveBusResults | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — LiveBusResults screen." },
    ],
  }),
  component: LiveBusResults,
});
