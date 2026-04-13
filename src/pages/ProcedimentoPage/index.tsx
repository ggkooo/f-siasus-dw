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
import type { ProducaoProcedimento } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/format';
import { usePaginatedProduction } from '../shared/usePaginatedProduction';
import { buildTopRankChartData } from '../shared/topRankChart';

const columns = [
  {
    key: 'procedimento_codigo',
    header: 'Código',
    render: (row: ProducaoProcedimento) => (
      <span className="text-xs font-mono text-gray-400">{row.procedimento_codigo}</span>
    ),
  },
  {
    key: 'procedimento_nome',
    header: 'Procedimento',
    render: (row: ProducaoProcedimento) => (
      <span className="font-medium text-gray-900 max-w-xs truncate block" title={row.procedimento_nome}>
        {row.procedimento_nome}
      </span>
    ),
  },
  {
    key: 'total_registros',
    header: 'Registros',
    align: 'right' as const,
    render: (row: ProducaoProcedimento) => formatNumber(row.total_registros),
  },
  {
    key: 'total_valor_aprovado',
    header: 'Valor Aprovado',
    align: 'right' as const,
    render: (row: ProducaoProcedimento) => formatCurrency(row.total_valor_aprovado),
  },
];

export default function ProcedimentoPage() {
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
  } = usePaginatedProduction<ProducaoProcedimento>({
    filtros,
    searchValue: nomeBusca,
    searchKey: 'nome_procedimento',
    perPage: ITEMS_PER_PAGE,
    getFromCache: producaoService.getPorProcedimentoFromCache,
    getData: producaoService.getPorProcedimento,
  });

  const top10 = useMemo(
    () =>
      buildTopRankChartData(tableData, {
        getName: (row) => row.procedimento_nome,
        getRegistros: (row) => row.total_registros,
        truncateAt: 22,
      }),
    [tableData]
  );

  return (
    <Layout title="Produção por Procedimento" subtitle="Detalhamento por tipo de procedimento">
      <div className="space-y-5">
        <FilterBar value={filtros} onChange={setFiltros} />

        {top10.length > 0 && (
          <ChartCard title="Top 10 Procedimentos" subtitle="Por volume de registros" isLoading={loading}>
            <TopRankBarChart data={top10} color="#10b981" yAxisWidth={180} />
          </ChartCard>
        )}

        <DataTable
          columns={columns}
          data={tableData}
          isLoading={loading}
          emptyMessage="Nenhum procedimento encontrado."
          footer={
            <TableControls
              searchValue={nomeBusca}
              onSearchChange={setNomeBusca}
              searchPlaceholder="Buscar procedimento por nome..."
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
