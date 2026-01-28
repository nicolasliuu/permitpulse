import type { Permit } from '../api/permits';
import StreetView from './StreetView';

interface FeaturedPermitProps {
  permit: Permit;
}

const typeConfig = {
  demolition: {
    label: 'Featured Demolition',
    color: '#c2410c',
    narrative: (p: Permit) => {
      if (p.stories && p.stories >= 5) {
        return `A ${p.stories}-story building in ${p.borough}. Structures like this often house dozens of residents and small businesses.`;
      }
      return `Another piece of ${p.borough}'s architectural history, scheduled for demolition.`;
    },
  },
  new_building: {
    label: 'New Development',
    color: '#059669',
    narrative: (p: Permit) => {
      const stories = p.stories || 0;
      if (stories >= 20) {
        return `A ${stories}-story tower rising in ${p.borough}. Projects like this reshape the skyline and transform neighborhoods.`;
      }
      if (stories >= 10) {
        return `${stories} stories of new construction in ${p.borough}. Watch this space.`;
      }
      return `New construction coming to ${p.borough}.`;
    },
  },
};

export default function FeaturedPermit({ permit }: FeaturedPermitProps) {
  const hasCoordinates = permit.lat && permit.lng;
  const config = typeConfig[permit.type as keyof typeof typeConfig] || {
    label: 'Featured',
    color: '#6b7280',
    narrative: () => 'A notable permit in New York City.',
  };

  return (
    <article className="bg-white rounded-2xl shadow-lg overflow-hidden border border-stone-100">
      {hasCoordinates ? (
        <div className="h-64 md:h-80">
          <StreetView
            lat={permit.lat!}
            lng={permit.lng!}
            address={permit.address || undefined}
            imageUrl={permit.image_url}
            imageDate={permit.image_date}
          />
        </div>
      ) : (
        <div className="h-64 md:h-80 bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
          <span className="text-stone-400">No street imagery available</span>
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="mb-4">
          <span className="text-xs font-medium tracking-wider uppercase" style={{ color: config.color }}>
            {config.label}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-semibold text-stone-800 mb-2">
          {permit.address || 'Address unavailable'}
        </h2>

        <p className="text-stone-500 mb-4">
          {permit.borough}
          {permit.stories && permit.stories > 0 && <span> · {permit.stories} stories</span>}
        </p>

        {permit.description && (
          <p className="text-stone-600 leading-relaxed mb-6">{permit.description.toLowerCase()}</p>
        )}

        <div className="bg-stone-50 rounded-xl p-4">
          <p className="text-sm text-stone-600">{config.narrative(permit)}</p>
        </div>
      </div>
    </article>
  );
}
