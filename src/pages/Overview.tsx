import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import StatCard from '../components/ui/StatCard';
import TrendLineChart from '../components/charts/TrendLineChart';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SourceAttribution from '../components/ui/SourceAttribution';
import { formatNumber, formatChange } from '../utils/formatters';
import type { MonthlyRecord, OffenceRecord, Metadata } from '../types';

export default function Overview() {
  const { data: summaryData, loading: sl } = useData<{ data: MonthlyRecord[] }>('data/victimisations/summary.json');
  const { data: offenceData, loading: ol } = useData<{ data: OffenceRecord[] }>('data/victimisations/by_offence.json');
  const { data: metadata } = useData<Metadata>('data/metadata.json');

  const ytdVictimisations = useMemo(() => {
    if (!summaryData) return 0;
    return summaryData.data.filter(r => r.year === 2025).reduce((s, r) => s + r.victimisations, 0);
  }, [summaryData]);

  const prevYearVictimisations = useMemo(() => {
    if (!summaryData) return 0;
    return summaryData.data.filter(r => r.year === 2024).reduce((s, r) => s + r.victimisations, 0);
  }, [summaryData]);

  const last12Months = useMemo(() => {
    if (!summaryData) return [];
    return summaryData.data.slice(-12);
  }, [summaryData]);

  const top5Offences = useMemo(() => {
    if (!offenceData) return [];
    const totals = new Map<string, number>();
    for (const r of offenceData.data.filter(r => r.year === 2024)) {
      totals.set(r.offence_category, (totals.get(r.offence_category) ?? 0) + r.victimisations);
    }
    return Array.from(totals.entries())
      .map(([offence_category, victimisations]) => ({ offence_category, victimisations }))
      .sort((a, b) => b.victimisations - a.victimisations)
      .slice(0, 5);
  }, [offenceData]);

  const mostCommonOffence = top5Offences[0]?.offence_category ?? 'Loading...';

  if (sl || ol) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Police Stats NZ</h1>
        <p className="mt-2 text-gray-600">Exploring publicly available New Zealand Police statistics</p>
        {metadata && (
          <p className="mt-1 text-sm text-gray-500">
            Data last updated: <strong>{metadata.last_updated}</strong> | Coverage: {metadata.data_from} to {metadata.data_to}
          </p>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>Disclaimer:</strong> This is an independent website. Data sourced from NZ Police via policedata.nz. This site is not affiliated with or endorsed by NZ Police. Data is presented for educational and research purposes only.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Victimisations (YTD 2025)"
          value={formatNumber(ytdVictimisations)}
          subtitle="Jan–Apr 2025"
          trend={formatChange(ytdVictimisations * 3, prevYearVictimisations)}
          trendPositive={ytdVictimisations * 3 > prevYearVictimisations}
        />
        <StatCard
          title="Annual Victimisations (2024)"
          value={formatNumber(prevYearVictimisations)}
          subtitle="Full year 2024"
        />
        <StatCard
          title="Most Common Offence"
          value={mostCommonOffence.split(' ').slice(0, 3).join(' ')}
          subtitle={mostCommonOffence}
        />
        <StatCard
          title="Districts"
          value="12"
          subtitle="NZ Police districts"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Victimisations — Last 12 Months</h2>
          <TrendLineChart
            data={last12Months}
            xKey="month_label"
            lines={[
              { key: 'victimisations', name: 'Victimisations', color: '#2563eb' },
              { key: 'unique_victims', name: 'Unique Victims', color: '#7c3aed' },
            ]}
          />
          <SourceAttribution />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Top 5 Offence Categories (2024)</h2>
          <CategoryBarChart
            data={top5Offences}
            xKey="offence_category"
            yKey="victimisations"
            height={280}
            horizontal
          />
          <SourceAttribution />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">Explore the Data</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { to: '/victimisations', label: 'Victimisations' },
            { to: '/offenders', label: 'Offenders' },
            { to: '/family-violence', label: 'Family Violence' },
            { to: '/demand', label: 'Demand & Activity' },
            { to: '/data-explorer', label: 'Data Explorer' },
            { to: '/about', label: 'About' },
          ].map(link => (
            <Link key={link.to} to={link.to} className="bg-white border border-blue-200 rounded px-3 py-2 text-sm text-blue-700 text-center hover:bg-blue-100 transition-colors">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
