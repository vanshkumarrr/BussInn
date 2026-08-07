import { createFileRoute } from "@tanstack/react-router";
import RedeemCoins from "../pages/common/RedeemCoins";

export const Route = createFileRoute("/redeem-coins")({
  head: () => ({
    meta: [
      { title: "RedeemCoins | Bussinn" },
      { name: "description", content: "Bussinn transit app — RedeemCoins screen." },
      { property: "og:title", content: "RedeemCoins | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — RedeemCoins screen." },
    ],
  }),
  component: RedeemCoins,
});
