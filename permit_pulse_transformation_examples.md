# Permit Pulse - Raw Data to Visceral Content

## Example Transformation: From Boring Permit to Compelling Story

### Raw API Response (DOB Demolition Permit)

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
  "existing_stories": "3",
  "proposed_stories": "0",
  "existing_dwelling_units": "2",
  "proposed_dwelling_units": "0",
  "existing_occupancy": "J-2",
  "job_description": "FULL DEMOLITION OF EXISTING 3 STORY MIXED USE BUILDING",
  "filing_date": "2026-01-15T00:00:00.000",
  "owner_name": "BLEECKER PROPERTIES LLC",
  "initial_cost": "125000",
  "latitude": "40.728756",
  "longitude": "-73.998743",
  "community_board": "102",
  "nta_name": "SoHo-TriBeCa-Civic Center-Little Italy"
}
```

**What we see:** Numbers, codes, technical language
**What we miss:** The human story

---

### Step 1: Enrich with Building History

**Query PLUTO dataset by Block/Lot:**
```json
{
  "block": "533",
  "lot": "1",
  "yearbuilt": 1924,
  "bldgclass": "C2",
  "bldgarea": 5625,
  "assesstot": 2450000,
  "lotarea": 2500,
  "numbldgs": 1,
  "numfloors": 3
}
```

**Now we know:**
- Built in 1924 (102 years old!)
- Building class C2 = Walk-up apartment
- Small lot = classic NYC mixed-use building

---

### Step 2: Detect Businesses

**Google Places API search at "247 Bleecker Street, New York, NY":**
```json
{
  "results": [
    {
      "name": "John's of Bleecker Street",
      "place_id": "ChIJd_Y0WIZaXWARkNxf8YN_2wQ",
      "types": ["restaurant", "food", "point_of_interest"],
      "rating": 4.5,
      "user_ratings_total": 3847,
      "opening_hours": {
        "open_now": true
      },
      "permanently_closed": false
    }
  ]
}
```

**Now we know:**
- Famous pizza place
- Been there long enough to have 3,847 reviews
- Actually still operating (heartbreaking)

---

### Step 3: Get Street View "Before" Photo

**Google Street View Static API:**
```
https://maps.googleapis.com/maps/api/streetview?
  size=600x400&
  location=40.728756,-73.998743&
  heading=270&
  pitch=0&
  key=YOUR_API_KEY
```

Returns: Image of the building as it looks now (before demolition)

---

### Step 4: Calculate Interest Score

```python
score = 0

# Age scoring
if building_age > 100:
    score += 5  # Very old building
    emotional_weight = "legendary"
elif building_age > 50:
    score += 3  # Historic building
    emotional_weight = "historic"

# Business scoring  
if known_businesses:
    score += 5  # Known business present
    if rating > 4.0 and reviews > 1000:
        score += 2  # Beloved business
        emotional_weight = "beloved"

# Location scoring
if neighborhood in ["SoHo", "West Village", "Williamsburg", "Park Slope"]:
    score += 3  # Hot neighborhood
    
# Cost scoring (indicates significance)
if initial_cost > 100000:
    score += 1

# FINAL SCORE: 5 + 5 + 2 + 3 + 1 = 16/20 (VERY HIGH)
```

---

### Step 5: Generate Social Media Post

**BEFORE (boring):**
> "Demolition permit filed for 247 Bleecker Street, Manhattan. Job #121234567."

**AFTER (visceral):**

```
🪦 RIP 247 Bleecker Street

Built 1924 • Lasted 102 years
Home to John's of Bleecker Street (⭐ 4.5, 3,847 reviews)

Demo permit filed Jan 15, 2026
SoHo-TriBeCa

"Another piece of old New York disappears."

[Street View Image]
📍 View on map
🔗 DOB Job #121234567
```

---

## More Examples: Different Event Types

### Example 2: Luxury New Building

**Raw Data:**
```json
{
  "job": "122345678",
  "job_type": "NB",
  "house": "34",
  "street_name": "GANSEVOORT STREET",
  "borough": "MANHATTAN",
  "proposed_stories": "12",
  "proposed_dwelling_units": "28",
  "initial_cost": "47000000",
  "filing_date": "2026-01-14T00:00:00.000",
  "owner_name": "LIGHTSTONE GROUP",
  "job_description": "NEW 12 STORY RESIDENTIAL BUILDING WITH CELLAR"
}
```

**Enriched:**
- Cost per unit: $47M / 28 units = $1.67M per unit (LUXURY)
- Developer: Lightstone Group (known luxury developer)
- Neighborhood: Meatpacking District (ultra-hot)
- Previous permits at this address: Demo permit filed 3 months ago

**Social Post:**
```
🏗️ Luxury incoming: 34 Gansevoort St

12 stories • 28 units • $47M construction
($1.7M per unit)

Developer: Lightstone Group
Meatpacking District

Demo permit for this site filed 3 months ago.
What did we lose for this?

📊 Filed Jan 14, 2026
```

---

### Example 3: Chain Restaurant License

**Raw Data:**
```json
{
  "serial_number": "1234567",
  "license_type_description": "Restaurant Wine",
  "premise_name": "CHASE BANK",
  "premise_address_1": "567 BEDFORD AVENUE",
  "premise_county": "Kings",
  "dba": "STARBUCKS COFFEE",
  "filing_date": "2026-01-10T00:00:00.000"
}
```

**Enriched:**
- Chain detection: STARBUCKS (coffee chain)
- Neighborhood: Williamsburg, Brooklyn
- Previous use: Bank branch (commercial to commercial)
- Other Starbucks in area: 8 within 1 mile

**Social Post:**
```
☕ Chain alert: Starbucks coming to 567 Bedford Ave

Williamsburg, Brooklyn
Restaurant Wine license filed Jan 10

Previous use: Chase Bank branch
This will be the 9th Starbucks within 1 mile.

"Remember when Williamsburg was different?"

🗺️ View location
```

---

### Example 4: Residential Alteration (Gentrification Signal)

**Raw Data:**
```json
{
  "job": "123456789",
  "job_type": "A1",
  "house": "123",
  "street_name": "ORCHARD STREET",
  "borough": "MANHATTAN",
  "existing_dwelling_units": "0",
  "proposed_dwelling_units": "12",
  "initial_cost": "3500000",
  "filing_date": "2026-01-12T00:00:00.000",
  "job_description": "CONVERSION OF COMMERCIAL BUILDING TO RESIDENTIAL USE"
}
```

**Enriched:**
- Alteration Type 1 = Major alteration with Certificate of Occupancy change
- Commercial → Residential (12 new units)
- Cost per unit: $292k (not luxury, but not affordable)
- Neighborhood: Lower East Side (gentrifying)
- Building was previously: Manufacturing/warehouse

**Social Post:**
```
🔄 Commercial → Residential: 123 Orchard St

Converting warehouse to 12 apartments
$3.5M project ($292k/unit)
Lower East Side

A1 permit filed Jan 12, 2026

Another industrial space becomes housing.
Is this progress or loss?

📐 View plans
```

---

## Feed View: How These Would Appear

### Timeline View (Most Recent First)

```
┌─────────────────────────────────────────────────────────┐
│ Jan 15, 2026                                            │
│ 🪦 DEMOLITION                                           │
│                                                         │
│ 247 Bleecker St, Manhattan                             │
│ Built 1924 • 102 years old                             │
│ Home to: John's of Bleecker Street                     │
│                                                         │
│ [Street View Image]                                    │
│                                                         │
│ Interest Score: ████████░░ 16/20                       │
│ 💬 234 reactions  📍 View on map  🔗 DOB #121234567    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Jan 14, 2026                                            │
│ 🏗️ NEW BUILDING                                         │
│                                                         │
│ 34 Gansevoort St, Manhattan                            │
│ 12 stories • 28 units • $47M                           │
│ $1.7M per unit (LUXURY)                                │
│                                                         │
│ Developer: Lightstone Group                            │
│                                                         │
│ Interest Score: ███████░░░ 14/20                       │
│ 💬 89 reactions  📍 View on map                         │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Jan 12, 2026                                            │
│ 🔄 ALTERATION                                           │
│                                                         │
│ 123 Orchard St, Lower East Side                        │
│ Commercial → 12 residential units                      │
│                                                         │
│ Interest Score: ██████░░░░ 12/20                       │
│ 💬 34 reactions  📍 View on map                         │
└─────────────────────────────────────────────────────────┘
```

---

## Map View: Visual Representation

### Marker Design by Type

**Demolition (Red):**
```
  🪦
 ╱│╲
```
- Size based on interest score
- Older = darker red
- Click reveals: before photo, businesses, building age

**New Building (Blue):**
```
  🏗️
 ╱│╲
```
- Size based on cost
- Luxury = darker blue
- Click reveals: units, cost/unit, developer

**Liquor License (Green):**
```
  🍷
 ╱│╲
```
- Chain = orange instead
- Click reveals: business name, license type

**Alteration (Yellow):**
```
  🔄
 ╱│╲
```
- Major change = darker yellow

### Clustering

When zoomed out, markers within 50m cluster:
```
  (23)
 ╱   ╲
```
Shows count, mixed color gradient based on types

---

## Email Alert Example

```
From: Permit Pulse <alerts@permitpulse.nyc>
To: user@example.com
Subject: 🚨 3 new permits in West Village this week

────────────────────────────────────────────────

Hey there,

3 new construction permits were filed in West Village 
within 500 meters of your saved location.

────────────────────────────────────────────────

🪦 DEMOLITION - Jan 15
247 Bleecker Street

Built 1924 (102 years old)
Home to: John's of Bleecker Street ⭐ 4.5

This one hurts. Classic NYC pizza joint in a 
century-old building.

[View before photo] [See on map]

────────────────────────────────────────────────

🏗️ NEW BUILDING - Jan 14  
34 Gansevoort Street

12 stories • 28 units • $1.7M per unit
Developer: Lightstone Group

Luxury incoming to the Meatpacking District.

[See plans] [See on map]

────────────────────────────────────────────────

☕ LIQUOR LICENSE - Jan 10
567 Bedford Avenue

Starbucks Coffee (9th in 1 mile radius)

Another chain. Another piece of local flavor gone.

[See location]

────────────────────────────────────────────────

Your neighborhood is changing fast.
Stay informed at permitpulse.nyc

[Update your alerts] [Unsubscribe]
```

---

## Analytics Dashboard Examples

### Neighborhood Pulse

```
West Village - Last 30 Days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Demolitions:        7  (↑ 40% vs last month)
New Buildings:      3  (↓ 25%)
Alterations:       12  (↑ 100%)
Liquor Licenses:    4  (→ same)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Buildings Lost (by age):
  100+ years:  2 buildings
  50-100:      3 buildings
  <50:         2 buildings

Average new unit cost: $2.1M (↑ 18%)
Chain licenses: 2 of 4 (50%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Gentrification Score: 7.8/10 (↑ 0.9)
```

### Developer Leaderboard

```
Most Active Developers - Last 6 Months
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Lightstone Group
   Projects: 8
   Total Units: 247
   Investment: $312M
   Neighborhoods: Meatpacking, Chelsea, Flatiron

2. Two Trees Management
   Projects: 6
   Total Units: 189
   Investment: $245M
   Neighborhoods: Williamsburg, DUMBO

3. TF Cornerstone
   Projects: 5
   Total Units: 423
   Investment: $487M
   Neighborhoods: Long Island City, Roosevelt Island
```

### "What's Dying" Weekly Roundup

```
RIP NYC - Week of Jan 15, 2026
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💔 Most Heartbreaking:
   247 Bleecker St - John's Pizza, 102 years
   
🏛️ Oldest Building:
   89 Mulberry St - Built 1885 (141 years)
   
💰 Biggest Demo:
   56 Leonard St - $2.3M demolition cost
   
📊 By Borough:
   Manhattan:  23 demolitions
   Brooklyn:   17
   Queens:      8
   Bronx:       3
   Staten Is:   1

🔥 Hot Zones:
   SoHo: 7 demos
   Williamsburg: 6 demos
   LIC: 4 demos
```

---

## The Transformation: Before/After

### BEFORE (Traditional approach)
> "The NYC Department of Buildings maintains a database of construction permits..."

### AFTER (Riley Walz approach)
> "Your favorite dive bar just filed demolition permits. 
> That 1920s building? Gone in 6 months. 
> The city is changing faster than you think."

**The difference:**
- Boring → Urgent
- Abstract → Personal  
- Data → Story
- Future tense → Present tense (it's happening NOW)

---

## Why This Works (Psychology)

1. **Loss Aversion:** Humans feel loss 2x stronger than gain
   - "Building demolished" > "Building constructed"
   
2. **Nostalgia:** Concrete memories > abstract progress
   - "John's Pizza closing" > "New restaurant opening"
   
3. **Personal Connection:** My block > the city
   - "Your neighborhood" > "New York City"
   
4. **Scarcity:** FOMO is powerful
   - "Visit before it's gone" > "Coming soon"
   
5. **Villain:** Stories need conflict  
   - "Another chain" creates emotional reaction
   - "Luxury developer" frames the narrative

**We're not changing the facts. We're changing the framing.**

The permits are public. The data is dry. 
Our job is to make it FEEL like something.
