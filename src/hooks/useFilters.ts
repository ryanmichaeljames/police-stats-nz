import { useState } from 'react';

export interface Filters {
  yearFrom: number;
  yearTo: number;
  district: string;
  offenceCategory: string;
}

export function useFilters(defaultYearFrom = 2022, defaultYearTo = 2025) {
  const [filters, setFilters] = useState<Filters>({
    yearFrom: defaultYearFrom,
    yearTo: defaultYearTo,
    district: 'All Districts',
    offenceCategory: 'All Offences',
  });

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return { filters, updateFilter };
}
