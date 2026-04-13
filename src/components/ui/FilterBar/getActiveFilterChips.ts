import type { CBO, FiltrosDashboard, Municipio, Procedimento } from '../../../types';
import { formatCompetencia } from '../../../utils/format';

export function getActiveFilterChips(
  value: FiltrosDashboard,
  municipios: Municipio[],
  procedimentos: Procedimento[],
  cbos: CBO[]
): Array<{ key: keyof FiltrosDashboard; label: string }> {
  const out: Array<{ key: keyof FiltrosDashboard; label: string }> = [];

  if (value.competencia_inicio) {
    out.push({ key: 'competencia_inicio', label: `De: ${formatCompetencia(value.competencia_inicio)}` });
  }
  if (value.competencia_fim) {
    out.push({ key: 'competencia_fim', label: `Até: ${formatCompetencia(value.competencia_fim)}` });
  }
  if (value.ano) out.push({ key: 'ano', label: `Ano: ${value.ano}` });
  if (value.uf) out.push({ key: 'uf', label: `UF: ${value.uf}` });

  if (value.codigo_mun) {
    const m = municipios.find((x) => x.codigo === value.codigo_mun);
    out.push({ key: 'codigo_mun', label: `Município: ${m?.nome ?? value.codigo_mun}` });
  }

  if (value.cod_procedimento) {
    const p = procedimentos.find((x) => x.codigo === value.cod_procedimento);
    const nome = p?.nome
      ? p.nome.length > 28
        ? `${p.nome.slice(0, 28)}…`
        : p.nome
      : value.cod_procedimento;
    out.push({ key: 'cod_procedimento', label: `Proc: ${nome}` });
  }

  if (value.codigo_cbo) {
    const c = cbos.find((x) => x.codigo === value.codigo_cbo);
    const nome = c?.nome
      ? c.nome.length > 28
        ? `${c.nome.slice(0, 28)}…`
        : c.nome
      : value.codigo_cbo;
    out.push({ key: 'codigo_cbo', label: `CBO: ${nome}` });
  }

  if (value.cnes) out.push({ key: 'cnes', label: `CNES: ${value.cnes}` });
  if (value.min_valor !== undefined) out.push({ key: 'min_valor', label: `Valor ≥ ${value.min_valor}` });
  if (value.max_valor !== undefined) out.push({ key: 'max_valor', label: `Valor ≤ ${value.max_valor}` });
  if (value.sem_custo) out.push({ key: 'sem_custo', label: 'Sem custo' });

  return out;
}
