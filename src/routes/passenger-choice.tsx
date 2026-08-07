import { createFileRoute } from "@tanstack/react-router";
import PassengerChoice from "../pages/common/PassengerChoice";

export const Route = createFileRoute("/passenger-choice")({
  head: () => ({
    meta: [
      { title: "PassengerChoice | Bussinn" },
      { name: "description", content: "Bussinn transit app — PassengerChoice screen." },
      { property: "og:title", content: "PassengerChoice | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — PassengerChoice screen." },
    ],
  }),
  component: PassengerChoice,
});
