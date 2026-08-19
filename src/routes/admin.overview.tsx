import { createFileRoute, redirect } from "@tanstack/react-router";
import Page from "../pages/admin/AdminOverview";

export const Route = createFileRoute("/admin/overview")({
  beforeLoad: () => {
    // Check if we are running in the browser before using localStorage
    if (typeof window !== "undefined") {
      const role = localStorage.getItem("bussinn_role");
      
      if (role !== "admin") {
        throw redirect({
          to: "/login",
        });
      }
    }
  },
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