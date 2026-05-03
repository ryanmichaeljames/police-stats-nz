import { useState } from 'react';
import { useData } from '../hooks/useData';
import DataTable from '../components/ui/DataTable';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import DownloadButton from '../components/ui/DownloadButton';
import { exportToJSON } from '../utils/csvExport';

const DATASETS = [
  { label: 'Victimisations: Monthly Summary', path: 'data/victimisations/summary.json', key: 'data' },
  { label: 'Victimisations: By District', path: 'data/victimisations/by_district.json', key: 'data' },
  { label: 'Victimisations: By Offence', path: 'data/victimisations/by_offence.json', key: 'data' },
  { label: 'Offenders: Monthly Summary', path: 'data/offenders/summary.json', key: 'data' },
  { label: 'Offenders: By District', path: 'data/offenders/by_district.json', key: 'data' },
  { label: 'Offenders: By Offence', path: 'data/offenders/by_offence.json', key: 'data' },
  { label: 'Demand: Monthly Summary', path: 'data/demand/summary.json', key: 'data' },
];

export default function DataExplorer() {
  const [selected, setSelected] = useState(0);
  const dataset = DATASETS[selected];
  const { data, loading } = useData<Record<string, unknown[]>>(dataset.path);

  const rows = data ? (data[dataset.key] as Record<string, unknown>[] || []) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Data Explorer</h1>
        <p className="text-gray-600 mt-1">Browse, sort, and download all available datasets</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Dataset</label>
        <select
          value={selected}
          onChange={e => setSelected(Number(e.target.value))}
          className="border rounded px-3 py-2 text-sm w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DATASETS.map((d, i) => <option key={i} value={i}>{d.label}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">{dataset.label}</h2>
            <DownloadButton
              onClick={() => exportToJSON(data, `${dataset.label.replace(/[^a-z0-9]/gi, '_')}.json`)}
              label="Download JSON"
              variant="json"
            />
          </div>
          <DataTable data={rows} filename={dataset.label.replace(/[^a-z0-9]/gi, '_')} />
        </div>
      )}
    </div>
  );
}
