export interface GPSPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface BusRoute {
  id: string;
  routeName: string;
  stops: BusStop[];
}

export interface Trip {
  userId: string;
  routeId: string;
  startTime: number;
  endTime: number;
  gpsHistory: GPSPoint[];
}