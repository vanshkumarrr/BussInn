import { createFileRoute } from "@tanstack/react-router";
import NotFound from "../pages/common/NotFound";

export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: "NotFound | Bussinn" },
      { name: "description", content: "Bussinn transit app — NotFound screen." },
      { property: "og:title", content: "NotFound | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — NotFound screen." },
    ],
  }),
  component: NotFound,
});
