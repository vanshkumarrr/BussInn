import { createFileRoute } from "@tanstack/react-router";
import DriverCoins from "../pages/driver/DriverCoins";

export const Route = createFileRoute("/driver/coins")({
  head: () => ({
    meta: [
      { title: "DriverCoins | Bussinn" },
      { name: "description", content: "Bussinn transit app — DriverCoins screen." },
      { property: "og:title", content: "DriverCoins | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — DriverCoins screen." },
    ],
  }),
  component: DriverCoins,
});
