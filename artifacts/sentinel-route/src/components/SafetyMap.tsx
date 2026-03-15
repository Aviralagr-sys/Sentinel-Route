import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Area, Route } from "@/lib/types";

interface SafetyMapProps {
  areas: Area[];
  selectedRoute: Route | null;
  onAreaClick: (area: Area) => void;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#eab308";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

function getScoreRadius(score: number): number {
  return Math.max(300, (100 - score) * 8);
}

export default function SafetyMap({ areas, selectedRoute, onAreaClick }: SafetyMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.6139, 77.2090],
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    layersRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!layersRef.current || !mapRef.current) return;
    layersRef.current.clearLayers();

    areas.forEach((area) => {
      const color = getScoreColor(area.score);
      const radius = getScoreRadius(area.score);

      const circle = L.circle([area.lat, area.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        radius: radius,
        weight: 2,
      });

      const tagsHtml = area.tags
        .map(
          (tag) =>
            `<span style="display:inline-block;padding:2px 6px;margin:2px;border-radius:4px;font-size:11px;background:${color}22;color:${color};border:1px solid ${color}44;">${tag}</span>`
        )
        .join("");

      circle.bindPopup(`
        <div style="min-width:200px;">
          <h3 style="margin:0 0 4px;font-size:14px;font-weight:600;">${area.name}</h3>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
            <span style="font-size:20px;font-weight:700;color:${color};">${area.score}</span>
            <span style="font-size:11px;color:#666;">/ 100 Safety Score</span>
          </div>
          <div style="margin-bottom:6px;">${tagsHtml}</div>
          <div style="font-size:11px;color:#666;">
            <div>Lighting: <strong>${area.lighting}</strong></div>
            <div>Police Patrol: <strong>${area.police_patrol ? "Yes" : "No"}</strong></div>
          </div>
        </div>
      `);

      circle.on("click", () => onAreaClick(area));
      circle.addTo(layersRef.current!);
    });
  }, [areas, onAreaClick]);

  useEffect(() => {
    if (!routeLayerRef.current || !mapRef.current) return;
    routeLayerRef.current.clearLayers();

    if (!selectedRoute) return;

    const getAreaLatLng = (areaId: string): [number, number] | null => {
      const area = areas.find((a) => a.id === areaId);
      return area ? [area.lat, area.lng] : null;
    };

    const fastestCoords = selectedRoute.fastest_route.waypoints
      .map(getAreaLatLng)
      .filter((c): c is [number, number] => c !== null);

    const safeCoords = selectedRoute.safe_route.waypoints
      .map(getAreaLatLng)
      .filter((c): c is [number, number] => c !== null);

    if (fastestCoords.length > 1) {
      L.polyline(fastestCoords, {
        color: "#ef4444",
        weight: 4,
        opacity: 0.7,
        dashArray: "10, 10",
      })
        .bindPopup(
          `<strong>Fastest Route</strong><br/>Score: ${selectedRoute.fastest_route.average_score}<br/>${selectedRoute.fastest_route.distance_km} km · ${selectedRoute.fastest_route.eta_minutes} min`
        )
        .addTo(routeLayerRef.current!);
    }

    if (safeCoords.length > 1) {
      L.polyline(safeCoords, {
        color: "#22c55e",
        weight: 4,
        opacity: 0.8,
      })
        .bindPopup(
          `<strong>Sentinel Safe Route</strong><br/>Score: ${selectedRoute.safe_route.average_score}<br/>${selectedRoute.safe_route.distance_km} km · ${selectedRoute.safe_route.eta_minutes} min`
        )
        .addTo(routeLayerRef.current!);
    }

    fastestCoords.forEach((coord, i) => {
      const isEndpoint = i === 0 || i === fastestCoords.length - 1;
      if (isEndpoint) {
        L.circleMarker(coord, {
          radius: 8,
          color: "#1e40af",
          fillColor: "#3b82f6",
          fillOpacity: 1,
          weight: 2,
        }).addTo(routeLayerRef.current!);
      }
    });

    const allCoords = [...fastestCoords, ...safeCoords];
    if (allCoords.length > 0) {
      const bounds = L.latLngBounds(allCoords);
      mapRef.current!.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [selectedRoute, areas]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
}
