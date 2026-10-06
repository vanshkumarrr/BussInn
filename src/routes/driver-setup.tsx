import { createFileRoute } from "@tanstack/react-router";
import DriverSetup from "../pages/common/DriverSetup";

export const Route = createFileRoute("/driver-setup")({
  head: () => ({
    meta: [
      { title: "DriverSetup | Bussinn" },
      { name: "description", content: "Bussinn transit app — DriverSetup screen." },
      { property: "og:title", content: "DriverSetup | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — DriverSetup screen." },
    ],
  }),
  component: DriverSetup,
});
