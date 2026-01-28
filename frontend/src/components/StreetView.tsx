import { useState, useEffect } from 'react';

interface StreetViewProps {
  lat: number;
  lng: number;
  address?: string;
}

interface MapillaryImage {
  id: string;
  thumb_1024_url: string;
  captured_at: number;
  compass_angle: number;
  geometry: {
    coordinates: [number, number];
  };
}

const MAPILLARY_TOKEN = import.meta.env.VITE_MAPILLARY_ACCESS_TOKEN || '';

function calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(dLon);

  let bearing = toDeg(Math.atan2(y, x));
  return (bearing + 360) % 360;
}

export default function StreetView({ lat, lng, address }: StreetViewProps) {
  const [image, setImage] = useState<MapillaryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!MAPILLARY_TOKEN) {
      setLoading(false);
      return;
    }

    async function fetchMapillaryImage() {
      setLoading(true);
      setError(false);

      try {
        const radius = 0.001;
        const bbox = `${lng - radius},${lat - radius},${lng + radius},${lat + radius}`;

        const response = await fetch(
          `https://graph.mapillary.com/images?` +
            `access_token=${MAPILLARY_TOKEN}` +
            `&fields=id,thumb_1024_url,captured_at,compass_angle,geometry` +
            `&bbox=${bbox}` +
            `&limit=20`
        );

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();

        if (data.data && data.data.length > 0) {
          let bestImage = data.data[0];
          let bestScore = Infinity;

          for (const img of data.data) {
            if (!img.geometry?.coordinates || img.compass_angle === undefined) continue;

            const [imgLon, imgLat] = img.geometry.coordinates;
            const bearingToBuilding = calculateBearing(imgLat, imgLon, lat, lng);

            let angleDiff = Math.abs(img.compass_angle - bearingToBuilding);
            if (angleDiff > 180) angleDiff = 360 - angleDiff;

            if (angleDiff < bestScore) {
              bestScore = angleDiff;
              bestImage = img;
            }
          }

          setImage(bestImage);
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchMapillaryImage();
  }, [lat, lng]);

  if (!MAPILLARY_TOKEN) {
    return (
      <div className="bg-stone-100 h-full flex items-center justify-center">
        <p className="text-stone-400 text-sm">Street imagery unavailable</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-stone-100 h-full flex items-center justify-center">
        <div className="animate-pulse text-stone-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className="bg-stone-100 h-full flex items-center justify-center">
        <p className="text-stone-400 text-sm">No street imagery available</p>
      </div>
    );
  }

  const captureDate = new Date(image.captured_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="relative h-full">
      <img
        src={image.thumb_1024_url}
        alt={`Street view of ${address || 'location'}`}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <p className="text-white/90 text-sm font-medium">{address}</p>
        <p className="text-white/60 text-xs mt-1">Captured {captureDate}</p>
      </div>
    </div>
  );
}
