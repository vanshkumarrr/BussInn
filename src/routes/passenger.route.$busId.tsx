import { createFileRoute } from "@tanstack/react-router";
import Page from "../pages/passenger/BusRoute";

export const Route = createFileRoute("/passenger/route/$busId")({
  head: () => ({
    meta: [
      { title: "Bus route | BussInn" },
      { name: "description", content: "See every stop on this BussInn bus route." },
      { property: "og:title", content: "Bus route | BussInn" },
      { property: "og:description", content: "See every stop on this BussInn bus route." },
    ],
  }),
  component: Page,
});
