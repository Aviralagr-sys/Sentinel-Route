import json
import os
import math
from datetime import datetime
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Sentinel Route API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATASET_PATH = os.path.join(os.path.dirname(__file__), "delhi_dataset.json")

with open(DATASET_PATH, "r") as f:
    DATASET = json.load(f)

NEGATIVE_KEYWORDS = DATASET["negative_keywords"]
DEDUCTION = DATASET["deduction_per_keyword"]

AREA_INDEX: dict[str, dict] = {a["id"]: a for a in DATASET["areas"]}
ROUTE_INDEX: dict[str, dict] = {r["id"]: r for r in DATASET["routes"]}


def compute_safety_score(area: dict, temporal_mode: bool = False) -> int:
    base_score = 100
    keyword_count = len(area.get("problems", []))
    score = base_score - (keyword_count * DEDUCTION)

    if temporal_mode and area.get("lighting") == "poor":
        now = datetime.now()
        hour = now.hour
        if hour >= 22 or hour < 10:
            score -= 20

    return max(score, 0)


def get_area_by_id(area_id: str) -> dict | None:
    return AREA_INDEX.get(area_id)


def haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_path(start_id: str, end_id: str, prefer_safe: bool, temporal: bool) -> dict:
    start_area = AREA_INDEX.get(start_id)
    end_area = AREA_INDEX.get(end_id)
    if not start_area or not end_area:
        return {"waypoints": [], "distance_km": 0, "eta_minutes": 0}

    all_areas = list(AREA_INDEX.values())
    scored = {a["id"]: compute_safety_score(a, temporal) for a in all_areas}

    candidates = sorted(
        all_areas,
        key=lambda a: haversine(start_area["lat"], start_area["lng"], a["lat"], a["lng"]),
    )

    path = [start_id]
    current = start_area
    visited = {start_id}
    total_dist = 0.0

    while current["id"] != end_id:
        best = None
        best_cost = float("inf")
        for c in candidates:
            if c["id"] in visited:
                continue
            d = haversine(current["lat"], current["lng"], c["lat"], c["lng"])
            d_to_end = haversine(c["lat"], c["lng"], end_area["lat"], end_area["lng"])
            if d > 15:
                continue
            if prefer_safe:
                safety_penalty = (100 - scored[c["id"]]) * 0.15
                cost = d + d_to_end * 0.5 + safety_penalty
            else:
                cost = d + d_to_end * 0.8
            if cost < best_cost:
                best_cost = cost
                best = c
        if best is None:
            path.append(end_id)
            total_dist += haversine(current["lat"], current["lng"], end_area["lat"], end_area["lng"])
            break
        total_dist += haversine(current["lat"], current["lng"], best["lat"], best["lng"])
        path.append(best["id"])
        visited.add(best["id"])
        current = best
        if len(path) > 8:
            if end_id not in path:
                path.append(end_id)
                total_dist += haversine(current["lat"], current["lng"], end_area["lat"], end_area["lng"])
            break

    eta = round(total_dist * 2.8)
    return {
        "waypoints": path,
        "distance_km": round(total_dist, 1),
        "eta_minutes": max(eta, 5),
    }


def compute_route_score(waypoint_ids: list[str], temporal_mode: bool = False) -> dict:
    total_score = 0
    count = 0
    all_tags = set()
    area_scores = []

    for wid in waypoint_ids:
        area = get_area_by_id(wid)
        if area:
            score = compute_safety_score(area, temporal_mode)
            total_score += score
            count += 1
            all_tags.update(area.get("tags", []))
            area_scores.append({
                "id": area["id"],
                "name": area["name"],
                "score": score,
                "tags": area.get("tags", []),
                "lighting": area.get("lighting", "unknown"),
                "police_patrol": area.get("police_patrol", False),
            })

    avg_score = round(total_score / count) if count > 0 else 0
    return {
        "average_score": avg_score,
        "tags": sorted(list(all_tags)),
        "area_scores": area_scores,
    }


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/areas")
def get_areas(temporal: bool = Query(False)):
    result = []
    for area in DATASET["areas"]:
        score = compute_safety_score(area, temporal)
        result.append({
            "id": area["id"],
            "name": area["name"],
            "lat": area["lat"],
            "lng": area["lng"],
            "score": score,
            "lighting": area.get("lighting", "unknown"),
            "tags": area.get("tags", []),
            "police_patrol": area.get("police_patrol", False),
            "problems": area.get("problems", []),
            "reviews": area.get("reviews", []),
        })
    return {"areas": result}


@app.get("/api/routes")
def get_routes():
    return {"routes": DATASET["routes"]}


@app.get("/api/route")
def get_route_by_points(
    start: str = Query(..., description="Start area ID"),
    end: str = Query(..., description="End area ID"),
    temporal: bool = Query(False),
):
    if start not in AREA_INDEX:
        raise HTTPException(status_code=400, detail=f"Invalid start area: {start}")
    if end not in AREA_INDEX:
        raise HTTPException(status_code=400, detail=f"Invalid end area: {end}")
    if start == end:
        raise HTTPException(status_code=400, detail="Start and end must be different areas")

    for route in DATASET["routes"]:
        if route["start"] == start and route["end"] == end:
            fastest = route["fastest_route"]
            safe = route["safe_route"]
            return {
                "id": route["id"],
                "name": route["name"],
                "start": start,
                "end": end,
                "fastest_route": {**fastest, **compute_route_score(fastest["waypoints"], temporal)},
                "safe_route": {**safe, **compute_route_score(safe["waypoints"], temporal)},
            }

    fastest_path = find_path(start, end, prefer_safe=False, temporal=temporal)
    safe_path = find_path(start, end, prefer_safe=True, temporal=temporal)

    start_name = AREA_INDEX[start]["name"]
    end_name = AREA_INDEX[end]["name"]

    return {
        "id": f"{start}-to-{end}",
        "name": f"{start_name} to {end_name}",
        "start": start,
        "end": end,
        "fastest_route": {**fastest_path, **compute_route_score(fastest_path["waypoints"], temporal)},
        "safe_route": {**safe_path, **compute_route_score(safe_path["waypoints"], temporal)},
    }


@app.get("/api/route/{route_id}")
def get_route(route_id: str, temporal: bool = Query(False)):
    route = ROUTE_INDEX.get(route_id)
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")

    fastest = route["fastest_route"]
    safe = route["safe_route"]

    return {
        "id": route["id"],
        "name": route["name"],
        "start": route["start"],
        "end": route["end"],
        "fastest_route": {**fastest, **compute_route_score(fastest["waypoints"], temporal)},
        "safe_route": {**safe, **compute_route_score(safe["waypoints"], temporal)},
    }


@app.get("/api/area/{area_id}")
def get_area(area_id: str, temporal: bool = Query(False)):
    area = get_area_by_id(area_id)
    if not area:
        raise HTTPException(status_code=404, detail="Area not found")

    score = compute_safety_score(area, temporal)
    return {
        "id": area["id"],
        "name": area["name"],
        "lat": area["lat"],
        "lng": area["lng"],
        "score": score,
        "lighting": area.get("lighting", "unknown"),
        "tags": area.get("tags", []),
        "police_patrol": area.get("police_patrol", False),
        "problems": area.get("problems", []),
        "reviews": area.get("reviews", []),
    }


@app.post("/api/score")
def recalculate_scores(payload: dict):
    temporal = payload.get("temporal", False)
    result = []
    for area in DATASET["areas"]:
        score = compute_safety_score(area, temporal)
        result.append({
            "id": area["id"],
            "name": area["name"],
            "score": score,
        })
    return {"scores": result}


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PYTHON_PORT", "5000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
