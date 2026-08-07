import { createFileRoute } from "@tanstack/react-router";
import InsideBus from "../pages/passenger/InsideBus";

export const Route = createFileRoute("/passenger/inside-bus")({
  head: () => ({
    meta: [
      { title: "InsideBus | Bussinn" },
      { name: "description", content: "Bussinn transit app — InsideBus screen." },
      { property: "og:title", content: "InsideBus | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — InsideBus screen." },
    ],
  }),
  component: InsideBus,
});
