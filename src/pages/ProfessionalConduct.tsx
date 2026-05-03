import { useMemo, useState } from 'react';
import { useData } from '../hooks/useData';
import TrendLineChart from '../components/charts/TrendLineChart';
import CategoryBarChart from '../components/charts/CategoryBarChart';
import DataTable from '../components/ui/DataTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SourceAttribution from '../components/ui/SourceAttribution';
import StatCard from '../components/ui/StatCard';
import { formatNumber } from '../utils/formatters';
import type { ConductSummaryRecord, ConductDistrictRecord, ConductAllegationRecord } from '../types';

export default function ProfessionalConduct() {
  const { data: summaryData, loading: l1 } = useData<{ data: ConductSummaryRecord[] }>('data/conduct/summary.json');
  const { data: districtData, loading: l2 } = useData<{ data: ConductDistrictRecord[] }>('data/conduct/by_district.json');
  const { data: allegationData, loading: l3 } = useData<{ data: ConductAllegationRecord[] }>('data/conduct/by_allegation.json');

  const [selectedPeriod, setSelectedPeriod] = useState<string>('Dec 2024');

  const loading = l1 || l2 || l3;

  const summaryRecords = useMemo(() => summaryData?.data ?? [], [summaryData]);
  const districtRecords = useMemo(() => districtData?.data ?? [], [districtData]);
  const allegationRecords = useMemo(() => allegationData?.data ?? [], [allegationData]);

  // All available periods for the selector (Dec year-end releases only for comparability)
  const periodOptions = useMemo(() =>
    summaryRecords.map(r => r.period),
    [summaryRecords]
  );

  // Annual (Q4 / Dec) records for trend charts
  const annualRecords = useMemo(() =>
    summaryRecords.filter(r => r.quarter === 4),
    [summaryRecords]
  );

  // Latest record for stat cards
  const latest = summaryRecords[summaryRecords.length - 1];
  const latestAnnual = annualRecords[annualRecords.length - 1];
  const prevAnnual = annualRecords[annualRecords.length - 2];

  const yoyChange = latestAnnual && prevAnnual
    ? (((latestAnnual.incidents - prevAnnual.incidents) / prevAnnual.incidents) * 100).toFixed(1)
    : null;

  const resolutionRate = latestAnnual
    ? Math.round((latestAnnual.resolved / latestAnnual.incidents) * 100)
    : null;

  // District breakdown for selected period
  const districtChart = useMemo(() => {
    const rows = districtRecords.filter(r => r.period === selectedPeriod);
    return rows
      .sort((a, b) => b.incidents - a.incidents)
      .map(r => ({ name: r.district, value: r.incidents }));
  }, [districtRecords, selectedPeriod]);

  // Allegation breakdown for selected period
  const allegationChart = useMemo(() => {
    const rows = allegationRecords.filter(r => r.period === selectedPeriod);
    return rows
      .sort((a, b) => b.incidents - a.incidents)
      .map(r => ({ name: r.allegation_category, value: r.incidents }));
  }, [allegationRecords, selectedPeriod]);

  // Trend: incidents + involved staff over annual periods
  const trendData = useMemo(() =>
    annualRecords.map(r => ({
      period: String(r.year),
      incidents: r.incidents,
      involved_staff: r.involved_staff,
      resolved: r.resolved,
      ongoing: r.ongoing,
    })),
    [annualRecords]
  );

  // Selected period's summary record for the info line
  const selectedRecord = useMemo(() =>
    summaryRecords.find(r => r.period === selectedPeriod),
    [summaryRecords, selectedPeriod]
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-black">Professional Conduct</h1>
        <p className="text-gray-500 mt-1">
          Incidents and allegations involving NZ Police employees, tracked through the IAPro professional standards system
        </p>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
        <strong>Note on data currency:</strong> This page displays sample/estimated data pending automated PDF extraction.
        NZ Police publishes conduct statistics as PDF tables quarterly (with typical publication lags of 2 to 13 months). Data is sourced from the{' '}
        <a
          href="https://www.police.govt.nz/about-us/about-new-zealand-police/police-professional-conduct/professional-conduct-statistics"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium"
        >
          NZ Police Professional Conduct Statistics
        </a>
        {' '}page and recorded in the IAPro system. Outcome information (sustained or not sustained) is not published.
      </div>

      {latestAnnual && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={`Incidents (${latestAnnual.year} full year)`}
            value={formatNumber(latestAnnual.incidents)}
            trend={yoyChange ? `${yoyChange}%` : undefined}
            trendPositive={Number(yoyChange) > 0}
          />
          <StatCard
            title="Involved Staff"
            value={formatNumber(latestAnnual.involved_staff)}
            subtitle={`${latestAnnual.year} full year`}
          />
          <StatCard
            title="Resolution Rate"
            value={`${resolutionRate}%`}
            subtitle={`${formatNumber(latestAnnual.resolved)} resolved of ${formatNumber(latestAnnual.incidents)}`}
          />
          <StatCard
            title="Ongoing at Year-End"
            value={formatNumber(latestAnnual.ongoing)}
            subtitle="Unresolved as at publication"
          />
        </div>
      )}

      {latest && latest !== latestAnnual && (
        <div className="bg-gray-50 border border-gray-200 p-4 text-sm text-gray-700">
          <strong>Latest release: {latest.period}.</strong> {formatNumber(latest.incidents)} incidents,{' '}
          {formatNumber(latest.involved_staff)} involved staff (year to date as at {latest.period})
        </div>
      )}

      {/* Annual trend */}
      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">Annual Trend: Incidents and Involved Staff</h2>
        <TrendLineChart
          data={trendData}
          xKey="period"
          lines={[
            { key: 'incidents', name: 'Incidents', color: '#dc2626' },
            { key: 'involved_staff', name: 'Involved Staff', color: '#f97316' },
            { key: 'resolved', name: 'Resolved', color: '#16a34a' },
            { key: 'ongoing', name: 'Ongoing', color: '#9333ea' },
          ]}
          height={300}
        />
        <SourceAttribution />
      </section>

      {/* Period selector + breakdowns */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-mono uppercase tracking-widest text-gray-400">View breakdown for period:</label>
        <select
          className="border border-gray-200 px-3 py-1.5 text-sm focus:outline-none focus:border-black"
          value={selectedPeriod}
          onChange={e => setSelectedPeriod(e.target.value)}
        >
          {periodOptions.filter(p => districtRecords.some(r => r.period === p)).map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        {selectedRecord && (
          <span className="text-sm text-gray-500">
            {formatNumber(selectedRecord.incidents)} incidents · {formatNumber(selectedRecord.involved_staff)} involved staff
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allegation category breakdown */}
        <section className="bg-white border border-gray-200 p-6">
          <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-1">By Allegation Category</h2>
          <p className="text-xs text-gray-500 mb-4">Year to date incidents for {selectedPeriod}</p>
          {allegationChart.length > 0 ? (
            <CategoryBarChart
              data={allegationChart}
              xKey="name"
              yKey="value"
              height={300}
              horizontal
            />
          ) : (
            <p className="text-sm text-gray-400 italic">No allegation data for this period</p>
          )}
          <SourceAttribution />
        </section>

        {/* District breakdown */}
        <section className="bg-white border border-gray-200 p-6">
          <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-1">By District</h2>
          <p className="text-xs text-gray-500 mb-4">Year to date incidents for {selectedPeriod}</p>
          {districtChart.length > 0 ? (
            <CategoryBarChart
              data={districtChart}
              xKey="name"
              yKey="value"
              height={300}
              horizontal
            />
          ) : (
            <p className="text-sm text-gray-400 italic">No district data for this period</p>
          )}
          <SourceAttribution />
        </section>
      </div>

      {/* Allegation definitions */}
      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-3">Allegation Category Definitions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {[
            ['Use of Force on Duty', 'Exceeding necessary force during policing duties'],
            ['Arrest/Custodial', 'Incorrect arrest, detention, or custody procedures'],
            ['Searches', 'Seizure, retention, or return of property/evidence'],
            ['Significant Event', 'Pursuits, in-custody incidents, firearm/Taser use, dog bites'],
            ['Traffic Offences', 'Illegal or inappropriate use of Police vehicles on duty'],
            ['Service Failure', 'Failure to provide adequate service to the public'],
            ['Unprofessional Behaviour', 'Professionalism, tolerance, and fairness issues (on or off duty)'],
            ['Breach of Official Conduct', 'Failures in expected standards when dealing with the public'],
            ['Workplace Behaviour', 'Expected conduct standards with colleagues'],
            ['Use of Police Resources', 'Correct use of Police information and equipment'],
            ['Off Duty Behaviour', 'Maintaining Police reputation while off duty'],
          ].map(([cat, desc]) => (
            <div key={cat} className="flex gap-2">
              <span className="font-medium text-gray-700 min-w-0 shrink-0">·</span>
              <span><span className="font-medium text-gray-800">{cat}:</span> <span className="text-gray-600">{desc}</span></span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Source:{' '}
          <a
            href="https://www.police.govt.nz/about-us/about-new-zealand-police/police-professional-conduct/police-professional-conduct-glossary"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            NZ Police Professional Conduct Glossary
          </a>
        </p>
      </section>

      {/* Data tables */}
      <section className="bg-white border border-gray-200 p-6">
        <h2 className="text-sm font-mono uppercase tracking-widest text-gray-400 mb-4">Summary Data Table</h2>
        <DataTable
          data={summaryRecords as unknown as Record<string, unknown>[]}
          filename="conduct_summary"
        />
      </section>
    </div>
  );
}
