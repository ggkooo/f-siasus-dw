import { useEffect, useState } from 'react';
import Layout from '../components/layout/Layout';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import FilterBar from '../components/ui/FilterBar';
import { producaoService } from '../services/api';
import type { ProducaoMunicipio, FiltrosDashboard, PaginatedResponse } from '../types';
import { formatCurrency, formatNumber } from '../utils/format';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import ChartCard from '../components/ui/ChartCard';

const columns = [
  {
    key: 'municipio_codigo',
    header: 'Código',
    render: (row: ProducaoMunicipio) => (
      <span className="text-xs font-mono text-gray-400">{row.municipio_codigo}</span>
    ),
  },
  {
    key: 'municipio_nome',
    header: 'Município',
    render: (row: ProducaoMunicipio) => (
      <span className="font-medium text-gray-900">{row.municipio_nome}</span>
    ),
  },
  {
    key: 'uf',
    header: 'UF',
    render: (row: ProducaoMunicipio) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600">
        {row.uf}
      </span>
    ),
  },
  {
    key: 'total_registros',
    header: 'Registros',
    align: 'right' as const,
    render: (row: ProducaoMunicipio) => formatNumber(row.total_registros),
  },
  {
    key: 'total_valor_aprovado',
    header: 'Valor Aprovado',
    align: 'right' as const,
    render: (row: ProducaoMunicipio) => formatCurrency(row.total_valor_aprovado),
  },
];

export default function MunicipioPage() {
  const [filtros, setFiltros] = useState<FiltrosDashboard>({});
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedResponse<ProducaoMunicipio> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPage(1);
  }, [filtros]);

  useEffect(() => {
    setLoading(true);
    producaoService.getPorMunicipio({ ...filtros, page, per_page: 10 })
      .then(setResult)
      .finally(() => setLoading(false));
  }, [filtros, page]);

  const top10 = (result?.data ?? []).slice(0, 10).map((d) => ({
    name: d.municipio_nome?.length > 16 ? d.municipio_nome.slice(0, 16) + '…' : d.municipio_nome,
    registros: d.total_registros,
  }));

  return (
    <Layout title="Produção por Município" subtitle="Detalhamento da produção por município">
      <div className="space-y-5">
        <FilterBar value={filtros} onChange={setFiltros} />

        {top10.length > 0 && (
          <ChartCard title="Top 10 Municípios" subtitle="Por volume de registros na página atual" isLoading={loading}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={top10} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v)} />
                <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}
                  formatter={(value) => [formatNumber(Number(value ?? 0)), 'Registros']}
                />
                <Bar dataKey="registros" fill="#8b5cf6" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <DataTable
          columns={columns}
          data={result?.data ?? []}
          isLoading={loading}
          emptyMessage="Nenhum município encontrado."
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
