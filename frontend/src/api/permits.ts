export interface Permit {
  id: string;
  type: string | null;
  address: string | null;
  borough: string | null;
  lat: number | null;
  lng: number | null;
  stories: number | null;
  cost: number | null;
  description: string | null;
  score: number;
  image_url?: string;  // Pre-fetched Mapillary image
  image_date?: number; // Image capture timestamp
}

export interface Stats {
  total: number;
  by_type: Record<string, number>;
  by_borough: Record<string, number>;
}

export interface Hotspot {
  borough: string;
  count: number;
  tall_buildings: number;
}

export interface PermitFilters {
  type?: string;
  borough?: string;
}

// Cache for permits data
let permitsCache: Permit[] | null = null;

export async function fetchAllPermits(): Promise<Permit[]> {
  if (permitsCache) return permitsCache;

  const response = await fetch('/data/permits.json');
  if (!response.ok) throw new Error('Failed to fetch permits');
  permitsCache = await response.json();
  return permitsCache!;
}

export async function fetchPermits(filters: PermitFilters = {}): Promise<Permit[]> {
  let permits = await fetchAllPermits();

  if (filters.type) {
    permits = permits.filter(p => p.type === filters.type);
  }
  if (filters.borough) {
    permits = permits.filter(p => p.borough === filters.borough);
  }

  return permits;
}

export async function fetchFeatured(): Promise<Permit[]> {
  const response = await fetch('/data/featured.json');
  if (!response.ok) throw new Error('Failed to fetch featured');
  return response.json();
}

export async function fetchStats(): Promise<Stats> {
  const response = await fetch('/data/stats.json');
  if (!response.ok) throw new Error('Failed to fetch stats');
  return response.json();
}

export async function fetchHotspots(): Promise<Hotspot[]> {
  const response = await fetch('/data/hotspots.json');
  if (!response.ok) throw new Error('Failed to fetch hotspots');
  return response.json();
}
