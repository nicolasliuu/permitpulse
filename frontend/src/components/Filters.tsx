import type { PermitFilters } from '../api/permits';

interface FiltersProps {
  filters: PermitFilters;
  onChange: (filters: PermitFilters) => void;
}

const permitTypes = [
  { value: '', label: 'All permits' },
  { value: 'demolition', label: 'Demolitions' },
  { value: 'new_building', label: 'New construction' },
];

const boroughs = [
  { value: '', label: 'All of NYC' },
  { value: 'Manhattan', label: 'Manhattan' },
  { value: 'Brooklyn', label: 'Brooklyn' },
  { value: 'Queens', label: 'Queens' },
  { value: 'Bronx', label: 'Bronx' },
  { value: 'Staten Island', label: 'Staten Island' },
];

export default function Filters({ filters, onChange }: FiltersProps) {
  const handleChange = (key: keyof PermitFilters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const selectClass =
    'bg-white border border-stone-200 rounded-full px-4 py-2 text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-300 appearance-none cursor-pointer pr-8';
  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2378716c'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.75rem center',
    backgroundSize: '1rem',
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <span className="text-stone-500 text-sm">Show</span>
      <select
        value={filters.type || ''}
        onChange={(e) => handleChange('type', e.target.value)}
        className={selectClass}
        style={selectStyle}
      >
        {permitTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
      <span className="text-stone-500 text-sm">in</span>
      <select
        value={filters.borough || ''}
        onChange={(e) => handleChange('borough', e.target.value)}
        className={selectClass}
        style={selectStyle}
      >
        {boroughs.map((borough) => (
          <option key={borough.value} value={borough.value}>
            {borough.label}
          </option>
        ))}
      </select>
    </div>
  );
}
