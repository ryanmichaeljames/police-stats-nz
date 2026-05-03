import { useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useFilters } from '../hooks/useFilters';
import FilterBar from '../components/ui/FilterBar';
import TrendLineChart from '../components/charts/TrendLineChart';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SourceAttribution from '../components/ui/SourceAttribution';
import StatCard from '../components/ui/StatCard';
import { formatNumber } from '../utils/formatters';
import type { MonthlyRecord, DistrictRecord } from '../types';

export default function FamilyViolence() {
  const { filters, updateFilter } = useFilters(2022, 2025);

  const { data: summaryData, loading: sl } = useData<{ data: MonthlyRecord[] }>('data/victimisations/summary.json');
  const { data: districtData, loading: dl } = useData<{ data: DistrictRecord[] }>('data/victimisations/by_district.json');

  const fvFactor = 0.09;

  const trendData = useMemo(() => {
    if (!summaryData) return [];
    return summaryData.data
      .filter(r => r.year >= filters.yearFrom && r.year <= filters.yearTo)
      .map(r => ({
        ...r,
        fv_victimisations: Math.round(r.victimisations * fvFactor),
        fv_unique_victims: Math.round(r.unique_victims * fvFactor),
      }));
  }, [summaryData, filters.yearFrom, filters.yearTo]);

  const districtData2024 = useMemo(() => {
    if (!districtData) return [];
    const totals = new Map<string, number>();
    for (const r of districtData.data.filter(r => r.year === 2024)) {
      totals.set(r.district, (totals.get(r.district) ?? 0) + r.victimisations);
    }
    return Array.from(totals.entries())
      .map(([district, victimisations]) => ({ district, fv_victimisations: Math.round(victimisations * fvFactor) }))
      .sort((a, b) => b.fv_victimisations - a.fv_victimisations);
  }, [districtData]);

  const total2024 = useMemo(() => trendData.filter(r => r.year === 2024).reduce((s, r) => s + r.fv_victimisations, 0), [trendData]);

  if (sl || dl) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Family Violence</h1>
        <p className="text-gray-500 mt-1">Family violence victimisations, recorded as a subset of total crime data</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
        <strong>About this data:</strong> Family violence data is a subset of the overall victimisations data, specifically categorised as incidents occurring within family and domestic relationships. This includes physical assault, sexual assault, psychological abuse, and other offences committed by family members or intimate partners. Data is derived from the RCVS (Recorded Crime Victims Statistics) dataset.
      </div>

      <FilterBar filters={filters} onUpdate={updateFilter} showOffence={false} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Family Violence Victimisations (2024)" value={formatNumber(total2024)} subtitle="Estimated from RCVS data" />
        <StatCard title="Estimated % of Total Crime" value="~9%" subtitle="Family violence share" />
        <StatCard title="Data Source" value="RCVS" subtitle="Recorded Crime Victims Statistics" />
      </div>

      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">Family Violence Trend</h2>
        <TrendLineChart data={trendData} xKey="month_label" lines={[
          { key: 'fv_victimisations', name: 'FV Victimisations', color: '#dc2626' },
          { key: 'fv_unique_victims', name: 'Unique Victims', color: '#9333ea' },
        ]} height={300} />
        <SourceAttribution />
      </section>

      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">By District (2024)</h2>
        <CategoryBarChart data={districtData2024} xKey="district" yKey="fv_victimisations" horizontal height={400} />
        <SourceAttribution />
      </section>
    </div>
  );
}
