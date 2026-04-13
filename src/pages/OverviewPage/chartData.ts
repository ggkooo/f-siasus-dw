import { formatCompetencia } from '../../utils/format';

export interface OverviewCompetenciaPoint {
  competencia: string;
  total_registros: number;
}

export interface OverviewMunicipioPoint {
  municipio_nome: string;
  total_registros: number;
}

export function mapCompetenciaChartData(data: OverviewCompetenciaPoint[]) {
  return data.map((item) => ({
    competencia: formatCompetencia(item.competencia),
    total: item.total_registros,
  }));
}

export function mapMunicipioChartData(data: OverviewMunicipioPoint[]) {
  return [...data]
    .sort((a, b) => b.total_registros - a.total_registros)
    .slice(0, 10)
    .map((item) => ({
      municipio: item.municipio_nome.length > 16 ? `${item.municipio_nome.slice(0, 16)}...` : item.municipio_nome,
      municipioCompleto: item.municipio_nome,
      total: item.total_registros,
    }));
}
