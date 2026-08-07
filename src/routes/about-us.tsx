import { createFileRoute } from "@tanstack/react-router";
import AboutUs from "../pages/common/AboutUs";

export const Route = createFileRoute("/about-us")({
  head: () => ({
    meta: [
      { title: "AboutUs | Bussinn" },
      { name: "description", content: "Bussinn transit app — AboutUs screen." },
      { property: "og:title", content: "AboutUs | Bussinn" },
      { property: "og:description", content: "Bussinn transit app — AboutUs screen." },
    ],
  }),
  component: AboutUs,
});
