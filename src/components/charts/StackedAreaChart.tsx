import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface StackedAreaChartProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  xKey: string;
  areas: { key: string; name: string; color: string }[];
  height?: number;
}

export default function StackedAreaChart({ data, xKey, areas, height = 300 }: StackedAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey={xKey} tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={v => v.toLocaleString('en-NZ')} />
        <Tooltip formatter={(v: unknown) => typeof v === 'number' ? v.toLocaleString('en-NZ') : String(v)} />
        <Legend />
        {areas.map(a => (
          <Area key={a.key} type="monotone" dataKey={a.key} name={a.name} stroke={a.color} fill={a.color} fillOpacity={0.3} stackId="1" />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
