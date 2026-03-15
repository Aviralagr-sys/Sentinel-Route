export interface Area {
  id: string;
  name: string;
  lat: number;
  lng: number;
  score: number;
  lighting: string;
  tags: string[];
  police_patrol: boolean;
  problems: string[];
  reviews: string[];
}

export interface RouteWaypoint {
  waypoints: string[];
  distance_km: number;
  eta_minutes: number;
  average_score: number;
  tags: string[];
  area_scores: AreaScore[];
}

export interface AreaScore {
  id: string;
  name: string;
  score: number;
  tags: string[];
  lighting: string;
  police_patrol: boolean;
}

export interface Route {
  id: string;
  name: string;
  start: string;
  end: string;
  fastest_route: RouteWaypoint;
  safe_route: RouteWaypoint;
}

export interface RouteListItem {
  id: string;
  name: string;
  start: string;
  end: string;
  fastest_route: {
    waypoints: string[];
    distance_km: number;
    eta_minutes: number;
  };
  safe_route: {
    waypoints: string[];
    distance_km: number;
    eta_minutes: number;
  };
}
