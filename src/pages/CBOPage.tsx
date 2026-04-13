import { Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFiltros } from '../contexts/FilterContext';
import Layout from '../components/layout/Layout';
import DataTable from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import FilterBar from '../components/ui/FilterBar';
import ChartCard from '../components/ui/ChartCard';
import { producaoService } from '../services/api';
import type { ProducaoCBO, PaginatedResponse } from '../types';
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
  const ITEMS_PER_PAGE = 25;
  const { filtros, setFiltros } = useFiltros();
  const [page, setPage] = useState(1);
  const [nomeBusca, setNomeBusca] = useState('');
  const [result, setResult] = useState<PaginatedResponse<ProducaoCBO>>(
    () => producaoService.getPorCBOFromCache({ ...filtros, nome_cbo: undefined, page: 1, per_page: ITEMS_PER_PAGE })
  );
  const [loading, setLoading] = useState(result.data.length === 0);

  useEffect(() => { setPage(1); }, [filtros, nomeBusca]);

  useEffect(() => {
    const params = {
      ...filtros,
      nome_cbo: nomeBusca.trim() || undefined,
      page,
      per_page: ITEMS_PER_PAGE,
    };
    const cached = producaoService.getPorCBOFromCache(params);
    if (cached.data.length > 0) {
      setResult(cached);
      setLoading(false);
      void producaoService.getPorCBO(params).then(setResult).catch(() => {});
      return;
    }
    setLoading(true);
    void producaoService.getPorCBO(params)
      .then(setResult)
      .finally(() => setLoading(false));
  }, [filtros, nomeBusca, page]);

  const top10 = [...result.data]
    .sort((a, b) => b.total_registros - a.total_registros)
    .slice(0, 10)
    .map((d) => ({
    name: d.cbo_nome?.length > 22 ? d.cbo_nome.slice(0, 22) + '…' : d.cbo_nome,
    fullName: d.cbo_nome,
    registros: d.total_registros,
    }));

  const useServerPagination = result.last_page > 1 || result.total > result.data.length;
  const localLastPage = Math.max(1, Math.ceil(result.data.length / ITEMS_PER_PAGE));
  const effectiveLastPage = useServerPagination ? result.last_page : localLastPage;
  const effectivePage = Math.min(page, effectiveLastPage);
  const tableData = useServerPagination
    ? result.data
    : result.data.slice((effectivePage - 1) * ITEMS_PER_PAGE, effectivePage * ITEMS_PER_PAGE);
  const effectiveTotal = useServerPagination ? result.total : result.data.length;
  const effectivePerPage = useServerPagination ? result.per_page : ITEMS_PER_PAGE;

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
                  labelFormatter={(_label, payload) => String(payload?.[0]?.payload?.fullName ?? '')}
                  formatter={(value) => [formatNumber(Number(value ?? 0)), 'Registros']}
                />
                <Bar dataKey="registros" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <DataTable
          columns={columns}
          data={tableData}
          isLoading={loading}
          emptyMessage="Nenhum CBO encontrado."
          footer={
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={nomeBusca}
                    onChange={(e) => setNomeBusca(e.target.value)}
                    placeholder="Buscar ocupação por nome..."
                    className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
                  />
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  Máx. {ITEMS_PER_PAGE} por página
                </span>
              </div>
              <Pagination
                currentPage={useServerPagination ? result.current_page : effectivePage}
                lastPage={effectiveLastPage}
                total={effectiveTotal}
                perPage={effectivePerPage}
                onPageChange={setPage}
              />
            </div>
          }
        />
      </div>
    </Layout>
  );
}
