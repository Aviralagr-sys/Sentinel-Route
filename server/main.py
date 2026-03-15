import json
import os
from datetime import datetime
from fastapi import FastAPI, Query
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


def compute_safety_score(area: dict, temporal_mode: bool = False) -> int:
    base_score = 100
    keyword_count = len(area.get("problems", []))
    score = base_score - (keyword_count * DEDUCTION)

    if temporal_mode and area.get("lighting") in ("poor", "moderate"):
        now = datetime.now()
        hour = now.hour
        if hour >= 22 or hour < 10:
            lighting_penalty = 20 if area["lighting"] == "poor" else 10
            score -= lighting_penalty

    return max(score, 0)


def get_area_by_id(area_id: str) -> dict | None:
    for area in DATASET["areas"]:
        if area["id"] == area_id:
            return area
    return None


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


@app.get("/api/route/{route_id}")
def get_route(route_id: str, temporal: bool = Query(False)):
    for route in DATASET["routes"]:
        if route["id"] == route_id:
            fastest = route["fastest_route"]
            safe = route["safe_route"]

            fastest_detail = compute_route_score(fastest["waypoints"], temporal)
            safe_detail = compute_route_score(safe["waypoints"], temporal)

            return {
                "id": route["id"],
                "name": route["name"],
                "start": route["start"],
                "end": route["end"],
                "fastest_route": {
                    **fastest,
                    **fastest_detail,
                },
                "safe_route": {
                    **safe,
                    **safe_detail,
                },
            }
    return {"error": "Route not found"}


@app.get("/api/area/{area_id}")
def get_area(area_id: str, temporal: bool = Query(False)):
    area = get_area_by_id(area_id)
    if not area:
        return {"error": "Area not found"}

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
