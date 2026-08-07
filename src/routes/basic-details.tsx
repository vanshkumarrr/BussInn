import { createFileRoute } from "@tanstack/react-router";
import BasicDetails from "../pages/common/BasicDetails";

export const Route = createFileRoute("/basic-details")({
  head: () => ({
    meta: [
      { title: "BasicDetails | Bussinn" },
      { name: "description", content: "Bussinn transit app — BasicDetails screen." },
      { property: "og:title", content: "BasicDetails | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — BasicDetails screen." },
    ],
  }),
  component: BasicDetails,
});
