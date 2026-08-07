import { createFileRoute } from "@tanstack/react-router";
import Page from "../pages/admin/AddBus";

export const Route = createFileRoute("/admin/add-bus")({
  head: () => ({
    meta: [
      { title: "Add bus | BussInn" },
      { name: "description", content: "Add a new bus to the BussInn passenger listing." },
      { property: "og:title", content: "Add bus | BussInn" },
      { property: "og:description", content: "Add a new bus to the BussInn passenger listing." },
    ],
  }),
  component: Page,
});
