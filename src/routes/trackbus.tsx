import { createFileRoute } from "@tanstack/react-router";
import TrackBus from "../pages/passenger/trackbus";

export const Route = createFileRoute("/trackbus")({
  component: TrackBus,
});