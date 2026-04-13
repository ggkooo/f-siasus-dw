import { useEffect, useMemo, useState } from 'react';
import { producaoService } from '../../services/api';
import type { FiltrosDashboard, ProducaoCompetencia } from '../../types';
import { formatCompetencia } from '../../utils/format';

export function useCompetenciaData(filtros: FiltrosDashboard, nomeBusca: string, itemsPerPage: number) {
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ProducaoCompetencia[]>(() => producaoService.getPorCompetenciaFromCache(filtros));
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

  const lastPage = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));

  useEffect(() => {
    if (page > lastPage) setPage(lastPage);
  }, [page, lastPage]);

  const pagedData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, page, itemsPerPage]);

  const chartData = useMemo(
    () =>
      data.map((row) => ({
        name: formatCompetencia(row.competencia),
        registros: row.total_registros,
        valor: row.total_valor_aprovado,
      })),
    [data]
  );

  return {
    page,
    setPage,
    loading,
    filteredData,
    pagedData,
    chartData,
    hasSinglePoint: chartData.length === 1,
  };
}
