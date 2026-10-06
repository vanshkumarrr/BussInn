import { createFileRoute } from "@tanstack/react-router";
import Page from "../pages/admin/EditRoute";

export const Route = createFileRoute("/admin/route/$busId")({
  head: () => ({
    meta: [
      { title: "Edit route | BussInn" },
      { name: "description", content: "Edit the stops of a BussInn bus route." },
      { property: "og:title", content: "Edit route | BussInn" },
      { property: "og:description", content: "Edit the stops of a BussInn bus route." },
    ],
  }),
  component: Page,
});
