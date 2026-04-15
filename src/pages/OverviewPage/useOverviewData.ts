import { useEffect, useState } from 'react';
import { producaoService } from '../../services/api';
import type { FiltrosDashboard, ResumoProducao } from '../../types';
import { readOverviewCache, writeOverviewCache } from './cache';

interface OverviewState {
  resumo: ResumoProducao | null;
  loadingResumo: boolean;
  loadingCharts: boolean;
  porCompetencia: Array<{ competencia: string; total_registros: number }>;
  porMunicipio: Array<{ municipio_nome: string; total_registros: number }>;
  lastUpdatedAt: number | null;
  isRefreshing: boolean;
  refreshError: string | null;
  refreshResumo: (silent?: boolean) => Promise<void>;
}

export function useOverviewData(filtros: FiltrosDashboard): OverviewState {
  const [resumo, setResumo] = useState<ResumoProducao | null>(null);
  const [loadingResumo, setLoadingResumo] = useState(true);
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [porCompetencia, setPorCompetencia] = useState<Array<{ competencia: string; total_registros: number }>>([]);
  const [porMunicipio, setPorMunicipio] = useState<Array<{ municipio_nome: string; total_registros: number }>>([]);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const refreshResumo = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    if (!silent) {
      setLoadingResumo(true);
      setLoadingCharts(true);
    }
    setRefreshError(null);

    try {
      const [resumoResult, competenciaResult, municipioResult] = await Promise.allSettled([
        producaoService.getResumo(filtros, { forceRefresh: true }),
        producaoService.getPorCompetencia(filtros, { forceRefresh: true }),
        producaoService.getPorMunicipio({ ...filtros, page: 1, per_page: 10 }, { forceRefresh: true }),
      ]);

      if (resumoResult.status === 'fulfilled') {
        setResumo(resumoResult.value);
        writeOverviewCache('resumo', filtros, resumoResult.value);
      }
      if (competenciaResult.status === 'fulfilled') {
        setPorCompetencia(competenciaResult.value);
        writeOverviewCache('competencia', filtros, competenciaResult.value);
      }
      if (municipioResult.status === 'fulfilled') {
        setPorMunicipio(municipioResult.value.data);
        writeOverviewCache('municipio', filtros, municipioResult.value.data);
      }

      const hasError = [resumoResult, competenciaResult, municipioResult].some((r) => r.status === 'rejected');
      if (hasError) {
        setRefreshError('Alguns dados não puderam ser atualizados agora. Exibindo o que foi possível.');
      }

      setLastUpdatedAt(producaoService.getResumoCacheUpdatedAt(filtros));
    } finally {
      if (!silent) setIsRefreshing(false);
      setLoadingResumo(false);
      setLoadingCharts(false);
    }
  };

  useEffect(() => {
    setLoadingResumo(true);
    setLoadingCharts(true);
    setLastUpdatedAt(producaoService.getResumoCacheUpdatedAt(filtros));

    const resumoCache = producaoService.getResumoFromCache(filtros);
    const competenciaCache = producaoService.getPorCompetenciaFromCache(filtros);
    const municipioCache = producaoService.getPorMunicipioFromCache({ ...filtros, page: 1, per_page: 10 });

    const resumoOverviewCache = readOverviewCache<ResumoProducao>('resumo', filtros);
    const competenciaOverviewCache = readOverviewCache<Array<{ competencia: string; total_registros: number }>>(
      'competencia',
      filtros
    );
    const municipioOverviewCache = readOverviewCache<Array<{ municipio_nome: string; total_registros: number }>>(
      'municipio',
      filtros
    );

    const resolvedResumo = resumoCache ?? resumoOverviewCache;
    const resolvedCompetencia = competenciaCache.length > 0 ? competenciaCache : competenciaOverviewCache ?? [];
    const resolvedMunicipio = municipioCache.data.length > 0 ? municipioCache.data : municipioOverviewCache ?? [];

    setResumo(resolvedResumo);
    setPorCompetencia(resolvedCompetencia);
    setPorMunicipio(resolvedMunicipio);

    const hasResumoCache = !!resolvedResumo;
    const hasCompetenciaCache = resolvedCompetencia.length > 0;
    const hasMunicipioCache = resolvedMunicipio.length > 0;
    const hasAnyChartCache = hasCompetenciaCache || hasMunicipioCache;

    if (hasResumoCache && hasAnyChartCache) {
      setLoadingResumo(false);
      setLoadingCharts(false);
      return;
    }

    // Se houver cache parcial (ex.: resumo sem gráficos), atualiza silenciosamente.
    setLoadingResumo(!hasResumoCache);
    setLoadingCharts(!hasAnyChartCache);

    void refreshResumo(true);
  }, [filtros]);

  return {
    resumo,
    loadingResumo,
    loadingCharts,
    porCompetencia,
    porMunicipio,
    lastUpdatedAt,
    isRefreshing,
    refreshError,
    refreshResumo,
  };
}
