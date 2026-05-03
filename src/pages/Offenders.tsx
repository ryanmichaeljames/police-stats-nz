import { useMemo, useState } from 'react';
import { useData } from '../hooks/useData';
import { useFilters } from '../hooks/useFilters';
import FilterBar from '../components/ui/FilterBar';
import TrendLineChart from '../components/charts/TrendLineChart';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import DemographicChart from '../components/charts/DemographicChart';
import YoYChart from '../components/charts/YoYChart';
import DataTable from '../components/ui/DataTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SourceAttribution from '../components/ui/SourceAttribution';
import type { OffenderMonthlyRecord, OffenderDistrictRecord, OffenderOffenceRecord, OffenderDemographicsData } from '../types';

export default function Offenders() {
  const { filters, updateFilter } = useFilters(2022, 2025);
  const [demoTab, setDemoTab] = useState<'age' | 'sex' | 'ethnicity'>('sex');

  const { data: summaryData, loading: sl } = useData<{ data: OffenderMonthlyRecord[] }>('data/offenders/summary.json');
  const { data: districtData, loading: dl } = useData<{ data: OffenderDistrictRecord[] }>('data/offenders/by_district.json');
  const { data: offenceData, loading: ol } = useData<{ data: OffenderOffenceRecord[] }>('data/offenders/by_offence.json');
  const { data: demoData, loading: deml } = useData<OffenderDemographicsData>('data/offenders/demographics.json');

  const trendData = useMemo(() => {
    if (!summaryData) return [];
    return summaryData.data.filter(r => r.year >= filters.yearFrom && r.year <= filters.yearTo);
  }, [summaryData, filters.yearFrom, filters.yearTo]);

  const districtChartData = useMemo(() => {
    if (!districtData) return [];
    const totals = new Map<string, number>();
    for (const r of districtData.data.filter(r => r.year === filters.yearTo)) {
      totals.set(r.district, (totals.get(r.district) ?? 0) + r.proceedings);
    }
    return Array.from(totals.entries())
      .map(([district, proceedings]) => ({ district, proceedings }))
      .sort((a, b) => b.proceedings - a.proceedings);
  }, [districtData, filters.yearTo]);

  const offenceChartData = useMemo(() => {
    if (!offenceData) return [];
    const totals = new Map<string, number>();
    for (const r of offenceData.data.filter(r => r.year === filters.yearTo)) {
      totals.set(r.offence_category, (totals.get(r.offence_category) ?? 0) + r.proceedings);
    }
    return Array.from(totals.entries())
      .map(([offence_category, proceedings]) => ({ offence_category, proceedings }))
      .sort((a, b) => b.proceedings - a.proceedings);
  }, [offenceData, filters.yearTo]);

  const yoyData = useMemo(() => {
    if (!summaryData) return [];
    return [2022, 2023, 2024].map(y => ({
      year: String(y),
      proceedings: summaryData.data.filter(r => r.year === y).reduce((s, r) => s + r.proceedings, 0),
    }));
  }, [summaryData]);

  const demoChartData = useMemo(() => {
    if (!demoData) return [];
    const year = filters.yearTo;
    if (demoTab === 'age') return demoData.by_age.filter(r => r.year === year).map(r => ({ name: r.age_group, value: r.proceedings }));
    if (demoTab === 'sex') return demoData.by_sex.filter(r => r.year === year).map(r => ({ name: r.sex, value: r.proceedings }));
    return demoData.by_ethnicity.filter(r => r.year === year).map(r => ({ name: r.ethnicity, value: r.proceedings }));
  }, [demoData, demoTab, filters.yearTo]);

  if (sl || dl || ol || deml) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Offenders</h1>
        <p className="text-gray-600 mt-1">Offender-focused proceedings data from the Recorded Crime Offenders Statistics (RCOS)</p>
      </div>

      <FilterBar filters={filters} onUpdate={updateFilter} />

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Proceedings Over Time</h2>
        <TrendLineChart data={trendData} xKey="month_label" lines={[
          { key: 'proceedings', name: 'Proceedings', color: '#dc2626' },
          { key: 'unique_offenders', name: 'Unique Offenders', color: '#d97706' },
        ]} height={300} />
        <SourceAttribution />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">By District ({filters.yearTo})</h2>
          <CategoryBarChart data={districtChartData} xKey="district" yKey="proceedings" horizontal height={400} />
          <SourceAttribution />
        </section>
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">By Offence Type ({filters.yearTo})</h2>
          <CategoryBarChart data={offenceChartData} xKey="offence_category" yKey="proceedings" horizontal height={500} />
          <SourceAttribution />
        </section>
      </div>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Demographics ({filters.yearTo})</h2>
        <div className="flex gap-2 mb-4">
          {(['age', 'sex', 'ethnicity'] as const).map(tab => (
            <button key={tab} onClick={() => setDemoTab(tab)} className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${demoTab === tab ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <DemographicChart data={demoChartData} height={320} />
        <SourceAttribution />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Year-over-Year Comparison</h2>
        <YoYChart data={yoyData} xKey="year" bars={[{ key: 'proceedings', name: 'Proceedings', color: '#dc2626' }]} height={280} />
        <SourceAttribution />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Data Table</h2>
        <DataTable data={trendData as unknown as Record<string, unknown>[]} filename="offenders_summary" />
      </section>
    </div>
  );
}
