import { useMemo, useState } from 'react';
import { useFiltros } from '../../contexts/FilterContext';
import Layout from '../../components/layout/Layout';
import DataTable from '../../components/ui/DataTable';
import Pagination from '../../components/ui/Pagination';
import TableControls from '../../components/ui/TableControls';
import FilterBar from '../../components/ui/FilterBar';
import TopRankBarChart from '../../components/ui/TopRankBarChart';
import { producaoService } from '../../services/api';
import type { ProducaoMunicipio } from '../../types';
import { formatCurrency, formatNumber } from '../../utils/format';
import ChartCard from '../../components/ui/ChartCard';
import { usePaginatedProduction } from '../shared/usePaginatedProduction';
import { buildTopRankChartData } from '../shared/topRankChart';

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
  } = usePaginatedProduction<ProducaoMunicipio>({
    filtros,
    searchValue: nomeBusca,
    searchKey: 'nome_mun',
    perPage: ITEMS_PER_PAGE,
    getFromCache: producaoService.getPorMunicipioFromCache,
    getData: producaoService.getPorMunicipio,
  });

  const top10 = useMemo(
    () =>
      buildTopRankChartData(tableData, {
        getName: (row) => row.municipio_nome,
        getRegistros: (row) => row.total_registros,
        truncateAt: 16,
      }),
    [tableData]
  );

  return (
    <Layout title="Produção por Município" subtitle="Detalhamento da produção por município">
      <div className="space-y-5">
        <FilterBar value={filtros} onChange={setFiltros} />

        {top10.length > 0 && (
          <ChartCard title="Top 10 Municípios" subtitle="Por volume de registros na página atual" isLoading={loading}>
            <TopRankBarChart data={top10} color="#8b5cf6" yAxisWidth={130} />
          </ChartCard>
        )}

        <DataTable
          columns={columns}
          data={tableData}
          isLoading={loading}
          emptyMessage="Nenhum município encontrado."
          footer={
            <TableControls
              searchValue={nomeBusca}
              onSearchChange={setNomeBusca}
              searchPlaceholder="Buscar município por nome..."
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
