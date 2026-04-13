import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { TopRankChartRow } from '../../../pages/shared/topRankChart';
import { formatNumber } from '../../../utils/format';

interface TopRankBarChartProps {
  data: TopRankChartRow[];
  color: string;
  yAxisWidth: number;
}

export default function TopRankBarChart({ data, color, yAxisWidth }: TopRankBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#94a3b8' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v)}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={yAxisWidth}
          tick={{ fontSize: 11, fill: '#64748b' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}
          labelFormatter={(_label, payload) => String(payload?.[0]?.payload?.fullName ?? '')}
          formatter={(value) => [formatNumber(Number(value ?? 0)), 'Registros']}
        />
        <Bar dataKey="registros" fill={color} radius={[0, 4, 4, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
