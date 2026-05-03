import { useState } from 'react';
import { exportToCSV } from '../../utils/csvExport';
import DownloadButton from './DownloadButton';

interface DataTableProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  filename?: string;
  showDownload?: boolean;
}

const PAGE_SIZE = 25;

export default function DataTable({ data, filename = 'data', showDownload = true }: DataTableProps) {
  const [page, setPage] = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  if (!data || data.length === 0) return <p className="text-gray-500">No data available.</p>;

  const headers = Object.keys(data[0]);

  const sorted = sortKey
    ? [...data].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp = typeof av === 'number' && typeof bv === 'number'
          ? av - bv
          : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : data;

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const pageData = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(0);
  };

  return (
    <div>
      {showDownload && (
        <div className="mb-4">
          <DownloadButton
            onClick={() => exportToCSV(data as Record<string, unknown>[], `${filename}.csv`)}
            label="Download CSV"
            variant="csv"
          />
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              {headers.map(h => (
                <th
                  key={h}
                  onClick={() => handleSort(h)}
                  className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100 select-none"
                >
                  {h.replace(/_/g, ' ')}
                  {sortKey === h && (sortDir === 'asc' ? ' ↑' : ' ↓')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {pageData.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50">
                {headers.map(h => (
                  <td key={h} className="px-4 py-2 text-gray-700">
                    {typeof row[h] === 'number' ? (row[h] as number).toLocaleString('en-NZ') : String(row[h] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
          <span>Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length.toLocaleString()} rows</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 border rounded disabled:opacity-40 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
