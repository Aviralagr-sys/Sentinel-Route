import { useState, useEffect, useCallback } from "react";
import SafetyMap from "@/components/SafetyMap";
import Sidebar from "@/components/Sidebar";
import { fetchAreas, fetchRoutes, fetchRoute } from "@/lib/api";
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

  const handleAreaClick = useCallback((area: Area) => {
    setSelectedArea(area);
    setSelectedRoute(null);
  }, []);

  const handleTemporalToggle = useCallback(
    (val: boolean) => {
      setTemporalMode(val);
      if (selectedRoute) {
        setLoading(true);
        fetchRoute(selectedRoute.id, val)
          .then(setSelectedRoute)
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
        </div>
      </div>
      <div className="w-[380px] border-l border-gray-200 shadow-lg flex-shrink-0">
        <Sidebar
          routes={routes}
          selectedRoute={selectedRoute}
          temporalMode={temporalMode}
          onTemporalToggle={handleTemporalToggle}
          onRouteSelect={handleRouteSelect}
          selectedArea={selectedArea}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default App;
