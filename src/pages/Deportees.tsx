import { useMemo } from 'react';
import { useData } from '../hooks/useData';
import TrendLineChart from '../components/charts/TrendLineChart';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import DataTable from '../components/ui/DataTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SourceAttribution from '../components/ui/SourceAttribution';
import StatCard from '../components/ui/StatCard';
import { formatNumber } from '../utils/formatters';
import type { DeporteeRecord } from '../types';

export default function Deportees() {
  const { data, loading } = useData<{ data: DeporteeRecord[] }>('data/deportees/summary.json');

  const records = useMemo(() => data?.data ?? [], [data]);

  const latest = records[records.length - 1];
  const prev = records[records.length - 2];

  const trendData = useMemo(() =>
    records.map(r => ({ ...r, year_label: String(r.year) })),
    [records]
  );

  const sexData = useMemo(() =>
    records.map(r => ({
      year_label: String(r.year),
      Male: r.male,
      Female: r.female,
    })),
    [records]
  );

  const ageData = useMemo(() => {
    if (!latest) return [];
    return [
      { name: 'Under 25', value: latest.age_under_25 },
      { name: '25–34', value: latest.age_25_34 },
      { name: '35–44', value: latest.age_35_44 },
      { name: '45+', value: latest.age_45_plus },
    ];
  }, [latest]);

  const changePct = latest && prev
    ? (((latest.total_deportees - prev.total_deportees) / prev.total_deportees) * 100).toFixed(1)
    : null;

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deportees from Australia</h1>
        <p className="text-gray-600 mt-1">
          New Zealand citizens and residents deported from Australia — annual figures published by NZ Police
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <strong>About this data:</strong> This dataset tracks New Zealand citizens and residents who are deported from
        Australia each year, primarily under Australia's character test provisions (Migration Act 1958, section 501).
        Upon arrival in New Zealand, deportees are assessed by NZ Police. Data is sourced from the NZ Police Deportee
        Report Tableau dashboard and updated annually.
      </div>

      {latest && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            title={`Total Deportees (${latest.year})`}
            value={formatNumber(latest.total_deportees)}
            subtitle={changePct ? `${changePct}% vs prior year` : undefined}
            trendPositive={Number(changePct) < 0}
          />
          <StatCard
            title="Male (proportion)"
            value={`${Math.round((latest.male / latest.total_deportees) * 100)}%`}
            subtitle={`${formatNumber(latest.male)} of ${formatNumber(latest.total_deportees)}`}
          />
          <StatCard
            title="Largest Age Group"
            value="25–34"
            subtitle={`${formatNumber(latest.age_25_34)} in ${latest.year}`}
          />
        </div>
      )}

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Annual Deportees — Trend</h2>
        <TrendLineChart
          data={trendData}
          xKey="year_label"
          lines={[{ key: 'total_deportees', name: 'Total Deportees', color: '#2563eb' }]}
          height={280}
        />
        <SourceAttribution />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">By Sex — Annual</h2>
          <TrendLineChart
            data={sexData}
            xKey="year_label"
            lines={[
              { key: 'Male', name: 'Male', color: '#2563eb' },
              { key: 'Female', name: 'Female', color: '#db2777' },
            ]}
            height={260}
          />
          <SourceAttribution />
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Age Breakdown ({latest?.year})</h2>
          <CategoryBarChart
            data={ageData}
            xKey="name"
            yKey="value"
            height={260}
            horizontal
          />
          <SourceAttribution />
        </section>
      </div>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Data Table</h2>
        <DataTable
          data={records as unknown as Record<string, unknown>[]}
          filename="deportees_from_australia"
        />
      </section>
    </div>
  );
}
