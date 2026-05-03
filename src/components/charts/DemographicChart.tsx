import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CHART_COLORS } from '../../utils/constants';

interface DemographicChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

export default function DemographicChart({ data, height = 300 }: DemographicChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={40} label={(props: { name?: string; percent?: number }) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(1)}%`} labelLine={false}>
          {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v: unknown) => typeof v === 'number' ? v.toLocaleString('en-NZ') : String(v)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
