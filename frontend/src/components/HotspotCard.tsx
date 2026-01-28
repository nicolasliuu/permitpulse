import type { Hotspot } from '../api/permits';

interface HotspotCardProps {
  hotspot: Hotspot;
  onClick?: () => void;
}

export default function HotspotCard({ hotspot, onClick }: HotspotCardProps) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl p-4 text-left hover:shadow-md transition-shadow border border-stone-100 w-full"
    >
      <div className="text-2xl font-light text-stone-800 mb-1">
        {hotspot.count.toLocaleString()}
      </div>
      <div className="text-sm font-medium text-stone-700 mb-2">
        {hotspot.borough}
      </div>
      <div className="text-xs text-stone-400">
        {hotspot.tall_buildings > 0 && (
          <span>{hotspot.tall_buildings} tall buildings · </span>
        )}
        demolition permits
      </div>
    </button>
  );
}
