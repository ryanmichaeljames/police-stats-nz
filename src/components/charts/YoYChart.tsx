import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface YoYChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  bars: { key: string; name: string; color: string }[];
  height?: number;
}

export default function YoYChart({ data, xKey, bars, height = 300 }: YoYChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString('en-NZ')} />
        <Tooltip formatter={(v: unknown) => typeof v === 'number' ? v.toLocaleString('en-NZ') : String(v)} />
        <Legend />
        {bars.map(b => (
          <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
