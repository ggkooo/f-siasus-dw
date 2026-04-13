import { useEffect, useState } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Layout from '../components/layout/Layout';
import ChartCard from '../components/ui/ChartCard';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import { producaoService } from '../services/api';
import type { ProducaoCompetencia, FiltrosDashboard } from '../types';
import { formatCurrency, formatNumber, formatCompetencia } from '../utils/format';

const columns = [
  {
    key: 'competencia',
    header: 'Competência',
    render: (row: ProducaoCompetencia) => (
      <span className="font-medium text-gray-900">{formatCompetencia(row.competencia)}</span>
    ),
  },
  {
    key: 'total_registros',
    header: 'Registros',
    align: 'right' as const,
    render: (row: ProducaoCompetencia) => formatNumber(row.total_registros),
  },
  {
    key: 'total_valor_aprovado',
    header: 'Valor Aprovado',
    align: 'right' as const,
    render: (row: ProducaoCompetencia) => formatCurrency(row.total_valor_aprovado),
  },
];

export default function CompetenciaPage() {
  const [filtros, setFiltros] = useState<FiltrosDashboard>({});
  const [data, setData] = useState<ProducaoCompetencia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    producaoService.getPorCompetencia(filtros)
      .then(setData)
      .finally(() => setLoading(false));
  }, [filtros]);

  const chartData = data.map((d) => ({
    name: formatCompetencia(d.competencia),
    registros: d.total_registros,
    valor: d.total_valor_aprovado,
  }));

  return (
    <Layout title="Produção por Competência" subtitle="Evolução mensal da produção">
      <div className="space-y-5">
        <FilterBar value={filtros} onChange={setFiltros} />

        <ChartCard
          title="Registros e Valor por Competência"
          subtitle="Evolução ao longo das competências disponíveis"
          isLoading={loading}
        >
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 24, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `R$ ${Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v)}`}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                formatter={(value, name) =>
                  String(name) === 'valor'
                    ? [formatCurrency(Number(value ?? 0)), 'Valor Aprovado']
                    : [formatNumber(Number(value ?? 0)), 'Registros']
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="registros" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} name="Registros" />
              <Line yAxisId="right" type="monotone" dataKey="valor" stroke="#10b981" strokeWidth={2} dot={false} name="Valor (R$)" />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <DataTable
          columns={columns}
          data={data}
          isLoading={loading}
          emptyMessage="Nenhuma competência encontrada."
        />
      </div>
    </Layout>
  );
}
