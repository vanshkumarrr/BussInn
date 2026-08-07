import { createFileRoute } from "@tanstack/react-router";
import Page from "../pages/admin/AddRoute";

export const Route = createFileRoute("/admin/add-route")({
  head: () => ({
    meta: [
      { title: "Add route | BussInn" },
      { name: "description", content: "Create and edit stops for BussInn bus routes." },
      { property: "og:title", content: "Add route | BussInn" },
      { property: "og:description", content: "Create and edit stops for BussInn bus routes." },
    ],
  }),
  component: Page,
});
