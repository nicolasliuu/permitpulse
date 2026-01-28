import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import type { Permit } from '../api/permits';

interface PermitMapProps {
  permits: Permit[];
  onPermitClick?: (permit: Permit) => void;
}

const typeColors = {
  demolition: '#c2410c',
  new_building: '#059669',
};

export default function PermitMap({ permits, onPermitClick }: PermitMapProps) {
  const validPermits = permits.filter((p) => p.lat && p.lng);

  const center: [number, number] = [40.7128, -74.006];

  return (
    <MapContainer
      center={center}
      zoom={11}
      className="h-full w-full"
      style={{ minHeight: '400px' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {validPermits.map((permit) => {
        const color = typeColors[permit.type as keyof typeof typeColors] || '#6b7280';

        return (
          <CircleMarker
            key={permit.id}
            center={[permit.lat!, permit.lng!]}
            radius={Math.min(4 + (permit.stories || 0) / 2, 12)}
            pathOptions={{
              color: color,
              fillColor: color,
              fillOpacity: 0.6,
              weight: 1,
            }}
            eventHandlers={{
              click: () => onPermitClick?.(permit),
            }}
          >
            <Popup>
              <div className="text-sm p-1">
                <div className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color }}>
                  {permit.type === 'new_building' ? 'New Construction' : 'Demolition'}
                </div>
                <div className="font-medium text-stone-800">{permit.address}</div>
                <div className="text-stone-500 text-xs mt-1">
                  {permit.borough}
                  {permit.stories && permit.stories > 0 && ` · ${permit.stories} stories`}
                </div>
                {permit.description && (
                  <div className="text-stone-600 text-xs mt-2 max-w-[200px]">
                    {permit.description.toLowerCase().slice(0, 100)}...
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
