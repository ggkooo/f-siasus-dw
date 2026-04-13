import { useFiltros } from '../../contexts/FilterContext';
import {
  FileText, MapPin, DollarSign, Stethoscope, RefreshCw, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import Layout from '../../components/layout/Layout';
import StatCard, { StatCardSkeleton, StatCardGrid } from '../../components/ui/StatCard';
import FilterBar from '../../components/ui/FilterBar';
import ChartCard from '../../components/ui/ChartCard';
import { formatCurrency, formatNumber } from '../../utils/format';
import { mapCompetenciaChartData, mapMunicipioChartData } from './chartData';
import { useOverviewData } from './useOverviewData';

export default function OverviewPage() {
  const { filtros, setFiltros } = useFiltros();
  const {
    resumo,
    loadingResumo,
    loadingCharts,
    porCompetencia,
    porMunicipio,
    lastUpdatedAt,
    isRefreshing,
    refreshError,
    refreshResumo,
  } = useOverviewData(filtros);

  const competenciaChartData = mapCompetenciaChartData(porCompetencia);
  const municipioChartData = mapMunicipioChartData(porMunicipio);

  return (
    <Layout
      title="Visão Geral"
      subtitle="Resumo consolidado da produção SiaSUS"
      actions={(
        <button
          onClick={() => { void refreshResumo(); }}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-xs sm:text-sm text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
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
