import { useEffect, useState } from 'react';
import { useFiltros } from '../contexts/FilterContext';
import {
  FileText, MapPin, DollarSign, Stethoscope, RefreshCw, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import Layout from '../components/layout/Layout';
import StatCard, { StatCardSkeleton, StatCardGrid } from '../components/ui/StatCard';
import FilterBar from '../components/ui/FilterBar';
import ChartCard from '../components/ui/ChartCard';
import { producaoService } from '../services/api';
import type { ResumoProducao, FiltrosDashboard } from '../types';
import { formatCurrency, formatNumber, formatCompetencia } from '../utils/format';

const OVERVIEW_CACHE_PREFIX = 'overview_cache:';

function stableFilterKey(filtros: FiltrosDashboard): string {
  const entries = Object.entries(filtros)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  return entries.map(([k, v]) => `${k}:${String(v)}`).join('|') || 'default';
}

function overviewKey(kind: 'resumo' | 'competencia' | 'municipio', filtros: FiltrosDashboard): string {
  return `${OVERVIEW_CACHE_PREFIX}${kind}|${stableFilterKey(filtros)}`;
}

function readOverviewCache<T>(kind: 'resumo' | 'competencia' | 'municipio', filtros: FiltrosDashboard): T | null {
  try {
    const raw = localStorage.getItem(overviewKey(kind, filtros));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeOverviewCache<T>(kind: 'resumo' | 'competencia' | 'municipio', filtros: FiltrosDashboard, data: T) {
  try {
    localStorage.setItem(overviewKey(kind, filtros), JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}

export default function OverviewPage() {
  const { filtros, setFiltros } = useFiltros();
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
    setLoadingResumo(true);
    setLoadingCharts(true);
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
    const competenciaOverviewCache = readOverviewCache<Array<{ competencia: string; total_registros: number }>>('competencia', filtros);
    const municipioOverviewCache = readOverviewCache<Array<{ municipio_nome: string; total_registros: number }>>('municipio', filtros);

    const resolvedResumo = resumoCache ?? resumoOverviewCache;
    const resolvedCompetencia = competenciaCache.length > 0 ? competenciaCache : (competenciaOverviewCache ?? []);
    const resolvedMunicipio = municipioCache.data.length > 0 ? municipioCache.data : (municipioOverviewCache ?? []);

    setResumo(resolvedResumo);
    setPorCompetencia(resolvedCompetencia);
    setPorMunicipio(resolvedMunicipio);

    const hasResumoCache = !!resolvedResumo;
    const hasCompetenciaCache = resolvedCompetencia.length > 0;
    const hasMunicipioCache = resolvedMunicipio.length > 0;
    const hasAnyChartCache = hasCompetenciaCache || hasMunicipioCache;

    if (hasResumoCache || hasAnyChartCache) {
      setLoadingResumo(false);
      setLoadingCharts(false);
      return;
    }

    // Primeiro acesso sem cache: faz uma carga inicial para popular os cards e gráficos.
    void refreshResumo(true);
  }, [filtros]);

  const competenciaChartData = porCompetencia.map((item) => ({
    competencia: formatCompetencia(item.competencia),
    total: item.total_registros,
  }));

  const municipioChartData = [...porMunicipio]
    .sort((a, b) => b.total_registros - a.total_registros)
    .slice(0, 10)
    .map((item) => ({
    municipio: item.municipio_nome.length > 16 ? `${item.municipio_nome.slice(0, 16)}...` : item.municipio_nome,
    municipioCompleto: item.municipio_nome,
    total: item.total_registros,
    }));

  return (
    <Layout
      title="Visão Geral"
      subtitle="Resumo consolidado da produção SiaSUS"
      actions={(
        <button
          onClick={() => { void refreshResumo(); }}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar dados'}
        </button>
      )}
    >
      <div className="space-y-5">
        <div className="text-xs text-gray-400">
          {lastUpdatedAt
            ? `Última atualização dos dados: ${new Date(lastUpdatedAt).toLocaleString('pt-BR')}`
            : 'Sem cache ainda. Clique em "Atualizar dados" para carregar.'}
        </div>

        {refreshError && (
          <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-100 px-3.5 py-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700">{refreshError}</p>
          </div>
        )}

        {/* Filtros */}
        <FilterBar value={filtros} onChange={setFiltros} />

        {/* KPIs */}
        <StatCardGrid>
          {loadingResumo ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard
                title="Total de Linhas"
                value={formatNumber(resumo?.total_linhas)}
                subtitle="Registros no DW"
                icon={FileText}
                color="blue"
              />
              <StatCard
                title="Total de Cidades"
                value={formatNumber(resumo?.total_cidades)}
                subtitle="Municípios com produção"
                icon={MapPin}
                color="orange"
              />
              <StatCard
                title="Total de Quantidade"
                value={formatNumber(resumo?.total_qtd)}
                subtitle="Soma da quantidade aprovada"
                icon={Stethoscope}
                color="purple"
              />
              <StatCard
                title="Total de Valor"
                value={formatCurrency(resumo?.total_valor)}
                subtitle="Soma do valor aprovado"
                icon={DollarSign}
                color="green"
              />
            </>
          )}
        </StatCardGrid>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <ChartCard
            title="Produção por Competência"
            subtitle="Dados exibidos a partir do cache local"
            isLoading={loadingCharts}
          >
            {competenciaChartData.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-sm text-gray-400">
                Sem dados em cache para este gráfico.
              </div>
            ) : competenciaChartData.length === 1 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={competenciaChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="competencia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v)} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    formatter={(value) => [formatNumber(Number(value ?? 0)), 'Quantidade']}
                  />
                  <Bar dataKey="total" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={56} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={competenciaChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="overviewCompetenciaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="competencia" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v)} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                    formatter={(value) => [formatNumber(Number(value ?? 0)), 'Quantidade']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} fill="url(#overviewCompetenciaGradient)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard
            title="Top Municípios"
            subtitle="Top 10 por quantidade aprovada"
            isLoading={loadingCharts}
          >
            {municipioChartData.length === 0 ? (
              <div className="h-[240px] flex items-center justify-center text-sm text-gray-400">
                Sem dados em cache para este gráfico.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={municipioChartData} layout="vertical" margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(v)} />
                  <YAxis type="category" dataKey="municipio" width={120} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 8 }}
                    labelFormatter={(_label, payload) => String(payload?.[0]?.payload?.municipioCompleto ?? '')}
                    formatter={(value) => [formatNumber(Number(value ?? 0)), 'Quantidade']}
                  />
                  <Bar dataKey="total" fill="#10b981" radius={[0, 5, 5, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>
      </div>
    </Layout>
  );
}
