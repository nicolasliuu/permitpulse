#!/usr/bin/env python3
"""
Generate static JSON data files for the frontend.
Run this daily via GitHub Actions to update the site.
"""

import json
import httpx
from pathlib import Path
from collections import defaultdict

OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SODA_API_URL = "https://data.cityofnewyork.us/resource/ic3t-wcy2.json"

BOROUGH_MAP = {
    "1": "Manhattan",
    "2": "Bronx",
    "3": "Brooklyn",
    "4": "Queens",
    "5": "Staten Island",
}

JOB_TYPE_MAP = {
    "DM": "demolition",
    "NB": "new_building",
}


def parse_float(val):
    if not val:
        return None
    try:
        return float(str(val).replace(",", "").replace("$", ""))
    except (ValueError, AttributeError):
        return None


def parse_int(val):
    if not val:
        return None
    try:
        return int(float(val))
    except (ValueError, AttributeError):
        return None


def transform_permit(raw: dict) -> dict:
    job_type = raw.get("job_type", "")
    borough_code = raw.get("borough", "")

    stories_existing = parse_int(raw.get("existingno_of_stories"))
    stories_proposed = parse_int(raw.get("proposed_no_of_stories"))
    cost = parse_float(raw.get("initial_cost"))
    lat = parse_float(raw.get("gis_latitude"))
    lng = parse_float(raw.get("gis_longitude"))

    event_type = JOB_TYPE_MAP.get(job_type, job_type.lower() if job_type else None)
    borough = BOROUGH_MAP.get(borough_code, borough_code)

    # Calculate interest score
    score = 0
    stories = stories_proposed if event_type == "new_building" else stories_existing
    if stories:
        if stories >= 20: score += 60
        elif stories >= 10: score += 40
        elif stories >= 5: score += 20

    if cost:
        if cost >= 10000000: score += 50
        elif cost >= 1000000: score += 30
        elif cost >= 500000: score += 15

    if borough == "Manhattan": score += 15
    elif borough == "Brooklyn": score += 10

    if raw.get("job_description"): score += 5

    return {
        "id": raw.get("job__", ""),
        "type": event_type,
        "address": f"{raw.get('house__', '')} {raw.get('street_name', '')}".strip(),
        "borough": borough,
        "lat": lat,
        "lng": lng,
        "stories": stories,
        "cost": cost,
        "description": raw.get("job_description"),
        "score": score,
    }


def fetch_permits(job_type: str, limit: int = 2000) -> list[dict]:
    params = {
        "job_type": job_type,
        "$where": "gis_latitude IS NOT NULL",
        "$order": "latest_action_date DESC",
        "$limit": limit,
    }

    print(f"Fetching {job_type} permits...")
    resp = httpx.get(SODA_API_URL, params=params, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    print(f"  Got {len(data)} records")

    permits = []
    for raw in data:
        transformed = transform_permit(raw)
        if transformed["id"] and transformed["lat"] and transformed["lng"]:
            permits.append(transformed)

    return permits


def main():
    # Fetch both types
    demolitions = fetch_permits("DM", 2000)
    new_buildings = fetch_permits("NB", 1500)

    all_permits = demolitions + new_buildings
    print(f"\nTotal permits: {len(all_permits)}")

    # Sort by score
    all_permits.sort(key=lambda x: x["score"], reverse=True)

    # Generate stats
    stats = {
        "total": len(all_permits),
        "by_type": defaultdict(int),
        "by_borough": defaultdict(int),
    }

    for p in all_permits:
        stats["by_type"][p["type"]] += 1
        stats["by_borough"][p["borough"]] += 1

    stats["by_type"] = dict(stats["by_type"])
    stats["by_borough"] = dict(stats["by_borough"])

    # Featured (top scored)
    featured = [p for p in all_permits if p["score"] >= 30][:10]

    # Hotspots
    hotspots = []
    for borough, count in sorted(stats["by_borough"].items(), key=lambda x: -x[1]):
        borough_permits = [p for p in all_permits if p["borough"] == borough]
        tall = sum(1 for p in borough_permits if (p["stories"] or 0) >= 5)
        hotspots.append({
            "borough": borough,
            "count": count,
            "tall_buildings": tall,
        })

    # Write files
    print("\nWriting JSON files...")

    with open(OUTPUT_DIR / "permits.json", "w") as f:
        json.dump(all_permits, f)
    print(f"  permits.json: {len(all_permits)} permits")

    with open(OUTPUT_DIR / "stats.json", "w") as f:
        json.dump(stats, f)
    print(f"  stats.json")

    with open(OUTPUT_DIR / "featured.json", "w") as f:
        json.dump(featured, f)
    print(f"  featured.json: {len(featured)} featured")

    with open(OUTPUT_DIR / "hotspots.json", "w") as f:
        json.dump(hotspots, f)
    print(f"  hotspots.json: {len(hotspots)} boroughs")

    print("\nDone!")


if __name__ == "__main__":
    main()
