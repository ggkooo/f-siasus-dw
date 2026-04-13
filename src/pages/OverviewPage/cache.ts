import type { FiltrosDashboard } from '../../types';

const OVERVIEW_CACHE_PREFIX = 'overview_cache:';

export function stableFilterKey(filtros: FiltrosDashboard): string {
  const entries = Object.entries(filtros)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  return entries.map(([k, v]) => `${k}:${String(v)}`).join('|') || 'default';
}

function overviewKey(kind: 'resumo' | 'competencia' | 'municipio', filtros: FiltrosDashboard): string {
  return `${OVERVIEW_CACHE_PREFIX}${kind}|${stableFilterKey(filtros)}`;
}

export function readOverviewCache<T>(kind: 'resumo' | 'competencia' | 'municipio', filtros: FiltrosDashboard): T | null {
  try {
    const raw = localStorage.getItem(overviewKey(kind, filtros));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeOverviewCache<T>(kind: 'resumo' | 'competencia' | 'municipio', filtros: FiltrosDashboard, data: T) {
  try {
    localStorage.setItem(overviewKey(kind, filtros), JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}
