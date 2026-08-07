import { createFileRoute } from "@tanstack/react-router";
import Page from "../pages/admin/AdminOverview";

export const Route = createFileRoute("/admin/overview")({
  head: () => ({
    meta: [
      { title: "Admin overview | BussInn" },
      { name: "description", content: "Manage every bus listed in the BussInn app." },
      { property: "og:title", content: "Admin overview | BussInn" },
      { property: "og:description", content: "Manage every bus listed in the BussInn app." },
    ],
  }),
  component: Page,
});
