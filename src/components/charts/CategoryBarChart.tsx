import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

interface CategoryBarChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  yKey: string;
  height?: number;
  horizontal?: boolean;
}

export default function CategoryBarChart({ data, xKey, yKey, height = 300, horizontal = false }: CategoryBarChartProps) {
  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(height, data.length * 40)}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 200, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString('en-NZ')} />
          <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11 }} width={190} />
          <Tooltip formatter={(v: unknown) => typeof v === 'number' ? v.toLocaleString('en-NZ') : String(v)} />
          <Bar dataKey={yKey}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString('en-NZ')} />
        <Tooltip formatter={(v: unknown) => typeof v === 'number' ? v.toLocaleString('en-NZ') : String(v)} />
        <Bar dataKey={yKey}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
