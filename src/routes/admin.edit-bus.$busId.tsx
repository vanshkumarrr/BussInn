import { createFileRoute } from "@tanstack/react-router";
import Page from "../pages/admin/EditBus";

export const Route = createFileRoute("/admin/edit-bus/$busId")({
  head: () => ({
    meta: [
      { title: "Edit bus | BussInn" },
      { name: "description", content: "Edit the details of a listed BussInn bus." },
      { property: "og:title", content: "Edit bus | BussInn" },
      { property: "og:description", content: "Edit the details of a listed BussInn bus." },
    ],
  }),
  component: Page,
});
