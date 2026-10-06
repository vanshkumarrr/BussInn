import { createFileRoute } from "@tanstack/react-router";
import Welcome from "../pages/common/Welcome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Welcome | Bussinn" },
      { name: "description", content: "Bussinn transit app — Welcome screen." },
      { property: "og:title", content: "Welcome | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — Welcome screen." },
    ],
  }),
  component: Welcome,
});
