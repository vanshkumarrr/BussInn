import { createFileRoute } from "@tanstack/react-router";
import ReferEarn from "../pages/common/ReferEarn";

export const Route = createFileRoute("/refer-earn")({
  head: () => ({
    meta: [
      { title: "ReferEarn | Bussinn" },
      { name: "description", content: "Bussinn transit app — ReferEarn screen." },
      { property: "og:title", content: "ReferEarn | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — ReferEarn screen." },
    ],
  }),
  component: ReferEarn,
});
