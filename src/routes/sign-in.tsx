import { createFileRoute } from "@tanstack/react-router";
import Page from "../pages/common/SignIn";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [
      { title: "Sign in | BussInn" },
      { name: "description", content: "Sign in to your BussInn account to track live buses." },
      { property: "og:title", content: "Sign in | BussInn" },
      { property: "og:description", content: "Sign in to your BussInn account to track live buses." },
    ],
  }),
  component: Page,
});
