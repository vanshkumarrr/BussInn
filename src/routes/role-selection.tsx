import { createFileRoute } from "@tanstack/react-router";
import RoleSelection from "../pages/common/RoleSelection";

export const Route = createFileRoute("/role-selection")({
  head: () => ({
    meta: [
      { title: "RoleSelection | Bussinn" },
      { name: "description", content: "Bussinn transit app — RoleSelection screen." },
      { property: "og:title", content: "RoleSelection | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — RoleSelection screen." },
    ],
  }),
  component: RoleSelection,
});
