import { useState, useEffect, useCallback } from "react";
import SafetyMap from "@/components/SafetyMap";
import Sidebar from "@/components/Sidebar";
import { fetchAreas, fetchRoutes, fetchRoute, fetchRouteByPoints } from "@/lib/api";
import type { Area, Route, RouteListItem } from "@/lib/types";

function App() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [routes, setRoutes] = useState<RouteListItem[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [temporalMode, setTemporalMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAreas(temporalMode).then(setAreas).catch(console.error);
    fetchRoutes().then(setRoutes).catch(console.error);
  }, [temporalMode]);

  const handleRouteSelect = useCallback(
    async (routeId: string) => {
      setLoading(true);
      setSelectedArea(null);
      try {
        const route = await fetchRoute(routeId, temporalMode);
        setSelectedRoute(route);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [temporalMode]
  );

  const handleStartEndRoute = useCallback(
    async (start: string, end: string) => {
      setLoading(true);
      setSelectedArea(null);
      try {
        const route = await fetchRouteByPoints(start, end, temporalMode);
        setSelectedRoute(route);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [temporalMode]
  );

  const handleAreaClick = useCallback((area: Area) => {
    setSelectedArea(area);
    setSelectedRoute(null);
  }, []);

  const handleTemporalToggle = useCallback(
    (val: boolean) => {
      setTemporalMode(val);
      if (selectedRoute) {
        setLoading(true);
        fetchRouteByPoints(selectedRoute.start, selectedRoute.end, val)
          .then(setSelectedRoute)
          .catch(() => {
            fetchRoute(selectedRoute.id, val).then(setSelectedRoute);
          })
          .finally(() => setLoading(false));
      }
    },
    [selectedRoute]
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden">
      <div className="flex-1 relative">
        <SafetyMap
          areas={areas}
          selectedRoute={selectedRoute}
          onAreaClick={handleAreaClick}
        />
        <div className="absolute top-4 left-14 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg shadow-lg px-3 py-2 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-xs text-gray-600">Safe (80+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-xs text-gray-600">Moderate (60-79)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-xs text-gray-600">Caution (40-59)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-gray-600">Unsafe (&lt;40)</span>
          </div>
          <div className="w-px h-4 bg-gray-300" />
          <a
            href="/comparison.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md border border-teal-200"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            Compare Models
          </a>
          <a
            href="/scores.html"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Model Scores
          </a>
        </div>
      </div>
      <div className="w-[380px] border-l border-gray-200 shadow-lg flex-shrink-0">
        <Sidebar
          areas={areas}
          routes={routes}
          selectedRoute={selectedRoute}
          temporalMode={temporalMode}
          onTemporalToggle={handleTemporalToggle}
          onRouteSelect={handleRouteSelect}
          onStartEndRoute={handleStartEndRoute}
          selectedArea={selectedArea}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default App;
