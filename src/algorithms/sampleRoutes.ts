import type { BusRoute } from "./types";

export const SAMPLE_ROUTES: BusRoute[] = [
  {
    id: "route-1",
    routeName: "Sector 62 → Pari Chowk",
    stops: [
      {
        id: "s1",
        name: "Sector 62",
        latitude: 28.6280,
        longitude: 77.3649,
      },
      {
        id: "s2",
        name: "Botanical Garden",
        latitude: 28.5633,
        longitude: 77.3340,
      },
      {
        id: "s3",
        name: "Pari Chowk",
        latitude: 28.4582,
        longitude: 77.5020,
      },
    ],
  },
  {
    id: "route-2",
    routeName: "Noida City Centre → Jewar",
    stops: [
      {
        id: "s4",
        name: "City Centre",
        latitude: 28.5744,
        longitude: 77.3561,
      },
      {
        id: "s5",
        name: "Knowledge Park",
        latitude: 28.4744,
        longitude: 77.5040,
      },
      {
        id: "s6",
        name: "Jewar",
        latitude: 28.1223,
        longitude: 77.5572,
      },
    ],
  },
];