import type { Permit } from '../api/permits';
import StreetView from './StreetView';

interface PermitCardProps {
  permit: Permit;
  onClick?: () => void;
  expanded?: boolean;
}

const typeConfig = {
  demolition: {
    label: 'Demolition',
    color: '#c2410c',
    bgColor: '#fff7ed',
  },
  new_building: {
    label: 'New Construction',
    color: '#059669',
    bgColor: '#ecfdf5',
  },
};

export default function PermitCard({ permit, onClick, expanded = false }: PermitCardProps) {
  const hasCoordinates = permit.lat && permit.lng;
  const config = typeConfig[permit.type as keyof typeof typeConfig] || {
    label: permit.type || 'Permit',
    color: '#6b7280',
    bgColor: '#f3f4f6',
  };

  return (
    <article
      className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden cursor-pointer border border-stone-100"
      onClick={onClick}
    >
      {expanded && hasCoordinates && (
        <div className="h-48">
          <StreetView lat={permit.lat!} lng={permit.lng!} address={permit.address || undefined} />
        </div>
      )}

      <div className="p-5">
        <div className="mb-3">
          <span
            className="text-xs font-medium tracking-wider uppercase px-2 py-1 rounded-full"
            style={{ color: config.color, backgroundColor: config.bgColor }}
          >
            {config.label}
          </span>
        </div>

        <div className="mb-3">
          <h3 className="font-medium text-stone-800 text-lg leading-snug">
            {permit.address || 'Address not listed'}
          </h3>
          <p className="text-stone-500 text-sm mt-0.5">{permit.borough}</p>
        </div>

        {permit.description && (
          <p className="text-stone-600 text-sm leading-relaxed mb-4 line-clamp-2">
            {permit.description.toLowerCase()}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400">
          {permit.stories && permit.stories > 0 && (
            <span className="bg-stone-50 px-2.5 py-1 rounded-full">
              {permit.stories} {permit.stories === 1 ? 'story' : 'stories'}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
