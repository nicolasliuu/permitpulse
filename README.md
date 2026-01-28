# Permit Pulse - Data Exploration Summary

## TL;DR

The data is **excellent**. NYC has comprehensive, real-time, public APIs for:
- Construction permits (demolitions, new buildings, alterations)
- Liquor licenses (restaurants/bars coming)  
- Building history (age, use, ownership)

We can absolutely build the Riley Walz-inspired "visceral city change tracker" you envisioned.

---

## What You'll Find in These Documents

### 1. `permit_pulse_data_exploration.md` 📊
**The comprehensive data landscape analysis**

- All available NYC Open Data sources
- Data model design (entities, relationships)
- Key patterns to surface (gentrification signals, developer tracking)
- Data quality considerations
- Why this is compelling (psychology + product)
- MVP pipeline architecture

**Read this first** to understand what's possible with the data.

### 2. `permit_pulse_api_examples.md` 🔌
**Concrete API queries and response structures**

- Example API responses (reconstructed from docs)
- Sample queries for different use cases
- Enrichment pipeline pseudo-code
- Interesting pattern detection queries
- Rate limits and cost estimates ($100/month)
- Technical stack recommendations

**Read this second** to understand how we'd actually build it.

### 3. `permit_pulse_data_model.md` 🗂️
**Database schema and architecture diagrams**

- Entity-relationship diagram (Mermaid)
- Data flow diagrams
- Enrichment pipeline detail
- Scoring algorithm flowchart
- Database indexes for performance
- Sample SQL queries

**Read this third** for implementation details.

### 4. `permit_pulse_transformation_examples.md` ✨
**Raw data → visceral content**

- Before/after examples showing the transformation
- Social media post generation
- Email alert formats
- Map view designs
- Analytics dashboard mockups
- Psychology of why this works

**Read this fourth** to see what the actual product feels like.

---

## Key Findings

### ✅ The Data is THERE

**Primary Sources:**
- **DOB Job Application Filings** - All construction permits, updated daily
- **DOB Permit Issuance** - Tracks permit lifecycle 
- **Liquor License Applications** - New bars/restaurants (leading indicator)
- **PLUTO** - Building age, use, ownership (for context)

**API Access:**
- Free (with app token: 1000 requests/hour)
- Well-documented (Socrata SODA)
- Real-time (daily updates)

### ✅ The Enrichment is FEASIBLE

**What we need:**
- **Geocoding:** NYC GeoSearch API (free)
- **Business Detection:** Google Places API (~$90/month)
- **Before Photos:** Google Street View API (~$10/month)
- **Building History:** PLUTO dataset (free)

**Total cost:** ~$100/month for full enrichment

### ✅ The Product is VIABLE

**MVP Features (Week 1):**
- Daily scraper for demolition permits
- Geocode + enrich with business info
- Auto-post interesting ones to social media
- Simple map showing recent permits

**V2 Features (Week 2-4):**
- Email alerts by neighborhood
- New construction tracking
- Liquor license integration
- Web interface with map + feed

**Long-term:**
- Analytics dashboard (gentrification scoring)
- Developer tracking
- Community tips/corrections
- Historical analysis

---

## The Riley Walz Formula Applied

### What Makes This Work:

1. **Hidden Layer Made Visible**
   - Permits are public but practically invisible
   - We surface them with emotional context
   - Discovery before it's news

2. **Personal + Urgent**
   - "Your neighborhood" not "the city"
   - "This week" not "this year"
   - "Going away" not "changing"

3. **Emotional Framing**
   - Not: "Demolition permit filed"
   - But: "🪦 RIP - This 1920s building lasted 102 years"

4. **Controversy Engine**
   - Preservationists vs developers
   - Chains vs local businesses
   - Luxury vs affordability
   - Natural engagement + sharing

5. **Voyeuristic Compulsion**
   - Check your block obsessively
   - Track your nemesis developer
   - Predict gentrification before it happens
   - Feel like an insider

### Examples of Visceral Framing:

**Demo Permit:**
```
🪦 RIP 247 Bleecker Street

Built 1924 • Lasted 102 years
Home to John's of Bleecker Street (⭐ 4.5)

Demo permit filed Jan 15, 2026

"Another piece of old New York disappears."
```

**Luxury Building:**
```
🏗️ Luxury incoming: 34 Gansevoort St

12 stories • 28 units • $47M
($1.7M per unit)

Developer: Lightstone Group

What did we lose for this?
```

**Chain License:**
```
☕ Starbucks #47 coming to your block

567 Bedford Ave, Williamsburg
9th location within 1 mile

"Remember when Williamsburg was different?"
```

---

## Technical Approach

### Stack Recommendation:
- **Backend:** Python + FastAPI + Celery
- **Database:** PostgreSQL + PostGIS (spatial queries)
- **Frontend:** React + Mapbox/Leaflet
- **Hosting:** Fly.io/Railway + Vercel

### Data Pipeline:
```
Daily scraper
  ↓
Filter "interesting" permits
  ↓
Geocode if missing
  ↓
Enrich (building age, businesses, photos)
  ↓
Calculate interest score
  ↓
High score? → Auto-post to social + send alerts
Low score? → Store for map/search
```

### Scoring Algorithm:
- Building age: Up to +5 points
- Known business: +5 points
- Local (not chain): +2 points
- Hot neighborhood: +3 points
- High permit cost: +2 points

**Score >= 7:** Auto-post
**Score 4-6:** Email alerts only
**Score < 4:** Map/search only

---

## Next Steps

### To Validate This Concept:

1. **Week 1 - Proof of Concept**
   - Write scraper for demolition permits (last 7 days)
   - Manually enrich top 10 "interesting" ones
   - Test Google Places API for business detection
   - Create 5 mock social posts
   - → Validate: Is the data interesting enough?

2. **Week 2 - MVP Bot**
   - Automated daily scraper
   - Interest scoring algorithm
   - Auto-post to Twitter/Bluesky
   - Simple landing page: "Follow for NYC permit alerts"
   - → Validate: Do people engage?

3. **Week 3 - Web Interface**
   - Map view (Leaflet + tile layer)
   - Filter by type/date/neighborhood
   - Click for details + Street View
   - → Validate: Do people use the map?

4. **Week 4 - Email Alerts**
   - User signup with location
   - Weekly digest of permits near you
   - Customizable alert types
   - → Validate: Do people convert to email?

### Success Metrics:

**Social Media:**
- 1,000 followers in first month
- 5%+ engagement rate on posts
- Shares/retweets from local accounts

**Product:**
- 100 email subscribers
- 50+ daily active map users
- Media coverage (Gothamist, The Verge, etc.)

**Vibes:**
- Comments like "this is so sad but I can't look away"
- People checking their own blocks daily
- Local preservation groups using it as evidence

---

## Why This Will Work

### 1. **Perfect Data**
NYC's permit data is:
- Comprehensive (every construction project)
- Timely (updated daily)
- Detailed (addresses, costs, descriptions)
- Free (public API)

### 2. **Perfect City**
New Yorkers are:
- Obsessed with neighborhood change
- Vocal about gentrification
- Nostalgic about "old New York"
- Tech-savvy and Twitter-active

### 3. **Perfect Timing**
- Gentrification discourse at peak
- People want to "do something" about change
- Visualization tools have normalized data art
- Riley Walz proved the formula works

### 4. **Perfect Product**
- Utility (find out what's coming)
- Entertainment (scroll the feed)
- Emotion (rage, nostalgia, FOMO)
- Community (share, discuss, organize)

---

## The Pitch

**"Permit Pulse shows you how NYC is changing—before it's too late."**

Every day, hundreds of construction permits are filed.
Every week, dozens of beloved buildings get demo permits.
Every month, your neighborhood transforms.

Most people never know until it's gone.

We make the invisible visible.
We make the boring visceral.
We make you an insider in your own city.

**Check your block. Track the developers. See the future.**

---

## Questions This Analysis Answers

✅ **Is the data good enough?**
Yes. NYC has excellent, real-time, comprehensive permit data.

✅ **Can we enrich it to be interesting?**
Yes. Building age, business detection, and photos are all feasible.

✅ **What's the technical lift?**
Medium. Scraper + enrichment pipeline + map UI. Doable in 2-4 weeks for MVP.

✅ **What will it cost?**
~$100/month for APIs (mostly Google Places for business detection).

✅ **Will people care?**
Almost certainly. New Yorkers are obsessed with this stuff, and the Riley Walz formula is proven.

✅ **How do we start?**
Scrape last week's demolitions, enrich top 10, make social posts, see if people engage.

---

## Final Thoughts

You nailed the concept. This is **exactly** the kind of project Riley Walz would build:

- ✅ Public data that's technically accessible but practically invisible
- ✅ Emotional framing that makes dry information feel urgent
- ✅ Personal connection (your neighborhood, your block)
- ✅ Discovery before announcement (insider knowledge)
- ✅ Built-in controversy (gentrification, chains, luxury)
- ✅ Compulsive checking behavior (is my block changing?)

The data is better than expected. The enrichment is feasible. The product is viable.

**Ship the bot. See what happens. Iterate from there.**

Start with demolitions. They're the most emotional.
Add new construction. Track the luxury invasion.
Add liquor licenses. Predict the chains.

Layer by layer, make the city's transformation visible.

**"New York is changing faster than you think. We show you how."**
