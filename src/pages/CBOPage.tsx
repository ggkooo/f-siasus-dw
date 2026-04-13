import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import FilterBar from '../components/ui/FilterBar';
import ChartCard from '../components/ui/ChartCard';
import { producaoService } from '../services/api';
import type { ProducaoCBO, FiltrosDashboard, PaginatedResponse } from '../types';
import { formatCurrency, formatNumber } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const columns = [
  {
    key: 'cbo_codigo',
    header: 'CBO',
    render: (row: ProducaoCBO) => (
      <span className="text-xs font-mono text-gray-400">{row.cbo_codigo}</span>
    ),
  },
  {
    key: 'cbo_nome',
    header: 'Ocupação',
    render: (row: ProducaoCBO) => (
      <span className="font-medium text-gray-900 max-w-xs truncate block" title={row.cbo_nome}>
        {row.cbo_nome}
      </span>
    ),
  },
  {
    key: 'total_registros',
    header: 'Registros',
    align: 'right' as const,
    render: (row: ProducaoCBO) => formatNumber(row.total_registros),
  },
  {
    key: 'total_valor_aprovado',
    header: 'Valor Aprovado',
    align: 'right' as const,
    render: (row: ProducaoCBO) => formatCurrency(row.total_valor_aprovado),
  },
];

export default function CBOPage() {
  const [filtros, setFiltros] = useState<FiltrosDashboard>({});
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<ProducaoCBO> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setPage(1); }, [filtros]);

  useEffect(() => {
    setLoading(true);
    producaoService.getPorCBO({ ...filtros, page, per_page: 10 })
      .then(setResult)
      .finally(() => setLoading(false));
  }, [filtros, page]);

  const top10 = (result?.data ?? []).slice(0, 10).map((d) => ({
    name: d.cbo_nome?.length > 22 ? d.cbo_nome.slice(0, 22) + '…' : d.cbo_nome,
    registros: d.total_registros,
  }));

  return (
    <Layout title="Produção por CBO" subtitle="Detalhamento por ocupação profissional (CBO)">
      <div className="space-y-5">
        <FilterBar value={filtros} onChange={setFiltros} />

        {top10.length > 0 && (
          <ChartCard title="Top 10 CBOs" subtitle="Por volume de registros" isLoading={loading}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top10} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v)} />
                <YAxis type="category" dataKey="name" width={180} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}
                  formatter={(value) => [formatNumber(Number(value ?? 0)), 'Registros']}
                />
                <Bar dataKey="registros" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <DataTable
          columns={columns}
          data={result?.data ?? []}
          isLoading={loading}
          emptyMessage="Nenhum CBO encontrado."
          footer={
            result && result.last_page > 1 ? (
              <Pagination
                currentPage={result.current_page}
                lastPage={result.last_page}
                total={result.total}
                perPage={result.per_page}
                onPageChange={setPage}
              />
            ) : undefined
          }
        />
      </div>
    </Layout>
  );
}
