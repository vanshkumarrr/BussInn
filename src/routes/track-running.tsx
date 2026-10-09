import { createFileRoute } from "@tanstack/react-router";
import TrackRunningPage from "../pages/common/TrackRunning";

export const Route = createFileRoute("/track-running")({
  component: TrackRunningPage,
});