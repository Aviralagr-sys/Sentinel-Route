import type { Area, Route, RouteListItem } from "./types";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export async function fetchAreas(temporal: boolean): Promise<Area[]> {
  const res = await fetch(`${BASE}/pyapi/areas?temporal=${temporal}`);
  const data = await res.json();
  return data.areas;
}

export async function fetchRoutes(): Promise<RouteListItem[]> {
  const res = await fetch(`${BASE}/pyapi/routes`);
  const data = await res.json();
  return data.routes;
}

export async function fetchRoute(routeId: string, temporal: boolean): Promise<Route> {
  const res = await fetch(`${BASE}/pyapi/route/${routeId}?temporal=${temporal}`);
  return res.json();
}
