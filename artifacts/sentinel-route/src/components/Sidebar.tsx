import { useState } from "react";
import type { Area, Route, RouteListItem } from "@/lib/types";

interface SidebarProps {
  areas: Area[];
  routes: RouteListItem[];
  selectedRoute: Route | null;
  temporalMode: boolean;
  onTemporalToggle: (val: boolean) => void;
  onRouteSelect: (routeId: string) => void;
  onStartEndRoute: (start: string, end: string) => void;
  selectedArea: Area | null;
  loading: boolean;
}

function ScoreBadge({ score }: { score: number }) {
  let bg = "bg-green-100 text-green-800 border-green-200";
  if (score < 40) bg = "bg-red-100 text-red-800 border-red-200";
  else if (score < 60) bg = "bg-orange-100 text-orange-800 border-orange-200";
  else if (score < 80) bg = "bg-yellow-100 text-yellow-800 border-yellow-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold border ${bg}`}>
      {score}
    </span>
  );
}

function TagPill({ tag }: { tag: string }) {
  const colorMap: Record<string, string> = {
    "Well-lit": "bg-green-50 text-green-700 border-green-200",
    "Police Patrolled": "bg-blue-50 text-blue-700 border-blue-200",
    "Crowded": "bg-purple-50 text-purple-700 border-purple-200",
    "Market Area": "bg-amber-50 text-amber-700 border-amber-200",
    "CCTV Monitored": "bg-cyan-50 text-cyan-700 border-cyan-200",
    "Low Visibility": "bg-red-50 text-red-700 border-red-200",
    "Metro Connected": "bg-indigo-50 text-indigo-700 border-indigo-200",
    "Historic": "bg-orange-50 text-orange-700 border-orange-200",
    "Residential": "bg-slate-50 text-slate-700 border-slate-200",
    "Industrial Zone": "bg-gray-50 text-gray-700 border-gray-200",
    "Near Forest Area": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Highway": "bg-sky-50 text-sky-700 border-sky-200",
    "Commercial Area": "bg-teal-50 text-teal-700 border-teal-200",
  };
  const classes = colorMap[tag] || "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${classes}`}>
      {tag}
    </span>
  );
}

export default function Sidebar({
  areas,
  routes,
  selectedRoute,
  temporalMode,
  onTemporalToggle,
  onRouteSelect,
  onStartEndRoute,
  selectedArea,
  loading,
}: SidebarProps) {
  const [startArea, setStartArea] = useState("");
  const [endArea, setEndArea] = useState("");
  const [tab, setTab] = useState<"picker" | "presets">("picker");

  const sortedAreas = [...areas].sort((a, b) => a.name.localeCompare(b.name));

  const handleFindRoute = () => {
    if (startArea && endArea && startArea !== endArea) {
      onStartEndRoute(startArea, endArea);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-slate-900 to-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h1 className="text-lg font-bold text-white">Sentinel Route</h1>
        </div>
        <p className="text-xs text-slate-400">Experience-Based Safety Navigation for Delhi</p>
      </div>

      <div className="p-4 border-b border-gray-200 bg-amber-50">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-amber-900">Temporal Sentiment</div>
            <div className="text-xs text-amber-700">
              {temporalMode ? "Active: Adjusting scores for nighttime (10 PM - 10 AM)" : "Off: Showing daytime scores"}
            </div>
          </div>
          <button
            onClick={() => onTemporalToggle(!temporalMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              temporalMode ? "bg-amber-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                temporalMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab("picker")}
          className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            tab === "picker"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Find Route
        </button>
        <button
          onClick={() => setTab("presets")}
          className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
            tab === "presets"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Preset Routes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {tab === "picker" && (
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Start Location</label>
              <select
                value={startArea}
                onChange={(e) => setStartArea(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select start location...</option>
                {sortedAreas.map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name} (Score: {area.score})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">End Location</label>
              <select
                value={endArea}
                onChange={(e) => setEndArea(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select end location...</option>
                {sortedAreas
                  .filter((a) => a.id !== startArea)
                  .map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name} (Score: {area.score})
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={handleFindRoute}
              disabled={!startArea || !endArea || startArea === endArea || loading}
              className="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Finding Safe Route..." : "Find Safe Route"}
            </button>

            {startArea && endArea && startArea === endArea && (
              <p className="text-xs text-red-500">Start and end locations must be different</p>
            )}
          </div>
        )}

        {tab === "presets" && (
          <div className="p-4">
            <div className="space-y-2">
              {routes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => onRouteSelect(route.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedRoute?.id === route.id
                      ? "border-blue-300 bg-blue-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-sm font-medium text-gray-900">{route.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {route.fastest_route.distance_km} km · {route.fastest_route.eta_minutes} min fastest
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading route details...
            </div>
          </div>
        )}

        {selectedRoute && !loading && (
          <div className="p-4 border-t border-gray-200 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
              {selectedRoute.name}
            </h2>

            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full" />
                  <span className="text-sm font-semibold text-red-900">Fastest Route</span>
                </div>
                <ScoreBadge score={selectedRoute.fastest_route.average_score} />
              </div>
              <div className="text-xs text-red-700 space-y-1">
                <div>{selectedRoute.fastest_route.distance_km} km · {selectedRoute.fastest_route.eta_minutes} min</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedRoute.fastest_route.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} />
                  ))}
                </div>
              </div>
              {selectedRoute.fastest_route.area_scores && (
                <div className="mt-2 space-y-1">
                  {selectedRoute.fastest_route.area_scores.map((as) => (
                    <div key={as.id} className="flex items-center justify-between text-xs text-gray-600">
                      <span>{as.name}</span>
                      <ScoreBadge score={as.score} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm font-semibold text-green-900">Sentinel Safe Route</span>
                </div>
                <ScoreBadge score={selectedRoute.safe_route.average_score} />
              </div>
              <div className="text-xs text-green-700 space-y-1">
                <div>{selectedRoute.safe_route.distance_km} km · {selectedRoute.safe_route.eta_minutes} min</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedRoute.safe_route.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} />
                  ))}
                </div>
              </div>
              {selectedRoute.safe_route.area_scores && (
                <div className="mt-2 space-y-1">
                  {selectedRoute.safe_route.area_scores.map((as) => (
                    <div key={as.id} className="flex items-center justify-between text-xs text-gray-600">
                      <span>{as.name}</span>
                      <ScoreBadge score={as.score} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
              <h3 className="text-xs font-semibold text-blue-900 uppercase tracking-wider mb-2">Route Personality</h3>
              <div className="flex flex-wrap gap-1.5">
                {Array.from(
                  new Set([
                    ...selectedRoute.safe_route.tags,
                    ...selectedRoute.fastest_route.tags,
                  ])
                ).map((tag) => (
                  <TagPill key={tag} tag={tag} />
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedArea && !selectedRoute && (
          <div className="p-4 border-t border-gray-200 space-y-3">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Area Details</h2>
            <div className="rounded-lg border border-gray-200 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-900">{selectedArea.name}</h3>
                <ScoreBadge score={selectedArea.score} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectedArea.tags.map((tag) => (
                  <TagPill key={tag} tag={tag} />
                ))}
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Lighting: <strong>{selectedArea.lighting}</strong></div>
                <div>Police Patrol: <strong>{selectedArea.police_patrol ? "Yes" : "No"}</strong></div>
              </div>
              {selectedArea.problems.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-red-700 mb-1">Reported Issues:</div>
                  <div className="flex flex-wrap gap-1">
                    {selectedArea.problems.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs bg-red-50 text-red-700 border border-red-200 rounded">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedArea.reviews.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-700 mb-1">User Reviews:</div>
                  <div className="space-y-1.5">
                    {selectedArea.reviews.map((r, i) => (
                      <div key={i} className="text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-100 italic">
                        "{r}"
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Designed for solo travelers & vulnerable demographics</span>
        </div>
      </div>
    </div>
  );
}
