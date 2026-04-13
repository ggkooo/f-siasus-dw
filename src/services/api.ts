import axios from 'axios';
import type {
  AuthToken,
  ResumoProducao,
  ProducaoCompetencia,
  ProducaoMunicipio,
  ProducaoProcedimento,
  ProducaoCBO,
  Municipio,
  UF,
  Procedimento,
  CBO,
  CNES,
  Competencia,
  DimFiltrosPayload,
  FiltrosDashboard,
  PaginatedResponse,
} from '../types';

type ApiResponse<T> = T | { data?: T };
type AnyRecord = Record<string, unknown>;

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_KEY = import.meta.env.VITE_API_KEY || '';
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';
const API_CACHE_PREFIX = 'api_cache:';
const API_CACHE_TTL_MS = 10 * 60 * 1000;
type CacheEntry<T> = {
  updatedAt: number;
  expiresAt: number;
  data: T;
};
type CacheReadOptions<T> = {
  staleWhileRevalidate?: boolean;
  forceRefresh?: boolean;
  onUpdate?: (data: T, updatedAt: number) => void;
};

export function clearAuthSession() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  clearApiCache();
}

function clearApiCache() {
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(API_CACHE_PREFIX)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => localStorage.removeItem(key));
}

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'object') return String(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;

  const obj = value as Record<string, unknown>;
  const entries = Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .sort(([a], [b]) => a.localeCompare(b));

  return `{${entries.map(([k, v]) => `${k}:${stableStringify(v)}`).join(',')}}`;
}

function cacheKey(url: string, params?: Record<string, unknown>): string {
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY) ?? 'anon';
  return `${API_CACHE_PREFIX}${url}|${stableStringify(params)}|${token}`;
}

function readCacheEntry<T>(key: string): CacheEntry<T> | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as CacheEntry<T>;
    if (!parsed || typeof parsed !== 'object' || !('data' in parsed)) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function writeCacheEntry<T>(key: string, data: T, ttlMs = API_CACHE_TTL_MS) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        updatedAt: Date.now(),
        expiresAt: Date.now() + ttlMs,
        data,
      })
    );
  } catch {
    // ignore quota/storage errors
  }
}

function getCacheUpdatedAt(url: string, params?: Record<string, unknown>): number | null {
  const entry = readCacheEntry<unknown>(cacheKey(url, params));
  return entry?.updatedAt ?? null;
}

function getCachedData<T>(url: string, params?: Record<string, unknown>): T | null {
  const entry = readCacheEntry<T>(cacheKey(url, params));
  return entry?.data ?? null;
}

async function fetchAndCache<T>(url: string, params?: Record<string, unknown>, ttlMs = API_CACHE_TTL_MS): Promise<T> {
  const { data } = await api.get<T>(url, { params });
  writeCacheEntry(cacheKey(url, params), data, ttlMs);
  return data;
}

async function getWithCache<T>(
  url: string,
  params?: Record<string, unknown>,
  ttlMs = API_CACHE_TTL_MS,
  options?: CacheReadOptions<T>
): Promise<T> {
  if (options?.forceRefresh) {
    return fetchAndCache<T>(url, params, ttlMs);
  }

  const key = cacheKey(url, params);
  const cached = readCacheEntry<T>(key);
  const hasCache = cached !== null;

  if (hasCache && options?.staleWhileRevalidate) {
    void fetchAndCache<T>(url, params, ttlMs)
      .then((fresh) => {
        const updatedAt = getCacheUpdatedAt(url, params) ?? Date.now();
        options.onUpdate?.(fresh, updatedAt);
      })
      .catch(() => {});

    return cached.data;
  }

  if (hasCache && Date.now() <= cached.expiresAt) {
    return cached.data;
  }

  const data = await fetchAndCache<T>(url, params, ttlMs);
  return data;
}

function asArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];

  if (payload && typeof payload === 'object') {
    const maybeData = (payload as { data?: unknown }).data;
    if (Array.isArray(maybeData)) return maybeData as T[];
  }

  return [];
}

function toNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function toString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

function mapResumo(payload: unknown): ResumoProducao {
  const obj = (payload && typeof payload === 'object') ? (payload as AnyRecord) : {};
  return {
    total_linhas: toNumber(obj.total_linhas),
    total_cidades: toNumber(obj.total_cidades),
    total_qtd: toNumber(obj.total_qtd),
    total_valor: toNumber(obj.total_valor),
  };
}

function mapPorCompetencia(payload: unknown): ProducaoCompetencia[] {
  return asArray<AnyRecord>(payload).map((row) => ({
    competencia: toString(row.competencia),
    total_registros: toNumber(row.total_qtd ?? row.total_registros),
    total_valor_aprovado: toNumber(row.total_valor ?? row.total_valor_aprovado),
  }));
}

function mapPorMunicipio(payload: unknown): ProducaoMunicipio[] {
  return asArray<AnyRecord>(payload).map((row) => ({
    municipio_codigo: toString(row.codigo_mun ?? row.municipio_codigo),
    municipio_nome: toString(row.nome_mun ?? row.municipio_nome),
    uf: toString(row.uf),
    total_registros: toNumber(row.total_qtd ?? row.total_registros),
    total_valor_aprovado: toNumber(row.total_valor ?? row.total_valor_aprovado),
  }));
}

function mapPorProcedimento(payload: unknown): ProducaoProcedimento[] {
  return asArray<AnyRecord>(payload).map((row) => ({
    procedimento_codigo: toString(row.cod_procedimento ?? row.procedimento_codigo),
    procedimento_nome: toString(row.nome_procedimento ?? row.procedimento_nome),
    total_registros: toNumber(row.total_qtd ?? row.total_registros),
    total_valor_aprovado: toNumber(row.total_valor ?? row.total_valor_aprovado),
  }));
}

function mapPorCBO(payload: unknown): ProducaoCBO[] {
  return asArray<AnyRecord>(payload).map((row) => ({
    cbo_codigo: toString(row.codigo_cbo ?? row.cbo_codigo),
    cbo_nome: toString(row.nome_cbo ?? row.cbo_nome),
    total_registros: toNumber(row.total_qtd ?? row.total_registros),
    total_valor_aprovado: toNumber(row.total_valor ?? row.total_valor_aprovado),
  }));
}

function mapCompetencias(payload: unknown): Competencia[] {
  return asArray<unknown>(payload)
    .map((item) => {
      if (typeof item === 'string' || typeof item === 'number') {
        const competencia = String(item);
        return { competencia, label: competencia };
      }

      if (item && typeof item === 'object') {
        const row = item as AnyRecord;
        const competencia = toString(row.competencia ?? row.value ?? row.id);
        const label = toString(row.label ?? row.nome ?? row.name) || competencia;
        if (competencia) return { competencia, label };
      }

      return null;
    })
    .filter((item): item is Competencia => item !== null);
}

function mapUFs(payload: unknown): UF[] {
  return asArray<unknown>(payload)
    .map((item) => {
      if (typeof item === 'string') {
        return { codigo: item, nome: item, sigla: item };
      }

      if (item && typeof item === 'object') {
        const row = item as AnyRecord;
        const sigla = toString(row.sigla ?? row.uf ?? row.codigo ?? row.code);
        const codigo = toString(row.codigo ?? sigla);
        const nome = toString(row.nome ?? row.name ?? sigla);
        if (sigla || nome) return { codigo, nome, sigla: sigla || codigo };
      }

      return null;
    })
    .filter((item): item is UF => item !== null);
}

function mapMunicipios(payload: unknown): Municipio[] {
  return asArray<AnyRecord>(payload).map((row) => ({
    codigo: toString(row.codigo ?? row.codigo_mun),
    nome: toString(row.nome ?? row.nome_mun),
    uf: toString(row.uf),
  }));
}

function mapProcedimentos(payload: unknown): Procedimento[] {
  return asArray<AnyRecord>(payload).map((row) => ({
    codigo: toString(row.codigo ?? row.cod_procedimento),
    nome: toString(row.nome ?? row.nome_procedimento),
    grupo: toString(row.grupo),
  }));
}

function mapCBOs(payload: unknown): CBO[] {
  return asArray<AnyRecord>(payload).map((row) => ({
    codigo: toString(row.codigo ?? row.codigo_cbo),
    nome: toString(row.nome ?? row.nome_cbo),
  }));
}

function mapCNES(payload: unknown): CNES[] {
  return asArray<AnyRecord>(payload).map((row) => ({
    codigo: toString(row.codigo ?? row.cnes),
    nome: toString(row.nome ?? row.nome_cnes),
    municipio: toString(row.municipio ?? row.nome_mun),
  }));
}

function mapDimFiltros(payload: unknown): DimFiltrosPayload {
  const obj = (payload && typeof payload === 'object') ? (payload as AnyRecord) : {};
  const selects = (obj.selects && typeof obj.selects === 'object') ? (obj.selects as AnyRecord) : {};
  const inputs = (obj.inputs && typeof obj.inputs === 'object') ? (obj.inputs as AnyRecord) : {};

  const inicio = asArray<unknown>(selects.inicio).map(toString).filter(Boolean);
  const fim = asArray<unknown>(selects.fim).map(toString).filter(Boolean);
  const uf = asArray<unknown>(selects.uf).map(toString).filter(Boolean);

  const municipio = asArray<AnyRecord>(selects.municipio).map((item) => ({
    codigo_mun: toString(item.codigo_mun),
    nome_mun: toString(item.nome_mun),
    uf: toString(item.uf),
  })).filter((item) => item.codigo_mun && item.nome_mun);

  const procedimento = asArray<AnyRecord>(selects.procedimento).map((item) => ({
    cod_procedimento: toString(item.cod_procedimento),
    nome_procedimento: toString(item.nome_procedimento),
  })).filter((item) => item.cod_procedimento && item.nome_procedimento);

  const cbo = asArray<AnyRecord>(selects.cbo).map((item) => ({
    codigo_cbo: toString(item.codigo_cbo),
    nome_cbo: toString(item.nome_cbo),
  })).filter((item) => item.codigo_cbo && item.nome_cbo);

  const cnes = asArray<unknown>(selects.cnes).map(toString).filter(Boolean);

  const anoInput = (inputs.ano && typeof inputs.ano === 'object') ? (inputs.ano as AnyRecord) : {};
  const valorMinInput = (inputs.valor_minimo && typeof inputs.valor_minimo === 'object') ? (inputs.valor_minimo as AnyRecord) : {};
  const valorMaxInput = (inputs.valor_maximo && typeof inputs.valor_maximo === 'object') ? (inputs.valor_maximo as AnyRecord) : {};

  return {
    selects: {
      inicio,
      fim,
      uf,
      municipio,
      procedimento,
      cbo,
      cnes,
    },
    inputs: {
      ano: {
        values: asArray<unknown>(anoInput.values).map(toString).filter(Boolean),
      },
      valor_minimo: {
        suggested_min: toNumber(valorMinInput.suggested_min),
      },
      valor_maximo: {
        suggested_max: toNumber(valorMaxInput.suggested_max),
      },
    },
  };
}

function asPaginated<T>(payload: unknown): PaginatedResponse<T> {
  if (payload && typeof payload === 'object') {
    const obj = payload as {
      data?: unknown;
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    };

    if (Array.isArray(obj.data)) {
      const total = typeof obj.total === 'number' ? obj.total : obj.data.length;
      const perPage = typeof obj.per_page === 'number' ? obj.per_page : obj.data.length || 10;
      return {
        data: obj.data as T[],
        current_page: typeof obj.current_page === 'number' ? obj.current_page : 1,
        last_page: typeof obj.last_page === 'number' ? obj.last_page : 1,
        per_page: perPage,
        total,
      };
    }
  }

  if (Array.isArray(payload)) {
    return {
      data: payload as T[],
      current_page: 1,
      last_page: 1,
      per_page: payload.length || 10,
      total: payload.length,
    };
  }

  return {
    data: [],
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  };
}

function mapPaginated<T>(payload: unknown, mapper: (inner: unknown) => T[]): PaginatedResponse<T> {
  if (payload && typeof payload === 'object') {
    const obj = payload as {
      data?: unknown;
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
    };

    if (Array.isArray(obj.data)) {
      const mapped = mapper(obj.data);
      return {
        data: mapped,
        current_page: typeof obj.current_page === 'number' ? obj.current_page : 1,
        last_page: typeof obj.last_page === 'number' ? obj.last_page : 1,
        per_page: typeof obj.per_page === 'number' ? obj.per_page : mapped.length || 10,
        total: typeof obj.total === 'number' ? obj.total : mapped.length,
      };
    }
  }

  return asPaginated<T>(mapper(payload));
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(API_KEY ? { 'X-API-KEY': API_KEY } : {}),
  },
});

// Interceptor: injeta o token em todas as requisições autenticadas
api.interceptors.request.use((config) => {
  if (API_KEY) {
    config.headers['X-API-KEY'] = API_KEY;
  }
  const token = sessionStorage.getItem(AUTH_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor: redireciona para login em caso de 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authService = {
  login: async (email: string, password: string): Promise<AuthToken> => {
    const { data } = await api.post('/login', { email, password });
    const payload = data as {
      message?: string;
      access_token?: string;
      token?: string;
      token_type?: string;
      user?: { id: number; name: string; email: string };
    };

    const accessToken = payload.access_token ?? payload.token ?? '';

    if (accessToken) {
      sessionStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    }
    if (payload.user) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(payload.user));
    }

    return {
      access_token: accessToken,
      token_type: payload.token_type ?? 'Bearer',
      message: payload.message,
      user: payload.user,
    };
  },
  me: async () => {
    const { data } = await api.get('/me');
    const user = data as { id?: number; name?: string; email?: string };
    if (user?.id && user?.email) {
      sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    }
    return {
      id: Number(user.id ?? 0),
      name: String(user.name ?? ''),
      email: String(user.email ?? ''),
    };
  },
  logout: async (): Promise<void> => {
    try {
      await api.post('/logout');
    } finally {
      clearAuthSession();
    }
  },
};

// Produção
export const producaoService = {
  getResumoCacheUpdatedAt: (filtros?: FiltrosDashboard): number | null =>
    getCacheUpdatedAt('/producao/resumo', filtros as Record<string, unknown> | undefined),

  getResumoFromCache: (filtros?: FiltrosDashboard): ResumoProducao | null => {
    const data = getCachedData<ApiResponse<ResumoProducao>>(
      '/producao/resumo',
      filtros as Record<string, unknown> | undefined
    );
    if (!data) return null;
    const payload = (data && typeof data === 'object' && 'data' in data)
      ? ((data as { data?: ResumoProducao }).data ?? data)
      : data;
    return mapResumo(payload);
  },

  getPorCompetenciaFromCache: (filtros?: FiltrosDashboard): ProducaoCompetencia[] => {
    const data = getCachedData<unknown>('/producao/por-competencia', filtros as Record<string, unknown> | undefined);
    return data ? mapPorCompetencia(data) : [];
  },

  getPorMunicipioFromCache: (filtros?: FiltrosDashboard): PaginatedResponse<ProducaoMunicipio> => {
    const data = getCachedData<unknown>('/producao/por-municipio', filtros as Record<string, unknown> | undefined);
    return data ? mapPaginated<ProducaoMunicipio>(data, mapPorMunicipio) : {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    };
  },

  getPorProcedimentoFromCache: (filtros?: FiltrosDashboard): PaginatedResponse<ProducaoProcedimento> => {
    const data = getCachedData<unknown>('/producao/por-procedimento', filtros as Record<string, unknown> | undefined);
    return data ? mapPaginated<ProducaoProcedimento>(data, mapPorProcedimento) : {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    };
  },

  getPorCBOFromCache: (filtros?: FiltrosDashboard): PaginatedResponse<ProducaoCBO> => {
    const data = getCachedData<unknown>('/producao/por-cbo', filtros as Record<string, unknown> | undefined);
    return data ? mapPaginated<ProducaoCBO>(data, mapPorCBO) : {
      data: [],
      current_page: 1,
      last_page: 1,
      per_page: 10,
      total: 0,
    };
  },

  getResumo: async (
    filtros?: FiltrosDashboard,
    options?: {
      staleWhileRevalidate?: boolean;
      forceRefresh?: boolean;
      onUpdate?: (resumo: ResumoProducao, updatedAt: number) => void;
    }
  ): Promise<ResumoProducao> => {
    const data = await getWithCache<ApiResponse<ResumoProducao>>(
      '/producao/resumo',
      filtros as Record<string, unknown> | undefined,
      API_CACHE_TTL_MS,
      {
        forceRefresh: options?.forceRefresh,
        staleWhileRevalidate: options?.staleWhileRevalidate,
        onUpdate: options?.onUpdate
          ? (fresh, updatedAt) => {
              const payload = (fresh && typeof fresh === 'object' && 'data' in fresh)
                ? ((fresh as { data?: ResumoProducao }).data ?? fresh)
                : fresh;
              options.onUpdate?.(mapResumo(payload), updatedAt);
            }
          : undefined,
      }
    );
    const payload = (data && typeof data === 'object' && 'data' in data)
      ? ((data as { data?: ResumoProducao }).data ?? data)
      : data;
    return mapResumo(payload);
  },
  getPorCompetencia: async (
    filtros?: FiltrosDashboard,
    options?: { forceRefresh?: boolean }
  ): Promise<ProducaoCompetencia[]> => {
    const data = await getWithCache(
      '/producao/por-competencia',
      filtros as Record<string, unknown> | undefined,
      API_CACHE_TTL_MS,
      { forceRefresh: options?.forceRefresh }
    );
    return mapPorCompetencia(data);
  },
  getPorMunicipio: async (
    filtros?: FiltrosDashboard,
    options?: { forceRefresh?: boolean }
  ): Promise<PaginatedResponse<ProducaoMunicipio>> => {
    const data = await getWithCache(
      '/producao/por-municipio',
      filtros as Record<string, unknown> | undefined,
      API_CACHE_TTL_MS,
      { forceRefresh: options?.forceRefresh }
    );
    return mapPaginated<ProducaoMunicipio>(data, mapPorMunicipio);
  },
  getPorProcedimento: async (filtros?: FiltrosDashboard, options?: { forceRefresh?: boolean }): Promise<PaginatedResponse<ProducaoProcedimento>> => {
    const data = await getWithCache('/producao/por-procedimento', filtros as Record<string, unknown> | undefined, API_CACHE_TTL_MS, { forceRefresh: options?.forceRefresh });
    return mapPaginated<ProducaoProcedimento>(data, mapPorProcedimento);
  },
  getPorCBO: async (filtros?: FiltrosDashboard, options?: { forceRefresh?: boolean }): Promise<PaginatedResponse<ProducaoCBO>> => {
    const data = await getWithCache('/producao/por-cbo', filtros as Record<string, unknown> | undefined, API_CACHE_TTL_MS, { forceRefresh: options?.forceRefresh });
    return mapPaginated<ProducaoCBO>(data, mapPorCBO);
  },
  getCompetencias: async (): Promise<Competencia[]> => {
    const data = await getWithCache('/producao/competencias');
    return mapCompetencias(data);
  },
};

// Dimensões
export const dimService = {
  getFiltros: async (): Promise<DimFiltrosPayload> => {
    const data = await getWithCache('/dim/filtros');
    return mapDimFiltros(data);
  },
  getMunicipios: async (uf?: string): Promise<Municipio[]> => {
    const data = await getWithCache('/dim/municipios', { uf });
    return mapMunicipios(data);
  },
  getUFs: async (): Promise<UF[]> => {
    const data = await getWithCache('/dim/ufs');
    return mapUFs(data);
  },
  getProcedimentos: async (): Promise<Procedimento[]> => {
    const data = await getWithCache('/dim/procedimentos');
    return mapProcedimentos(data);
  },
  getCBOs: async (): Promise<CBO[]> => {
    const data = await getWithCache('/dim/cbos');
    return mapCBOs(data);
  },
  getCNES: async (filtros?: FiltrosDashboard): Promise<CNES[]> => {
    const data = await getWithCache('/dim/cnes', filtros as Record<string, unknown> | undefined);
    return mapCNES(data);
  },
};

export default api;
