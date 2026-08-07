import { createFileRoute } from "@tanstack/react-router";
import Rewards from "../pages/passenger/Rewards";

export const Route = createFileRoute("/passenger/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards | Bussinn" },
      { name: "description", content: "Bussinn transit app — Rewards screen." },
      { property: "og:title", content: "Rewards | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — Rewards screen." },
    ],
  }),
  component: Rewards,
});
