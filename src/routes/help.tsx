import { createFileRoute } from "@tanstack/react-router";
import Help from "../pages/common/Help";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help | Bussinn" },
      { name: "description", content: "Bussinn transit app — Help screen." },
      { property: "og:title", content: "Help | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — Help screen." },
    ],
  }),
  component: Help,
});
