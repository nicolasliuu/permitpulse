# Permit Pulse

A web app that tracks NYC building permits - demolitions and new construction - so you can see what's disappearing and what's coming to your neighborhood.

**Live site:** [permitpulse.vercel.app](https://permitpulse.vercel.app) (or wherever you deploy it)

## Features

- **Editorial view** - Featured permits with street-level imagery from Mapillary
- **Explore view** - Interactive map with all permits, filterable by borough and type
- **Daily updates** - GitHub Actions fetches fresh permit data from NYC Open Data

## Tech Stack

- **Frontend:** React + TypeScript + Tailwind CSS + Vite
- **Maps:** Leaflet / react-leaflet
- **Data:** NYC Open Data (DOB Job Application Filings API)
- **Imagery:** Mapillary API for street-level photos
- **Hosting:** Static site (Vercel, Netlify, GitHub Pages, etc.)

## Local Development

```bash
# Install frontend dependencies
cd frontend
npm install

# Run dev server
npm run dev
```

The site will be available at `http://localhost:5173`.

## Updating Data

The data is stored as static JSON files in `frontend/public/data/`. To refresh:

```bash
# Set Mapillary token for street imagery (optional)
export MAPILLARY_ACCESS_TOKEN=your_token_here

# Generate fresh data
cd scripts
pip install httpx
python generate-data.py
```

This fetches the latest permits from NYC Open Data and writes:
- `permits.json` - All permits
- `featured.json` - Top-scored permits with imagery
- `stats.json` - Aggregate counts
- `hotspots.json` - Per-borough breakdown

## Automated Updates

The GitHub Actions workflow (`.github/workflows/update-data.yml`) runs daily to refresh the data and commit changes automatically.

## Data Sources

- [DOB Job Application Filings](https://data.cityofnewyork.us/Housing-Development/DOB-Job-Application-Filings/ic3t-wcy2) - NYC Open Data
- [Mapillary](https://www.mapillary.com/) - Street-level imagery

## License

MIT
