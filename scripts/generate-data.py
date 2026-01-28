#!/usr/bin/env python3
"""
Generate static JSON data files for the frontend.
Run this daily via GitHub Actions to update the site.
"""

import json
import os
import httpx
from pathlib import Path
from collections import defaultdict
import math

OUTPUT_DIR = Path(__file__).parent.parent / "frontend" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

SODA_API_URL = "https://data.cityofnewyork.us/resource/ic3t-wcy2.json"
MAPILLARY_TOKEN = os.environ.get("MAPILLARY_ACCESS_TOKEN", "")

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


def calculate_bearing(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate bearing from point 1 to point 2."""
    to_rad = lambda d: d * math.pi / 180
    to_deg = lambda r: r * 180 / math.pi

    d_lon = to_rad(lon2 - lon1)
    y = math.sin(d_lon) * math.cos(to_rad(lat2))
    x = math.cos(to_rad(lat1)) * math.sin(to_rad(lat2)) - \
        math.sin(to_rad(lat1)) * math.cos(to_rad(lat2)) * math.cos(d_lon)

    bearing = to_deg(math.atan2(y, x))
    return (bearing + 360) % 360


def fetch_mapillary_image(lat: float, lng: float) -> dict | None:
    """Fetch the best Mapillary image for a location."""
    if not MAPILLARY_TOKEN:
        return None

    radius = 0.0045
    bbox = f"{lng - radius},{lat - radius},{lng + radius},{lat + radius}"

    try:
        resp = httpx.get(
            "https://graph.mapillary.com/images",
            params={
                "access_token": MAPILLARY_TOKEN,
                "fields": "id,thumb_1024_url,captured_at,compass_angle,geometry",
                "bbox": bbox,
                "limit": 20,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()

        if not data.get("data"):
            return None

        # Find image best facing the building
        best_image = None
        best_score = float("inf")

        for img in data["data"]:
            if not img.get("geometry") or img.get("compass_angle") is None:
                continue

            img_lon, img_lat = img["geometry"]["coordinates"]
            bearing_to_building = calculate_bearing(img_lat, img_lon, lat, lng)

            angle_diff = abs(img["compass_angle"] - bearing_to_building)
            if angle_diff > 180:
                angle_diff = 360 - angle_diff

            if angle_diff < best_score:
                best_score = angle_diff
                best_image = img

        if best_image:
            return {
                "url": best_image.get("thumb_1024_url"),
                "captured_at": best_image.get("captured_at"),
            }

        # Fallback to first image
        first = data["data"][0]
        return {
            "url": first.get("thumb_1024_url"),
            "captured_at": first.get("captured_at"),
        }

    except Exception as e:
        print(f"    Mapillary error: {e}")
        return None


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

    # Featured (top scored) - also fetch Mapillary images
    featured = [p for p in all_permits if p["score"] >= 30][:10]

    if MAPILLARY_TOKEN:
        print("\nFetching Mapillary images for featured permits...")
        for p in featured:
            if p.get("lat") and p.get("lng"):
                print(f"  {p['address']}...")
                img_data = fetch_mapillary_image(p["lat"], p["lng"])
                if img_data:
                    p["image_url"] = img_data["url"]
                    p["image_date"] = img_data["captured_at"]
                    print(f"    ✓ Found image")
                else:
                    print(f"    ✗ No image found")
    else:
        print("\nNo MAPILLARY_ACCESS_TOKEN - skipping image fetch")

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
