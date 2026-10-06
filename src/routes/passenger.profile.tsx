import { createFileRoute } from "@tanstack/react-router";
import PassengerProfile from "../pages/passenger/PassengerProfile";

export const Route = createFileRoute("/passenger/profile")({
  head: () => ({
    meta: [
      { title: "PassengerProfile | Bussinn" },
      { name: "description", content: "Bussinn transit app — PassengerProfile screen." },
      { property: "og:title", content: "PassengerProfile | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — PassengerProfile screen." },
    ],
  }),
  component: PassengerProfile,
});
