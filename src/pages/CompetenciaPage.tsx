import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useFiltros } from '../contexts/FilterContext';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Layout from '../components/layout/Layout';
import ChartCard from '../components/ui/ChartCard';
import DataTable from '../components/ui/DataTable';
import FilterBar from '../components/ui/FilterBar';
import Pagination from '../components/ui/Pagination';
import { producaoService } from '../services/api';
import type { ProducaoCompetencia } from '../types';
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
  const ITEMS_PER_PAGE = 25;
  const { filtros, setFiltros } = useFiltros();
  const [page, setPage] = useState(1);
  const [nomeBusca, setNomeBusca] = useState('');
  const [data, setData] = useState<ProducaoCompetencia[]>(
    () => producaoService.getPorCompetenciaFromCache(filtros)
  );
  const [loading, setLoading] = useState(data.length === 0);

  useEffect(() => {
    const cached = producaoService.getPorCompetenciaFromCache(filtros);
    if (cached.length > 0) {
      setData(cached);
      setLoading(false);
      void producaoService.getPorCompetencia(filtros).then(setData).catch(() => {});
      return;
    }
    setLoading(true);
    void producaoService.getPorCompetencia(filtros)
      .then(setData)
      .finally(() => setLoading(false));
  }, [filtros]);

  useEffect(() => {
    setPage(1);
  }, [filtros, nomeBusca]);

  const filteredData = useMemo(() => {
    const term = nomeBusca.trim().toLowerCase();
    if (!term) return data;
    return data.filter((row) => formatCompetencia(row.competencia).toLowerCase().includes(term));
  }, [data, nomeBusca]);

  const lastPage = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));

  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, page]);

  const chartData = data.map((d) => ({
    name: formatCompetencia(d.competencia),
    registros: d.total_registros,
    valor: d.total_valor_aprovado,
  }));
  const hasSinglePoint = chartData.length === 1;

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
                formatter={(value, _name, item) =>
                  String(item?.dataKey) === 'valor'
                    ? [formatCurrency(Number(value ?? 0)), 'Valor Aprovado']
                    : [formatNumber(Number(value ?? 0)), 'Registros']
                }
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar yAxisId="left" dataKey="registros" fill="#3b82f6" radius={[3, 3, 0, 0]} maxBarSize={28} name="Registros" />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="valor"
                stroke="#10b981"
                strokeWidth={2}
                dot={hasSinglePoint ? { r: 5, strokeWidth: 2, fill: '#10b981', stroke: '#ffffff' } : false}
                activeDot={{ r: 6 }}
                name="Valor (R$)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <DataTable
          columns={columns}
          data={pagedData}
          isLoading={loading}
          emptyMessage="Nenhuma competência encontrada."
          footer={
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={nomeBusca}
                    onChange={(e) => setNomeBusca(e.target.value)}
                    placeholder="Buscar competência por nome..."
                    className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap self-start sm:self-auto">
                  Máx. {ITEMS_PER_PAGE} por página
                </span>
              </div>
              <Pagination
                currentPage={page}
                lastPage={lastPage}
                total={filteredData.length}
                perPage={ITEMS_PER_PAGE}
                onPageChange={setPage}
              />
            </div>
          }
        />
      </div>
    </Layout>
  );
}
