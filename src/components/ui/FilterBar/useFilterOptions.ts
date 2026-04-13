import { useEffect, useMemo, useState } from 'react';
import { dimService } from '../../../services/api';
import type { CBO, Municipio, Procedimento } from '../../../types';
import { formatCompetencia } from '../../../utils/format';

export function useFilterOptions(uf?: string) {
  const [inicioOptions, setInicioOptions] = useState<string[]>([]);
  const [fimOptions, setFimOptions] = useState<string[]>([]);
  const [ufs, setUFs] = useState<string[]>([]);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([]);
  const [cbos, setCBOs] = useState<CBO[]>([]);
  const [cnes, setCNES] = useState<string[]>([]);
  const [anoPlaceholder, setAnoPlaceholder] = useState('2025');
  const [minPlaceholder, setMinPlaceholder] = useState('0');
  const [maxPlaceholder, setMaxPlaceholder] = useState('10000');

  useEffect(() => {
    let active = true;

    void dimService
      .getFiltros()
      .then((filtros) => {
        if (!active) return;
        setInicioOptions(filtros.selects.inicio ?? []);
        setFimOptions(filtros.selects.fim ?? []);
        setUFs(filtros.selects.uf ?? []);
        setMunicipios(
          (filtros.selects.municipio ?? []).map((m) => ({
            codigo: m.codigo_mun,
            nome: m.nome_mun,
            uf: m.uf,
          }))
        );
        setProcedimentos(
          (filtros.selects.procedimento ?? []).map((p) => ({
            codigo: p.cod_procedimento,
            nome: p.nome_procedimento,
            grupo: '',
          }))
        );
        setCBOs(
          (filtros.selects.cbo ?? []).map((c) => ({
            codigo: c.codigo_cbo,
            nome: c.nome_cbo,
          }))
        );
        setCNES(filtros.selects.cnes ?? []);
        setAnoPlaceholder(filtros.inputs?.ano?.values?.[0] ?? '2025');
        setMinPlaceholder(String(filtros.inputs?.valor_minimo?.suggested_min ?? 0));
        setMaxPlaceholder(String(filtros.inputs?.valor_maximo?.suggested_max ?? 10000));
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const inicioOpts = useMemo(
    () => inicioOptions.map((c) => ({ value: c, label: formatCompetencia(c) })),
    [inicioOptions]
  );
  const fimOpts = useMemo(
    () => fimOptions.map((c) => ({ value: c, label: formatCompetencia(c) })),
    [fimOptions]
  );
  const ufOpts = useMemo(() => ufs.map((u) => ({ value: u, label: u })), [ufs]);
  const municipioOpts = useMemo(() => {
    const list = uf ? municipios.filter((m) => m.uf === uf) : municipios;
    return list.map((m) => ({ value: m.codigo, label: `${m.nome} (${m.uf})` }));
  }, [municipios, uf]);
  const procedimentoOpts = useMemo(
    () => procedimentos.map((p) => ({ value: p.codigo, label: `${p.codigo} — ${p.nome}` })),
    [procedimentos]
  );
  const cboOpts = useMemo(
    () => cbos.map((c) => ({ value: c.codigo, label: `${c.codigo} — ${c.nome}` })),
    [cbos]
  );
  const cnesOpts = useMemo(() => cnes.map((c) => ({ value: c, label: c })), [cnes]);

  return {
    municipios,
    procedimentos,
    cbos,
    inicioOpts,
    fimOpts,
    ufOpts,
    municipioOpts,
    procedimentoOpts,
    cboOpts,
    cnesOpts,
    anoPlaceholder,
    minPlaceholder,
    maxPlaceholder,
  };
}
