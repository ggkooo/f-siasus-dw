export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  message?: string;
  user?: User;
}

// Resumo geral da produção
export interface ResumoProducao {
  total_linhas: number;
  total_cidades: number;
  total_qtd: number;
  total_valor: number;
}

// Produção por competência
export interface ProducaoCompetencia {
  competencia: string;
  total_registros: number;
  total_valor_aprovado: number;
}

// Produção por município
export interface ProducaoMunicipio {
  municipio_codigo: string;
  municipio_nome: string;
  uf: string;
  total_registros: number;
  total_valor_aprovado: number;
}

// Produção por procedimento
export interface ProducaoProcedimento {
  procedimento_codigo: string;
  procedimento_nome: string;
  total_registros: number;
  total_valor_aprovado: number;
}

// Produção por CBO
export interface ProducaoCBO {
  cbo_codigo: string;
  cbo_nome: string;
  total_registros: number;
  total_valor_aprovado: number;
}

// Dimensões
export interface Municipio {
  codigo: string;
  nome: string;
  uf: string;
}

export interface UF {
  codigo: string;
  nome: string;
  sigla: string;
}

export interface Procedimento {
  codigo: string;
  nome: string;
  grupo: string;
}

export interface CBO {
  codigo: string;
  nome: string;
}

export interface CNES {
  codigo: string;
  nome: string;
  municipio: string;
}

export interface DimFiltrosSelects {
  inicio: string[];
  fim: string[];
  uf: string[];
  municipio: Array<{
    codigo_mun: string;
    nome_mun: string;
    uf: string;
  }>;
  procedimento: Array<{
    cod_procedimento: string;
    nome_procedimento: string;
  }>;
  cbo: Array<{
    codigo_cbo: string;
    nome_cbo: string;
  }>;
  cnes: string[];
}

export interface DimFiltrosInputs {
  ano?: {
    type: string;
    format?: string;
    values?: string[];
  };
  valor_minimo?: {
    type: string;
    suggested_min?: number;
  };
  valor_maximo?: {
    type: string;
    suggested_max?: number;
  };
}

export interface DimFiltrosResponse {
  selects: DimFiltrosSelects;
  inputs?: DimFiltrosInputs;
}

export interface Competencia {
  competencia: string;
  label: string;
}

// Filtros da dashboard
export interface FiltrosDashboard {
  competencia?: string;
  competencia_inicio?: string;
  competencia_fim?: string;
  ano?: string;
  codigo_mun?: string;
  nome_mun?: string;
  uf?: string;
  codigo_cbo?: string;
  cod_procedimento?: string;
  cnes?: string;
  min_valor?: number;
  max_valor?: number;
  sem_custo?: string | boolean;
  page?: number;
  per_page?: number;
}

// Resposta paginada genérica
export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface DimFiltrosPayload {
  selects: {
    inicio: string[];
    fim: string[];
    uf: string[];
    municipio: Array<{
      codigo_mun: string;
      nome_mun: string;
      uf: string;
    }>;
    procedimento: Array<{
      cod_procedimento: string;
      nome_procedimento: string;
    }>;
    cbo: Array<{
      codigo_cbo: string;
      nome_cbo: string;
    }>;
    cnes: string[];
  };
  inputs?: {
    ano?: {
      values?: string[];
    };
    valor_minimo?: {
      suggested_min?: number;
    };
    valor_maximo?: {
      suggested_max?: number;
    };
  };
}
