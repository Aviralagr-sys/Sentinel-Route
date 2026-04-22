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
        <div className="absolute top-4 left-14 z-[1000] bg-white/95 backdrop-blur-md rounded-xl shadow-lg ring-1 ring-slate-200 px-3.5 py-2.5 flex items-center gap-4">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pr-2 border-r border-slate-200">Safety Index</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-[11px] font-medium text-slate-700">Safe <span className="text-slate-400 tabular-nums">80+</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span className="text-[11px] font-medium text-slate-700">Moderate <span className="text-slate-400 tabular-nums">60–79</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-2 ring-orange-200" />
            <span className="text-[11px] font-medium text-slate-700">Caution <span className="text-slate-400 tabular-nums">40–59</span></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200" />
            <span className="text-[11px] font-medium text-slate-700">Unsafe <span className="text-slate-400 tabular-nums">&lt;40</span></span>
          </div>
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
