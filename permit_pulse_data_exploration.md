# Permit Pulse - Data Exploration & Modeling

## Executive Summary

After exploring NYC's open data landscape, we have **excellent** data sources for this project. The Riley Walz approach works perfectly here: take boring government data and turn it into something visceral and emotionally resonant.

**The Core Insight:** We're not just showing permits - we're showing *the city changing in real-time*. Every demolition is a goodbye. Every new building permit is gentrification arriving. Every liquor license is a neighborhood transforming.

---

## Available Data Sources

### 1. **DOB Job Application Filings** (PRIMARY SOURCE)
- **Datasets:**
  - Legacy: `DOB Job Application Filings` (ic3t-wcy2) - pre-DOB NOW
  - Current: `DOB NOW: Build – Job Application Filings` (w9ak-ipjd)
  
- **What it contains:**
  - Job Type: `New Building`, `Demolition`, `Alteration Type 1/2/3`
  - Work Type: General Construction, Boiler, Elevator, Plumbing, etc.
  - Address, Borough, Block/Lot
  - Filing date, approval date, permit issuance
  - Job description (sometimes includes business names)
  - Owner information
  - Estimated cost
  - Existing vs proposed number of stories
  
- **Update Frequency:** Daily
- **API:** Socrata SODA API - `https://data.cityofnewyork.us/resource/w9ak-ipjd.json`

### 2. **DOB Permit Issuance**
- **Dataset:** `DOB Permit Issuance` (ipu4-2q9a)
- **What's different:** This tracks the **permit lifecycle** after application
  - Shows when permits are actually issued (not just filed)
  - Updated daily as permits move through approval
  - Better for "it's really happening" vs "it might happen"

### 3. **DOB NOW: All Approved Permits**
- **Dataset:** `DOB NOW: All Approved Permits (NEW)` (dq6g-a4sc)
- **What it contains:** All approved construction permits (except Electrical/Elevator/LAA)
- **Use case:** Filter to approved demolitions and new construction

### 4. **Liquor License Applications** 
- **Datasets:**
  - Active: `Liquor Authority Quarterly List of Active Licenses` (hrvs-fxs2)
  - Pending: `Current SLA Pending Licenses` (f8i8-k2gm)
  - New Applications: `NYS Liquor Authority New Applications Received` (2kid-jvyk)
  
- **What it contains:**
  - Business name, DBA name
  - License type (restaurant, bar, package store, etc.)
  - Address
  - Application date, effective date
  - Serial number
  
- **Gold Mine:** Pending licenses = new bars/restaurants coming before they announce
- **Note:** BetaNYC already built "SLAM" tool for this - we can learn from their approach

### 5. **DCP Housing Database** (BONUS)
- **Dataset:** DOB data but cleaned/decoded by NYC Dept of City Planning
- **What's better:**
  - Decodes DOB's cryptic codes ("J-0" → "Residential: 3+ Units")
  - Filters to only jobs that change residential units
  - Includes geocoding
  - Since 2010
  
- **Use case:** Better for understanding residential displacement

---

## Data Model Design

### Core Entities

```
Event (base table)
├── event_id (UUID)
├── event_type (enum: demolition, new_building, alteration, liquor_license)
├── address
├── lat/lng (geocoded)
├── borough
├── neighborhood (derived from lat/lng)
├── filing_date
├── status (filed, approved, permitted, completed)
├── job_number (DOB reference)
└── raw_data (JSONB for full API response)

DemolitionEvent extends Event
├── building_age (years standing)
├── existing_stories
├── existing_use (commercial, residential, mixed)
├── known_businesses (array of names from Google Places)
└── street_view_url

NewBuildingEvent extends Event
├── proposed_stories
├── proposed_use
├── estimated_cost
├── developer_name
└── is_luxury (derived from cost/unit)

LiquorLicenseEvent
├── business_name
├── dba_name
├── license_type (restaurant, bar, tavern, package_store)
├── application_date
└── is_chain (derived from name matching)

AlterationEvent extends Event
├── alteration_type (1, 2, or 3)
├── scope_description
└── residential_units_change
```

### Enrichment Strategy

**1. Geocoding**
- DOB data includes address but not always lat/lng
- Use NYC Planning's GeoSearch API (same as SLAM project uses)
- Fallback to simple address parsing + OSM Nominatim

**2. Business Detection**
- For demolitions: Query Google Places API for businesses at address
- Match building footprint to known businesses
- Flag chains vs local businesses (emotional impact different)

**3. Neighborhood Classification**
- Use NYC's official neighborhood tabulation areas (NTAs)
- Or use simpler "named neighborhood" polygons
- Needed for "Your neighborhood" alerts

**4. Historical Context**
- For demolitions: Use NYC's PLUTO dataset to get building year
- "This 1920s building lasted 104 years"
- Street View API for "before" photos

**5. Gentrification Scoring**
- Track permit density by neighborhood over time
- Luxury housing: cost per sq ft or total cost
- Chain detection for restaurants/bars
- Displacement risk scoring

---

## Key Data Patterns to Track

### 1. **Demolitions** (Highest Emotional Impact)
```
Recent demo permit + Known business = ALERT
```
Example: "Demo permit filed for 247 Bleecker St - Home to John's Pizza since 1929"

**Interesting signals:**
- Old building (100+ years) = heritage loss
- Known restaurant/bar = neighborhood character loss  
- Rent-stabilized building = displacement
- Multiple demolitions on same block = developer assemblage

### 2. **New Construction** (Gentrification Indicator)
```
New building permit + High cost + Small footprint = Luxury condos
```
Example: "New 12-story building at 34 Eldridge - Est. cost $47M for 28 units ($1.7M/unit)"

**Interesting signals:**
- Cost per unit > $1M = luxury
- 20+ stories in low-rise area = controversial
- Multiple new buildings by same developer = coordinated development
- Located near recent demolitions = neighborhood transformation

### 3. **Liquor Licenses** (Leading Indicator)
```
New liquor license application = Restaurant/bar coming
```
Example: "New restaurant liquor license filed at 567 Manhattan Ave, Greenpoint"

**Interesting signals:**
- Multiple new licenses in short period = area "hot"
- Chain name detection = gentrification
- License for previously residential space = commercial conversion

### 4. **Alterations** (Subtle but Important)
```
Alteration Type 1 + Unit count increase = Residential conversion
```
Example: "Commercial-to-residential conversion at 123 Bowery - Adding 47 units"

---

## Data Quality Considerations

### Challenges:
1. **Address inconsistencies** - "123 Main St" vs "123 Main Street" vs "123 Main"
2. **Missing business names** - DOB data rarely includes tenant names
3. **Lag time** - Permits filed months before work starts
4. **Incomplete data** - Not all fields always populated
5. **False positives** - Permit doesn't always mean it will happen

### Solutions:
1. **Fuzzy address matching** for deduplication
2. **Google Places enrichment** for business detection
3. **Status tracking** - show "filed" vs "approved" vs "permitted"
4. **Community tips** - let users flag known businesses
5. **Confidence scoring** - "High confidence this is happening" vs "Speculative"

---

## What Makes This Compelling (Riley Walz Style)

### 1. **Discovery Before It's News**
Traditional media reports: "New Chase Bank Opens in Williamsburg"
Permit Pulse: "Chase Bank permit filed 6 months ago - opening soon"

### 2. **Emotional Framing**
Not: "Demolition permit filed for 247 Bleecker St"
But: "🪦 RIP 247 Bleecker - This 1920s building lasted 104 years"

### 3. **Make the Invisible Visible**
Permits are public but practically invisible. We surface:
- What's coming before announcement
- What's dying before demolition
- Patterns humans can't see (developer strategies, neighborhood trends)

### 4. **Personal Connection**
- Email alerts: "3 new permits in your neighborhood this week"
- Map view: See changes on your block
- Historical view: "Your neighborhood had 47 demo permits last year"

### 5. **Controversy Magnet**
Built-in conflict:
- Preservationists vs developers
- Long-time residents vs newcomers  
- Local businesses vs chains
- Affordable housing vs luxury condos

This creates engagement, sharing, and discussion.

---

## MVP Data Pipeline

### Phase 1: Demolitions Only (Week 1)
```
Daily:
1. Fetch new demo permits from DOB NOW API
2. Geocode addresses
3. Query Google Places for businesses at address
4. Check building age (PLUTO data)
5. Generate social post if "interesting"
6. Post to Twitter/Bluesky
```

**"Interesting" criteria:**
- Building > 50 years old
- Known business present
- In "hot" neighborhood (Manhattan below 96th, parts of Brooklyn)
- Estimated demo cost > $100k

### Phase 2: Add New Construction (Week 2)
- Filter for new buildings in residential areas
- Flag luxury (cost per unit)
- Track developer patterns

### Phase 3: Add Liquor Licenses (Week 3)
- Pending license applications
- Match to addresses
- Flag chains vs independents

### Phase 4: Web Interface (Week 4)
- Map view with pins
- Filter by event type
- Email alerts by neighborhood

---

## Example API Queries

### Get Recent Demolitions
```
https://data.cityofnewyork.us/resource/w9ak-ipjd.json?
  $where=job_type='DM' AND filing_date>'2026-01-01'
  &$limit=100
  &$order=filing_date DESC
```

### Get Pending Liquor Licenses in Manhattan
```
https://data.ny.gov/resource/f8i8-k2gm.json?
  $where=county_name='New York'
  &$limit=100
```

### Get New Building Permits by Cost
```
https://data.cityofnewyork.us/resource/w9ak-ipjd.json?
  $where=job_type='NB' AND initial_cost>1000000
  &$order=initial_cost DESC
```

---

## Next Steps

1. **Validate API access** - Test actual queries, check rate limits
2. **Sample data analysis** - Pull last 30 days of demolitions, see what's interesting
3. **Design schema** - PostgreSQL + PostGIS for geo queries
4. **Build scraper** - Python script to fetch daily updates
5. **Test Google Places** - See how well we can detect businesses
6. **Design bot personality** - Tone for social posts
7. **Create map UI** - React + Mapbox/Leaflet

**The key insight:** We're not building a permit database. We're building an emotional telescope into urban change.
