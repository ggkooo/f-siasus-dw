import { useMemo, useState } from 'react';
import { useFiltros } from '../../contexts/FilterContext';
import Layout from '../../components/layout/Layout';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import TableControls from '../../components/ui/TableControls';
import FilterBar from '../../components/ui/FilterBar';
import ChartCard from '../../components/ui/ChartCard';
import TopRankBarChart from '../../components/ui/TopRankBarChart';
import { producaoService } from '../../services/api';
import type { ProducaoCBO } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/format';
import { usePaginatedProduction } from '../shared/usePaginatedProduction';
import { buildTopRankChartData } from '../shared/topRankChart';

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
  const [nomeBusca, setNomeBusca] = useState('');
  const {
    setPage,
    result,
    loading,
    useServerPagination,
    effectiveLastPage,
    effectivePage,
    tableData,
    effectiveTotal,
    effectivePerPage,
  } = usePaginatedProduction<ProducaoCBO>({
    filtros,
    searchValue: nomeBusca,
    searchKey: 'nome_cbo',
    perPage: ITEMS_PER_PAGE,
    getFromCache: producaoService.getPorCBOFromCache,
    getData: producaoService.getPorCBO,
  });

  const top10 = useMemo(
    () =>
      buildTopRankChartData(tableData, {
        getName: (row) => row.cbo_nome,
        getRegistros: (row) => row.total_registros,
        truncateAt: 22,
      }),
    [tableData]
  );

  return (
    <Layout title="Produção por CBO" subtitle="Detalhamento por ocupação profissional (CBO)">
      <div className="space-y-5">
        <FilterBar value={filtros} onChange={setFiltros} />

        {top10.length > 0 && (
          <ChartCard title="Top 10 CBOs" subtitle="Por volume de registros" isLoading={loading}>
            <TopRankBarChart data={top10} color="#f59e0b" yAxisWidth={180} />
          </ChartCard>
        )}

        <DataTable
          columns={columns}
          data={tableData}
          isLoading={loading}
          emptyMessage="Nenhum CBO encontrado."
          footer={
            <TableControls
              searchValue={nomeBusca}
              onSearchChange={setNomeBusca}
              searchPlaceholder="Buscar ocupação por nome..."
              maxItemsPerPage={ITEMS_PER_PAGE}
            >
              <Pagination
                currentPage={useServerPagination ? result.current_page : effectivePage}
                lastPage={effectiveLastPage}
                total={effectiveTotal}
                perPage={effectivePerPage}
                onPageChange={setPage}
              />
            </TableControls>
          }
        />
      </div>
    </Layout>
  );
}
