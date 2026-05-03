import { DISTRICTS, OFFENCE_CATEGORIES, YEAR_RANGE } from '../../utils/constants';
import type { Filters } from '../../hooks/useFilters';

interface FilterBarProps {
  filters: Filters;
  onUpdate: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  showDistrict?: boolean;
  showOffence?: boolean;
}

export default function FilterBar({ filters, onUpdate, showDistrict = true, showOffence = true }: FilterBarProps) {
  const years = Array.from({ length: YEAR_RANGE.max - YEAR_RANGE.min + 1 }, (_, i) => YEAR_RANGE.min + i);

  return (
    <div className="bg-white border border-gray-200 p-4 mb-6 flex flex-wrap gap-4 items-end">
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-1">From Year</label>
        <select
          value={filters.yearFrom}
          onChange={e => onUpdate('yearFrom', Number(e.target.value))}
          className="border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-black"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-1">To Year</label>
        <select
          value={filters.yearTo}
          onChange={e => onUpdate('yearTo', Number(e.target.value))}
          className="border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-black"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      {showDistrict && (
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-1">District</label>
          <select
            value={filters.district}
            onChange={e => onUpdate('district', e.target.value)}
            className="border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-black"
          >
            <option value="All Districts">All Districts</option>
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      )}
      {showOffence && (
        <div>
          <label className="block text-xs font-mono uppercase tracking-widest text-gray-400 mb-1">Offence Category</label>
          <select
            value={filters.offenceCategory}
            onChange={e => onUpdate('offenceCategory', e.target.value)}
            className="border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-black"
          >
            <option value="All Offences">All Offences</option>
            {OFFENCE_CATEGORIES.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      )}
    </div>
  );
}
