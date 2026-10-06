import { createFileRoute } from "@tanstack/react-router";
import Page from "../pages/common/CreateAccount";

export const Route = createFileRoute("/create-account")({
  head: () => ({
    meta: [
      { title: "Create account | BussInn" },
      { name: "description", content: "Create a BussInn account to track buses and earn rewards." },
      { property: "og:title", content: "Create account | BussInn" },
      { property: "og:description", content: "Create a BussInn account to track buses and earn rewards." },
    ],
  }),
  component: Page,
});
