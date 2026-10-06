import { createFileRoute } from "@tanstack/react-router";
import Login from "../pages/common/Login";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login | Bussinn" },
      { name: "description", content: "Bussinn transit app — Login screen." },
      { property: "og:title", content: "Login | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — Login screen." },
    ],
  }),
  component: Login,
});
