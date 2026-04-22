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

function ScoreBadge({ score, size = "md" }: { score: number; size?: "sm" | "md" | "lg" }) {
  let cls = "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (score < 40) cls = "bg-rose-50 text-rose-700 ring-rose-200";
  else if (score < 60) cls = "bg-orange-50 text-orange-700 ring-orange-200";
  else if (score < 80) cls = "bg-amber-50 text-amber-700 ring-amber-200";

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span className={`inline-flex items-center rounded-md font-semibold ring-1 ring-inset tabular-nums ${cls} ${sizes[size]}`}>
      {score}
    </span>
  );
}

function TagPill({ tag }: { tag: string }) {
  const colorMap: Record<string, string> = {
    "Well-lit": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Police Patrolled": "bg-indigo-50 text-indigo-700 ring-indigo-200",
    "Crowded": "bg-violet-50 text-violet-700 ring-violet-200",
    "Market Area": "bg-amber-50 text-amber-800 ring-amber-200",
    "CCTV Monitored": "bg-cyan-50 text-cyan-700 ring-cyan-200",
    "Low Visibility": "bg-rose-50 text-rose-700 ring-rose-200",
    "Metro Connected": "bg-blue-50 text-blue-700 ring-blue-200",
    "Historic": "bg-orange-50 text-orange-700 ring-orange-200",
    "Residential": "bg-slate-100 text-slate-700 ring-slate-200",
    "Industrial Zone": "bg-zinc-100 text-zinc-700 ring-zinc-200",
    "Near Forest Area": "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Highway": "bg-sky-50 text-sky-700 ring-sky-200",
    "Commercial Area": "bg-teal-50 text-teal-700 ring-teal-200",
  };
  const classes = colorMap[tag] || "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ring-1 ring-inset ${classes}`}>
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
    <div className="h-full flex flex-col bg-slate-50">
      {/* HEADER */}
      <div className="px-5 py-4 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 border-b border-slate-700">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-indigo-900/40">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Sentinel Route</h1>
            <p className="text-[11px] text-slate-400 font-medium">Safety Navigation · Delhi</p>
          </div>
        </div>
      </div>

      {/* TEMPORAL TOGGLE */}
      <div className={`px-5 py-3.5 border-b border-slate-200 transition-colors ${temporalMode ? "bg-indigo-50" : "bg-white"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${temporalMode ? "bg-indigo-600" : "bg-slate-100"}`}>
              {temporalMode ? (
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-[13px] font-semibold text-slate-900">Temporal Sentiment</div>
              <div className="text-[11px] text-slate-500 leading-tight">
                {temporalMode ? "Nighttime mode active" : "Daytime baseline"}
              </div>
            </div>
          </div>
          <button
            onClick={() => onTemporalToggle(!temporalMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              temporalMode ? "bg-indigo-600" : "bg-slate-300"
            }`}
            aria-label="Toggle temporal mode"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                temporalMode ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex bg-white border-b border-slate-200">
        <button
          onClick={() => setTab("picker")}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all ${
            tab === "picker"
              ? "text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50/50"
              : "text-slate-500 hover:text-slate-700 border-b-2 border-transparent"
          }`}
        >
          Find Route
        </button>
        <button
          onClick={() => setTab("presets")}
          className={`flex-1 py-3 text-[11px] font-bold uppercase tracking-wider transition-all ${
            tab === "presets"
              ? "text-indigo-700 border-b-2 border-indigo-600 bg-indigo-50/50"
              : "text-slate-500 hover:text-slate-700 border-b-2 border-transparent"
          }`}
        >
          Preset Routes
        </button>
      </div>

      {/* SCROLL AREA */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {tab === "picker" && (
          <div className="p-4 space-y-3.5 bg-white border-b border-slate-200">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Start Location</label>
              <select
                value={startArea}
                onChange={(e) => setStartArea(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">End Location</label>
              <select
                value={endArea}
                onChange={(e) => setEndArea(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
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
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-lg py-2.5 text-sm font-semibold shadow-md shadow-indigo-600/20 hover:shadow-lg hover:shadow-indigo-600/30 disabled:from-slate-300 disabled:to-slate-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Finding Safe Route..." : "Find Safe Route"}
            </button>

            {startArea && endArea && startArea === endArea && (
              <p className="text-xs text-rose-600">Start and end locations must be different</p>
            )}
          </div>
        )}

        {tab === "presets" && (
          <div className="p-4 space-y-2">
            {routes.map((route) => (
              <button
                key={route.id}
                onClick={() => onRouteSelect(route.id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedRoute?.id === route.id
                    ? "border-indigo-300 bg-indigo-50 shadow-sm ring-1 ring-indigo-200"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className="text-sm font-semibold text-slate-900">{route.name}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                  {route.fastest_route.distance_km} km · {route.fastest_route.eta_minutes} min
                </div>
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <svg className="animate-spin h-4 w-4 text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading route details...
            </div>
          </div>
        )}

        {selectedRoute && !loading && (
          <div className="p-4 space-y-3">
            <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">
              {selectedRoute.name}
            </h2>

            {/* Fastest Route Card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-rose-50 to-rose-100/50 border-b border-rose-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-rose-500 rounded-full ring-2 ring-rose-200" />
                  <span className="text-[12px] font-bold text-rose-900 uppercase tracking-wide">Fastest Route</span>
                </div>
                <ScoreBadge score={selectedRoute.fastest_route.average_score} />
              </div>
              <div className="p-3 space-y-2.5">
                <div className="flex items-center gap-3 text-[11px] text-slate-600 tabular-nums">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {selectedRoute.fastest_route.distance_km} km
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {selectedRoute.fastest_route.eta_minutes} min
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedRoute.fastest_route.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} />
                  ))}
                </div>
                {selectedRoute.fastest_route.area_scores && (
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    {selectedRoute.fastest_route.area_scores.map((as) => (
                      <div key={as.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700">{as.name}</span>
                        <ScoreBadge score={as.score} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sentinel Safe Route Card */}
            <div className="rounded-xl border border-emerald-200 bg-white shadow-md ring-1 ring-emerald-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border-b border-emerald-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-emerald-200" />
                  <span className="text-[12px] font-bold text-emerald-900 uppercase tracking-wide">Sentinel Safe Route</span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-600 text-white rounded">Recommended</span>
                </div>
                <ScoreBadge score={selectedRoute.safe_route.average_score} />
              </div>
              <div className="p-3 space-y-2.5">
                <div className="flex items-center gap-3 text-[11px] text-slate-600 tabular-nums">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {selectedRoute.safe_route.distance_km} km
                  </span>
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {selectedRoute.safe_route.eta_minutes} min
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedRoute.safe_route.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} />
                  ))}
                </div>
                {selectedRoute.safe_route.area_scores && (
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    {selectedRoute.safe_route.area_scores.map((as) => (
                      <div key={as.id} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700">{as.name}</span>
                        <ScoreBadge score={as.score} size="sm" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {selectedArea && !selectedRoute && (
          <div className="p-4 space-y-3">
            <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider px-1">Area Details</h2>
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">{selectedArea.name}</h3>
                <ScoreBadge score={selectedArea.score} />
              </div>
              <div className="p-3 space-y-3">
                <div className="flex flex-wrap gap-1">
                  {selectedArea.tags.map((tag) => (
                    <TagPill key={tag} tag={tag} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="bg-slate-50 rounded-md p-2">
                    <div className="text-slate-500 uppercase tracking-wider font-semibold text-[9px]">Lighting</div>
                    <div className="text-slate-900 font-semibold mt-0.5 capitalize">{selectedArea.lighting}</div>
                  </div>
                  <div className="bg-slate-50 rounded-md p-2">
                    <div className="text-slate-500 uppercase tracking-wider font-semibold text-[9px]">Police Patrol</div>
                    <div className={`font-semibold mt-0.5 ${selectedArea.police_patrol ? "text-emerald-700" : "text-rose-700"}`}>
                      {selectedArea.police_patrol ? "Active" : "Absent"}
                    </div>
                  </div>
                </div>
                {selectedArea.problems.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1.5">Reported Issues</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedArea.problems.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 text-[11px] bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 rounded-md">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedArea.reviews.length > 0 && (
                  <div>
                    <div className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">User Reviews</div>
                    <div className="space-y-1.5">
                      {selectedArea.reviews.map((r, i) => (
                        <div key={i} className="text-[11px] text-slate-600 bg-slate-50 px-2.5 py-2 rounded-md border-l-2 border-indigo-300 italic leading-relaxed">
                          "{r}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="px-4 py-2.5 border-t border-slate-200 bg-white">
        <div className="flex items-center gap-2 text-[10px] text-slate-500">
          <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Built for safer urban navigation</span>
        </div>
      </div>
    </div>
  );
}
