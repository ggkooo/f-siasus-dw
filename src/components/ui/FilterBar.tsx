import { Filter, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { dimService } from '../../services/api';
import type { FiltrosDashboard, Municipio, Procedimento, CBO } from '../../types';
import { formatCompetencia } from '../../utils/format';

interface FilterBarProps {
  value: FiltrosDashboard;
  onChange: (filtros: FiltrosDashboard) => void;
}

export default function FilterBar({ value, onChange }: FilterBarProps) {
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

    const loadFilterOptions = async () => {
      try {
        const filtros = await dimService.getFiltros();
        if (!active) return;

        setInicioOptions(filtros.selects.inicio ?? []);
        setFimOptions(filtros.selects.fim ?? []);
        setUFs(filtros.selects.uf ?? []);

        setMunicipios((filtros.selects.municipio ?? []).map((m) => ({
          codigo: m.codigo_mun,
          nome: m.nome_mun,
          uf: m.uf,
        })));

        setProcedimentos((filtros.selects.procedimento ?? []).map((p) => ({
          codigo: p.cod_procedimento,
          nome: p.nome_procedimento,
          grupo: '',
        })));

        setCBOs((filtros.selects.cbo ?? []).map((c) => ({
          codigo: c.codigo_cbo,
          nome: c.nome_cbo,
        })));

        setCNES(filtros.selects.cnes ?? []);

        setAnoPlaceholder(filtros.inputs?.ano?.values?.[0] ?? '2025');
        setMinPlaceholder(String(filtros.inputs?.valor_minimo?.suggested_min ?? 0));
        setMaxPlaceholder(String(filtros.inputs?.valor_maximo?.suggested_max ?? 10000));
      } catch {
        if (!active) return;
        setInicioOptions([]);
        setFimOptions([]);
        setUFs([]);
        setMunicipios([]);
        setProcedimentos([]);
        setCBOs([]);
        setCNES([]);
      }
    };

    loadFilterOptions();

    return () => {
      active = false;
    };
  }, []);

  const visibleMunicipios = value.uf
    ? municipios.filter((m) => m.uf === value.uf)
    : municipios;

  const handleChange = (key: keyof FiltrosDashboard, val: string) => {
    onChange({ ...value, [key]: val || undefined });
  };

  const handleReset = () => onChange({});

  const hasFilters = Object.values(value).some(Boolean);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs px-4 py-3 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 text-gray-400 shrink-0">
        <Filter className="w-3.5 h-3.5" />
        <span className="text-xs font-medium uppercase tracking-wide">Filtros</span>
      </div>

      <div className="w-px h-4 bg-gray-100 shrink-0" />

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">De</label>
        <select
          value={value.competencia_inicio ?? ''}
          onChange={(e) => handleChange('competencia_inicio', e.target.value)}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white min-w-[120px]"
        >
          <option value="">Início</option>
          {inicioOptions.map((competencia) => (
            <option key={competencia} value={competencia}>{formatCompetencia(competencia)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Até</label>
        <select
          value={value.competencia_fim ?? ''}
          onChange={(e) => handleChange('competencia_fim', e.target.value)}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white min-w-[120px]"
        >
          <option value="">Fim</option>
          {fimOptions.map((competencia) => (
            <option key={competencia} value={competencia}>{formatCompetencia(competencia)}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">UF</label>
        <select
          value={value.uf ?? ''}
          onChange={(e) => handleChange('uf', e.target.value)}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white min-w-[100px]"
        >
          <option value="">Todas</option>
          {ufs.map((uf) => (
            <option key={uf} value={uf}>{uf}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Ano</label>
        <input
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={value.ano ?? ''}
          onChange={(e) => handleChange('ano', e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder={anoPlaceholder}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white min-w-[92px]"
        />
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Município</label>
        <select
          value={value.codigo_mun ?? ''}
          onChange={(e) => handleChange('codigo_mun', e.target.value)}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white min-w-[180px]"
        >
          <option value="">Todos</option>
          {visibleMunicipios.map((m) => (
            <option key={m.codigo} value={m.codigo}>{m.nome} ({m.uf})</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Procedimento</label>
        <select
          value={value.cod_procedimento ?? ''}
          onChange={(e) => handleChange('cod_procedimento', e.target.value)}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white min-w-[190px]"
        >
          <option value="">Todos</option>
          {procedimentos.map((p) => (
            <option key={p.codigo} value={p.codigo}>{p.codigo} - {p.nome}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">CBO</label>
        <select
          value={value.codigo_cbo ?? ''}
          onChange={(e) => handleChange('codigo_cbo', e.target.value)}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white min-w-[180px]"
        >
          <option value="">Todos</option>
          {cbos.map((c) => (
            <option key={c.codigo} value={c.codigo}>{c.codigo} - {c.nome}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">CNES</label>
        <select
          value={value.cnes ?? ''}
          onChange={(e) => handleChange('cnes', e.target.value)}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white min-w-[180px]"
        >
          <option value="">Todos</option>
          {cnes.map((codigo) => (
            <option key={codigo} value={codigo}>{codigo}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Valor min</label>
        <input
          type="number"
          min={0}
          value={value.min_valor ?? ''}
          onChange={(e) => onChange({ ...value, min_valor: e.target.value ? Number(e.target.value) : undefined })}
          placeholder={minPlaceholder}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white min-w-[96px]"
        />
      </div>
      <div className="flex flex-col gap-0.5">
        <label className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Valor max</label>
        <input
          type="number"
          min={0}
          value={value.max_valor ?? ''}
          onChange={(e) => onChange({ ...value, max_valor: e.target.value ? Number(e.target.value) : undefined })}
          placeholder={maxPlaceholder}
          className="text-sm text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white min-w-[96px]"
        />
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-600 mt-auto pb-1 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={Boolean(value.sem_custo)}
          onChange={(e) => onChange({ ...value, sem_custo: e.target.checked ? '1' : undefined })}
          className="rounded border-gray-300"
        />
        Sem custo
      </label>

      {hasFilters && (
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors mt-auto pb-0.5"
        >
          <RotateCcw className="w-3 h-3" />
          Limpar
        </button>
      )}
    </div>
  );
}
