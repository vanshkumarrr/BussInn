import { createFileRoute } from "@tanstack/react-router";
import PassengerSearch from "../pages/passenger/PassengerSearch";

export const Route = createFileRoute("/passenger/search")({
  head: () => ({
    meta: [
      { title: "PassengerSearch | Bussinn" },
      { name: "description", content: "Bussinn transit app — PassengerSearch screen." },
      { property: "og:title", content: "PassengerSearch | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — PassengerSearch screen." },
    ],
  }),
  component: PassengerSearch,
});
