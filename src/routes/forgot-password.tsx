import { createFileRoute } from "@tanstack/react-router";
import Page from "../pages/common/ForgotPassword";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password | BussInn" },
      { name: "description", content: "Reset the password for your BussInn account." },
      { property: "og:title", content: "Forgot password | BussInn" },
      { property: "og:description", content: "Reset the password for your BussInn account." },
    ],
  }),
  component: Page,
});
