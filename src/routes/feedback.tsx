import { createFileRoute } from "@tanstack/react-router";
import Feedback from "../pages/common/Feedback";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Feedback | Bussinn" },
      { name: "description", content: "Bussinn transit app — Feedback screen." },
      { property: "og:title", content: "Feedback | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — Feedback screen." },
    ],
  }),
  component: Feedback,
});
