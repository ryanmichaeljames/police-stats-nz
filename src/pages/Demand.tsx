import { useMemo } from 'react';
import { useData } from '../hooks/useData';
import { useFilters } from '../hooks/useFilters';
import FilterBar from '../components/ui/FilterBar';
import StackedAreaChart from '../components/charts/StackedAreaChart';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SourceAttribution from '../components/ui/SourceAttribution';
import DataTable from '../components/ui/DataTable';
import { formatNumber } from '../utils/formatters';
import type { DemandRecord } from '../types';

export default function Demand() {
  const { filters, updateFilter } = useFilters(2022, 2025);
  const { data: demandData, loading } = useData<{ data: DemandRecord[] }>('data/demand/summary.json');

  const filtered = useMemo(() => {
    if (!demandData) return [];
    return demandData.data.filter(r => r.year >= filters.yearFrom && r.year <= filters.yearTo);
  }, [demandData, filters]);

  const totals2024 = useMemo(() => {
    if (!demandData) return { total: 0, crime: 0, non_crime: 0, proactive: 0 };
    const d = demandData.data.filter(r => r.year === 2024);
    return {
      total: d.reduce((s, r) => s + r.total_demand, 0),
      crime: d.reduce((s, r) => s + r.crime_demand, 0),
      non_crime: d.reduce((s, r) => s + r.non_crime_demand, 0),
      proactive: d.reduce((s, r) => s + r.proactive, 0),
    };
  }, [demandData]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Demand & Activity</h1>
        <p className="text-gray-600 mt-1">Monthly police demand volume including crime, non-crime, and proactive activities</p>
      </div>

      <FilterBar filters={filters} onUpdate={updateFilter} showDistrict={false} showOffence={false} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Demand (2024)" value={formatNumber(totals2024.total)} subtitle="All demand types" />
        <StatCard title="Crime Demand (2024)" value={formatNumber(totals2024.crime)} subtitle={`${Math.round(totals2024.crime / totals2024.total * 100)}% of total`} />
        <StatCard title="Non-Crime Demand (2024)" value={formatNumber(totals2024.non_crime)} subtitle={`${Math.round(totals2024.non_crime / totals2024.total * 100)}% of total`} />
        <StatCard title="Proactive Activity (2024)" value={formatNumber(totals2024.proactive)} subtitle={`${Math.round(totals2024.proactive / totals2024.total * 100)}% of total`} />
      </div>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Monthly Demand Trend</h2>
        <StackedAreaChart data={filtered} xKey="month_label" areas={[
          { key: 'crime_demand', name: 'Crime Demand', color: '#dc2626' },
          { key: 'non_crime_demand', name: 'Non-Crime Demand', color: '#2563eb' },
          { key: 'proactive', name: 'Proactive', color: '#16a34a' },
        ]} height={350} />
        <SourceAttribution />
      </section>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Data Table</h2>
        <DataTable data={filtered} filename="demand_summary" />
      </section>
    </div>
  );
}
