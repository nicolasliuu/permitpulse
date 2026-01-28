import { useState, useEffect, useMemo } from 'react';
import FeaturedPermit from './components/FeaturedPermit';
import HotspotCard from './components/HotspotCard';
import PermitCard from './components/PermitCard';
import PermitMap from './components/PermitMap';
import Filters from './components/Filters';
import {
  fetchPermits,
  fetchFeatured,
  fetchStats,
  fetchHotspots,
  type Permit,
  type PermitFilters,
  type Stats,
  type Hotspot,
} from './api/permits';
import './index.css';

type View = 'editorial' | 'explore';

const PERMITS_PER_PAGE = 30;

function App() {
  const [view, setView] = useState<View>('editorial');
  const [featured, setFeatured] = useState<Permit[]>([]);
  const [allPermits, setAllPermits] = useState<Permit[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PermitFilters>({});
  const [page, setPage] = useState(1);
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);

  // Load all data on mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [featuredData, statsData, hotspotsData, permitsData] = await Promise.all([
          fetchFeatured(),
          fetchStats(),
          fetchHotspots(),
          fetchPermits(),
        ]);
        setFeatured(featuredData);
        setStats(statsData);
        setHotspots(hotspotsData);
        setAllPermits(permitsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Filter permits client-side
  const filteredPermits = useMemo(() => {
    let permits = allPermits;
    if (filters.type) {
      permits = permits.filter((p) => p.type === filters.type);
    }
    if (filters.borough) {
      permits = permits.filter((p) => p.borough === filters.borough);
    }
    return permits;
  }, [allPermits, filters]);

  // Paginate
  const paginatedPermits = useMemo(() => {
    const start = (page - 1) * PERMITS_PER_PAGE;
    return filteredPermits.slice(start, start + PERMITS_PER_PAGE);
  }, [filteredPermits, page]);

  const totalPages = Math.ceil(filteredPermits.length / PERMITS_PER_PAGE);

  const handleBoroughClick = (borough: string) => {
    setFilters({ ...filters, borough });
    setPage(1);
    setView('explore');
  };

  const handleFilterChange = (newFilters: PermitFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#faf9f7' }}>
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#faf9f7' }}>
      {/* Header */}
      <header className="border-b border-stone-200" style={{ backgroundColor: '#faf9f7' }}>
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1
                className="text-2xl font-semibold text-stone-800 tracking-tight cursor-pointer"
                onClick={() => setView('editorial')}
              >
                Permit Pulse
              </h1>
              <p className="text-stone-500 mt-0.5 text-sm">What's disappearing from New York</p>
            </div>
            <nav className="flex gap-1 bg-stone-100 rounded-full p-1">
              <button
                onClick={() => setView('editorial')}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  view === 'editorial' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Stories
              </button>
              <button
                onClick={() => setView('explore')}
                className={`px-4 py-1.5 rounded-full text-sm transition-colors ${
                  view === 'explore' ? 'bg-white text-stone-800 shadow-sm' : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                Explore
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Editorial View */}
      {view === 'editorial' && (
        <main className="max-w-5xl mx-auto px-6 py-10">
          {stats && (
            <div className="mb-12 text-center">
              <p className="text-stone-600 text-lg">
                <span className="text-4xl font-light text-stone-800 block mb-2">
                  {stats.total.toLocaleString()}
                </span>
                building permits tracked across New York City
              </p>
            </div>
          )}

          {featured.length > 0 && (
            <section className="mb-16">
              <FeaturedPermit permit={featured[0]} />
            </section>
          )}

          <section className="mb-16">
            <h2 className="text-lg font-medium text-stone-800 mb-4">By Borough</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {hotspots.map((hotspot) => (
                <HotspotCard key={hotspot.borough} hotspot={hotspot} onClick={() => handleBoroughClick(hotspot.borough)} />
              ))}
            </div>
          </section>

          {featured.length > 1 && (
            <section className="mb-16">
              <h2 className="text-lg font-medium text-stone-800 mb-4">Notable Permits</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {featured.slice(1, 5).map((permit) => (
                  <PermitCard key={permit.id} permit={permit} expanded={true} />
                ))}
              </div>
            </section>
          )}

          <section className="text-center py-12 border-t border-stone-200">
            <p className="text-stone-500 mb-4">Want to explore all {stats?.total.toLocaleString()} permits?</p>
            <button
              onClick={() => setView('explore')}
              className="px-6 py-2 bg-stone-800 text-white rounded-full text-sm hover:bg-stone-700 transition-colors"
            >
              Open Data Explorer
            </button>
          </section>
        </main>
      )}

      {/* Explore View */}
      {view === 'explore' && (
        <main className="max-w-6xl mx-auto px-6 py-8">
          <Filters filters={filters} onChange={handleFilterChange} />

          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8 border border-stone-100" style={{ height: '400px' }}>
            <PermitMap
              permits={paginatedPermits}
              onPermitClick={(p) => setSelectedPermit(selectedPermit?.id === p.id ? null : p)}
            />
          </div>

          <div className="mb-6">
            <p className="text-stone-600">
              <span className="font-medium text-stone-800">{filteredPermits.length.toLocaleString()}</span> permits
              {filters.type && <span> · {filters.type === 'new_building' ? 'New construction' : 'Demolitions'}</span>}
              {filters.borough && <span> in {filters.borough}</span>}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {paginatedPermits.map((permit) => (
              <PermitCard
                key={permit.id}
                permit={permit}
                onClick={() => setSelectedPermit(selectedPermit?.id === permit.id ? null : permit)}
                expanded={selectedPermit?.id === permit.id}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-12">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-5 py-2 bg-white rounded-full shadow-sm border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-stone-500">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-5 py-2 bg-white rounded-full shadow-sm border border-stone-200 text-sm text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </main>
      )}

      <footer className="border-t border-stone-200 mt-16">
        <div className="max-w-5xl mx-auto px-6 py-8 text-center">
          <p className="text-sm text-stone-400">Data from NYC Department of Buildings · Updated daily</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
