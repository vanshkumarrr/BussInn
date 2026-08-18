import { supabase } from "./supabase";

const channel = supabase
  .channel("live-location-test")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "live_locations",
    },
    (payload) => {
      console.log("REALTIME UPDATE:", payload);
    }
  )
  .subscribe((status) => {
    console.log("Realtime status:", status);
  });

export default channel;