# Permit Pulse - API Examples & Data Structure

## Example API Responses (Reconstructed from Documentation)

### 1. DOB Job Application Filing (Demolition)

**Query:**
```
GET https://data.cityofnewyork.us/resource/w9ak-ipjd.json?job_type=DM&$limit=1
```

**Expected Response Structure:**
```json
{
  "job": "121234567",
  "doc": "01",
  "borough": "MANHATTAN",
  "house": "247",
  "street_name": "BLEECKER STREET",
  "block": "533",
  "lot": "1",
  "bin": "1008157",
  "job_type": "DM",
  "job_type_description": "Demolition",
  "self_cert": "N",
  "block_type": null,
  "existing_stories": "3",
  "proposed_stories": "0",
  "existing_height": "35",
  "proposed_height": "0",
  "existing_dwelling_units": "2",
  "proposed_dwelling_units": "0",
  "existing_occupancy": "J-2",
  "proposed_occupancy": null,
  "horizontal_enlrgmt": null,
  "vertical_enlrgmt": null,
  "enlargement_sq_footage": null,
  "street_frontage": "25",
  "existing_bldg_footage": "5625",
  "proposed_bldg_footage": "0",
  "special_district_1": null,
  "special_district_2": null,
  "owner_name": "BLEECKER PROPERTIES LLC",
  "owner_business_name": null,
  "owner_phone": "2125551234",
  "job_description": "FULL DEMOLITION OF EXISTING 3 STORY MIXED USE BUILDING",
  "filing_date": "2026-01-15T00:00:00.000",
  "issuance_date": null,
  "expiration_date": null,
  "job_start_date": null,
  "initial_cost": "125000",
  "total_construction_floor_area": "0",
  "filing_status": "INITIAL",
  "latitude": "40.728756",
  "longitude": "-73.998743",
  "community_board": "102",
  "council_district": "3",
  "census_tract": "43",
  "nta_name": "SoHo-TriBeCa-Civic Center-Little Italy"
}
```

**Key Fields for Our Use:**
- `job_type`: "DM" = Demolition, "NB" = New Building, "A1/A2/A3" = Alterations
- `filing_date`: When permit was filed (our trigger)
- `existing_stories`, `existing_dwelling_units`: What we're losing
- `job_description`: Sometimes mentions businesses
- `initial_cost`: Scale of demolition
- `latitude/longitude`: For mapping (when present)
- `nta_name`: Neighborhood name

### 2. Liquor License Application

**Query:**
```
GET https://data.ny.gov/resource/f8i8-k2gm.json?county_name=New%20York&$limit=1
```

**Expected Response Structure:**
```json
{
  "serial_number": "1234567",
  "license_type_code": "OP",
  "license_type_description": "On Premises Liquor License",
  "license_class_code": "320",
  "license_class_description": "Restaurant Wine",
  "principal_name": "SMITH JOHN",
  "principal_address_1": "123 MAIN ST",
  "principal_address_2": null,
  "principal_city": "NEW YORK",
  "principal_state": "NY",
  "principal_zip_code": "10002",
  "premise_name": "THE CORNER BISTRO",
  "premise_address_1": "567 MANHATTAN AVE",
  "premise_address_2": null,
  "premise_city": "NEW YORK",
  "premise_county": "New York",
  "premise_state": "NY",
  "premise_zip": "10002",
  "premise_zip_4": "1234",
  "dba": "CORNER BISTRO NYC",
  "filing_date": "2026-01-10T00:00:00.000",
  "effective_date": null,
  "expiration_date": null,
  "georeference": {
    "type": "Point",
    "coordinates": [-73.9876, 40.7234]
  }
}
```

**Key Fields for Our Use:**
- `license_type_description`: Restaurant vs Bar vs Package Store
- `premise_name` / `dba`: Business name
- `filing_date`: When they applied (leading indicator)
- `premise_address_1`: Where it's happening
- `georeference`: Already geocoded!

### 3. PLUTO (Building Age/Info)

For enrichment - query PLUTO dataset by address to get:
- Year built
- Building class
- Lot size
- Assessed value

---

## Sample Queries for Different Use Cases

### "What's Dying This Week" - Recent Demolitions
```
https://data.cityofnewyork.us/resource/w9ak-ipjd.json?
  job_type=DM&
  $where=filing_date > '2026-01-20' AND borough='MANHATTAN'&
  $order=filing_date DESC&
  $limit=50
```

### "Luxury Is Coming" - Expensive New Buildings
```
https://data.cityofnewyork.us/resource/w9ak-ipjd.json?
  job_type=NB&
  $where=initial_cost > 5000000&
  $order=initial_cost DESC&
  $limit=20
```

### "Chain Invasion" - New Liquor Licenses
```
https://data.ny.gov/resource/f8i8-k2gm.json?
  county_name=New%20York&
  $where=filing_date > '2025-12-01'&
  $order=filing_date DESC
```

### "Your Block Is Changing" - Permits Near Location
```
https://data.cityofnewyork.us/resource/w9ak-ipjd.json?
  $where=within_circle(location, 40.7282, -73.9942, 500)&
  filing_date > '2025-12-01'&
  $order=filing_date DESC
```
(500 meters radius)

### "Developer Watch" - Track Specific Owner
```
https://data.cityofnewyork.us/resource/w9ak-ipjd.json?
  $where=owner_name LIKE '%LIGHTSTONE%'&
  $order=filing_date DESC&
  $limit=100
```

---

## Data Enrichment Pseudo-Pipeline

```python
# Pseudo-code for processing a new demolition permit

def process_demolition(permit_data):
    event = {
        'type': 'demolition',
        'address': f"{permit_data['house']} {permit_data['street_name']}",
        'borough': permit_data['borough'],
        'filing_date': permit_data['filing_date'],
        'job_number': permit_data['job']
    }
    
    # 1. Geocode if missing
    if not permit_data.get('latitude'):
        coords = geocode_nyc(event['address'], permit_data['borough'])
        event['lat'] = coords['lat']
        event['lng'] = coords['lng']
    else:
        event['lat'] = permit_data['latitude']
        event['lng'] = permit_data['longitude']
    
    # 2. Get neighborhood
    event['neighborhood'] = get_neighborhood(event['lat'], event['lng'])
    
    # 3. Get building info from PLUTO
    pluto = query_pluto(permit_data['block'], permit_data['lot'])
    if pluto:
        event['year_built'] = pluto['yearbuilt']
        event['building_age'] = 2026 - pluto['yearbuilt']
        event['building_class'] = pluto['bldgclass']
    
    # 4. Check for businesses at this address
    places = google_places_search(event['address'])
    if places:
        event['known_businesses'] = [
            p['name'] for p in places['results']
        ]
        event['has_business'] = True
    else:
        event['has_business'] = False
    
    # 5. Get Street View image
    event['street_view_url'] = get_street_view_url(
        event['lat'], 
        event['lng']
    )
    
    # 6. Calculate "interestingness" score
    score = 0
    if event.get('building_age', 0) > 50:
        score += 3  # Old building = more interesting
    if event.get('has_business'):
        score += 5  # Known business = very interesting
    if event['neighborhood'] in HOT_NEIGHBORHOODS:
        score += 2  # Hot area = interesting
    if permit_data['initial_cost'] > 100000:
        score += 1  # Expensive demo = significant
    
    event['interest_score'] = score
    event['should_post'] = score >= 5  # Threshold for social post
    
    # 7. Generate social post text
    if event['should_post']:
        event['post_text'] = generate_post(event)
    
    return event

def generate_post(event):
    """Generate melancholic but informative social post"""
    text = f"🪦 Demo permit filed: {event['address']}, {event['borough']}\n"
    
    if event.get('building_age'):
        text += f"Built in {event['year_built']}. Lasted {event['building_age']} years.\n"
    
    if event.get('known_businesses'):
        businesses = ', '.join(event['known_businesses'][:3])
        text += f"Home to: {businesses}\n"
    
    text += f"\nJob #{event['job_number']}"
    
    return text
```

---

## Interesting Data Patterns to Surface

### 1. **Assemblage Detection**
Multiple adjacent lots filed by same owner = developer assembling land
```sql
SELECT owner_name, COUNT(*), array_agg(DISTINCT block || '-' || lot)
FROM permits 
WHERE job_type = 'DM' 
  AND filing_date > NOW() - INTERVAL '6 months'
GROUP BY owner_name, block
HAVING COUNT(*) > 2
```

### 2. **Gentrification Velocity**
Rate of change in a neighborhood
```sql
SELECT 
  neighborhood,
  COUNT(*) FILTER (WHERE job_type = 'DM') as demolitions,
  COUNT(*) FILTER (WHERE job_type = 'NB') as new_buildings,
  AVG(initial_cost) FILTER (WHERE job_type = 'NB') as avg_new_building_cost
FROM permits
WHERE filing_date > NOW() - INTERVAL '1 year'
GROUP BY neighborhood
ORDER BY demolitions + new_buildings DESC
```

### 3. **Before/After Timeline**
Demo permit → New building permit at same address
```sql
SELECT 
  d.address,
  d.filing_date as demo_date,
  n.filing_date as new_building_date,
  n.filing_date - d.filing_date as gap_days,
  n.initial_cost as replacement_cost
FROM demolitions d
JOIN new_buildings n ON d.block = n.block AND d.lot = n.lot
WHERE n.filing_date > d.filing_date
ORDER BY gap_days
```

### 4. **Chain Detection**
Pattern matching for chain businesses
```python
CHAIN_PATTERNS = {
    'banks': ['CHASE', 'CITI', 'WELLS FARGO', 'BANK OF AMERICA'],
    'pharmacies': ['WALGREENS', 'CVS', 'DUANE READE'],
    'coffee': ['STARBUCKS', 'DUNKIN'],
    'fast_food': ['MCDONALDS', 'SUBWAY', 'CHIPOTLE']
}

def is_chain(business_name):
    name_upper = business_name.upper()
    for category, chains in CHAIN_PATTERNS.items():
        for chain in chains:
            if chain in name_upper:
                return (True, category, chain)
    return (False, None, None)
```

---

## UI/UX Implications from Data

### Map View Requirements
- **Cluster markers** at zoom-out (too many permits to show individually)
- **Color coding**: Red = demolition, Blue = new building, Green = liquor license
- **Size by interest score**: Bigger = more significant
- **Click for details**: Popup with Street View, description, timeline

### Feed View (like Twitter)
```
🪦 247 Bleecker St, Manhattan
Demo permit filed Jan 15, 2026
Built 1924 • 102 years old
Home to: John's Pizza (since 1929)

[Street View Image]
[Map Pin]
[Job #121234567]
```

### Email Alert Format
```
Subject: 3 new permits in West Village this week

🪦 DEMOLITION: 247 Bleecker St
   1920s building • John's Pizza location
   Filed Jan 15

🏗️ NEW BUILDING: 34 Gansevoort St  
   12 stories • $47M estimated cost
   Filed Jan 14
   
🍷 LIQUOR LICENSE: 567 Manhattan Ave
   Restaurant Wine license • The Corner Bistro
   Filed Jan 10
   
[View on map]
[Update your alerts]
```

### "Leaderboard" Views
- **Most Active Developers** (by permit count)
- **Fastest Changing Neighborhoods** (by permit density)
- **Oldest Buildings Demolished This Year**
- **Most Expensive New Buildings**

---

## Technical Stack Implications

### Database
- **PostgreSQL** with **PostGIS** extension (for geo queries)
- **TimescaleDB** (for time-series analysis of trends)

### Backend
- **Python** (great libraries for Socrata API, geocoding)
- **FastAPI** (modern, async, auto-docs)
- **Celery** (for background jobs: daily scraping, enrichment)
- **Redis** (task queue, caching)

### Frontend
- **React** (for map + feed views)
- **Mapbox GL JS** or **Leaflet** (mapping)
- **Tailwind CSS** (fast styling)

### Services
- **Socrata API** (NYC Open Data)
- **Google Places API** (business detection) - costs money but crucial
- **Google Street View API** (before photos) - costs money
- **NYC GeoSearch API** (free geocoding)

### Hosting
- **Fly.io** or **Railway** (easy deployment)
- **Supabase** (PostgreSQL + PostGIS + realtime) - could replace custom backend
- **Vercel** (frontend)

---

## Rate Limits & Costs

### NYC Open Data (Socrata)
- **Without token:** ~1000 requests/day (IP-based)
- **With app token:** 1000 requests/hour (plenty for us)
- **Cost:** FREE

### Google Places API
- **Text Search:** $32 per 1000 requests
- **If we enrich 100 demolitions/day:** ~$3/day = $90/month
- **Optimization:** Cache results, only query when high interest score

### Google Street View API
- **Static images:** $7 per 1000 requests
- **If we fetch 50 images/day:** ~$0.35/day = $10/month

### Total estimated costs
- **Development:** $0 (using free tiers)
- **Production:** ~$100/month (mostly Google APIs)
- **Could monetize:** Premium alerts, API access, sponsor posts

---

## Next Steps for Prototyping

1. **Test API access** - Write simple Python script to fetch last 7 days of demolitions
2. **Analyze sample** - See what the data actually looks like, find quirks
3. **Test Google Places** - For top 10 interesting demolitions, can we detect businesses?
4. **Design schema** - Create tables for events, enrichment cache
5. **Build MVP scraper** - Daily job to fetch + enrich new permits
6. **Create simple bot** - Auto-post to Twitter when interest_score > threshold
7. **Iterate on personality** - Test different post styles, see what resonates

The data is THERE. It's PUBLIC. It's GOOD.

Now it's about making it VISCERAL.
