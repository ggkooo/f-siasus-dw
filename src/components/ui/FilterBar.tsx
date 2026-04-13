import { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, X, RotateCcw, ChevronDown } from 'lucide-react';
import Select from './Select';
import { dimService } from '../../services/api';
import type { FiltrosDashboard, Municipio, Procedimento, CBO } from '../../types';
import { formatCompetencia } from '../../utils/format';

interface FilterBarProps {
  value: FiltrosDashboard;
  onChange: (filtros: FiltrosDashboard) => void;
}

// — Field wrapper ————————————————————————————————————————————————
function Field({ label, children, width = 'w-full sm:w-auto sm:min-w-[130px]' }: {
  label: string;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${width}`}>
      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest leading-none">
        {label}
      </span>
      {children}
    </div>
  );
}

// — Section header ———————————————————————————————————————————————
function Section({ label }: { label: string }) {
  return (
    <div className="col-span-full flex items-center gap-2 w-full mt-1">
      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

// — Input style ——————————————————————————————————————————————————
const inputCx =
  'w-full px-3 py-[7px] rounded-lg border border-gray-200 text-sm text-gray-800 ' +
  'placeholder-gray-400 bg-white transition-all duration-150 outline-none ' +
  'hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 focus:shadow-sm';

// — Chip ————————————————————————————————————————————————————————
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-xs text-blue-700 font-medium">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200/70 text-blue-500 hover:text-blue-700 transition-colors"
      >
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

// ————————————————————————————————————————————————————————————————
export default function FilterBar({ value, onChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
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
    dimService.getFiltros().then((filtros) => {
      if (!active) return;
      setInicioOptions(filtros.selects.inicio ?? []);
      setFimOptions(filtros.selects.fim ?? []);
      setUFs(filtros.selects.uf ?? []);
      setMunicipios((filtros.selects.municipio ?? []).map((m) => ({
        codigo: m.codigo_mun, nome: m.nome_mun, uf: m.uf,
      })));
      setProcedimentos((filtros.selects.procedimento ?? []).map((p) => ({
        codigo: p.cod_procedimento, nome: p.nome_procedimento, grupo: '',
      })));
      setCBOs((filtros.selects.cbo ?? []).map((c) => ({
        codigo: c.codigo_cbo, nome: c.nome_cbo,
      })));
      setCNES(filtros.selects.cnes ?? []);
      setAnoPlaceholder(filtros.inputs?.ano?.values?.[0] ?? '2025');
      setMinPlaceholder(String(filtros.inputs?.valor_minimo?.suggested_min ?? 0));
      setMaxPlaceholder(String(filtros.inputs?.valor_maximo?.suggested_max ?? 10000));
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  // — Derived select options ————————————————————————————————————
  const inicioOpts = useMemo(() =>
    inicioOptions.map((c) => ({ value: c, label: formatCompetencia(c) })), [inicioOptions]);

  const fimOpts = useMemo(() =>
    fimOptions.map((c) => ({ value: c, label: formatCompetencia(c) })), [fimOptions]);

  const ufOpts = useMemo(() =>
    ufs.map((u) => ({ value: u, label: u })), [ufs]);

  const municipioOpts = useMemo(() => {
    const list = value.uf ? municipios.filter((m) => m.uf === value.uf) : municipios;
    return list.map((m) => ({ value: m.codigo, label: `${m.nome} (${m.uf})` }));
  }, [municipios, value.uf]);

  const procedimentoOpts = useMemo(() =>
    procedimentos.map((p) => ({ value: p.codigo, label: `${p.codigo} — ${p.nome}` })),
    [procedimentos]);

  const cboOpts = useMemo(() =>
    cbos.map((c) => ({ value: c.codigo, label: `${c.codigo} — ${c.nome}` })), [cbos]);

  const cnesOpts = useMemo(() =>
    cnes.map((c) => ({ value: c, label: c })), [cnes]);

  // — Handlers ——————————————————————————————————————————————————
  const set = (key: keyof FiltrosDashboard, val: string) =>
    onChange({ ...value, [key]: val || undefined });

  const clearKey = (key: keyof FiltrosDashboard) => {
    const next = { ...value };
    delete next[key];
    onChange(next);
  };

  const handleReset = () => onChange({});

  // — Active filter chips ————————————————————————————————————————
  const chips = useMemo(() => {
    const out: { key: keyof FiltrosDashboard; label: string }[] = [];

    if (value.competencia_inicio)
      out.push({ key: 'competencia_inicio', label: `De: ${formatCompetencia(value.competencia_inicio)}` });
    if (value.competencia_fim)
      out.push({ key: 'competencia_fim', label: `Até: ${formatCompetencia(value.competencia_fim)}` });
    if (value.ano)
      out.push({ key: 'ano', label: `Ano: ${value.ano}` });
    if (value.uf)
      out.push({ key: 'uf', label: `UF: ${value.uf}` });
    if (value.codigo_mun) {
      const m = municipios.find((x) => x.codigo === value.codigo_mun);
      out.push({ key: 'codigo_mun', label: `Município: ${m?.nome ?? value.codigo_mun}` });
    }
    if (value.cod_procedimento) {
      const p = procedimentos.find((x) => x.codigo === value.cod_procedimento);
      const nome = p?.nome ? (p.nome.length > 28 ? p.nome.slice(0, 28) + '…' : p.nome) : value.cod_procedimento;
      out.push({ key: 'cod_procedimento', label: `Proc: ${nome}` });
    }
    if (value.codigo_cbo) {
      const c = cbos.find((x) => x.codigo === value.codigo_cbo);
      const nome = c?.nome ? (c.nome.length > 28 ? c.nome.slice(0, 28) + '…' : c.nome) : value.codigo_cbo;
      out.push({ key: 'codigo_cbo', label: `CBO: ${nome}` });
    }
    if (value.cnes)
      out.push({ key: 'cnes', label: `CNES: ${value.cnes}` });
    if (value.min_valor !== undefined)
      out.push({ key: 'min_valor', label: `Valor ≥ ${value.min_valor}` });
    if (value.max_valor !== undefined)
      out.push({ key: 'max_valor', label: `Valor ≤ ${value.max_valor}` });
    if (value.sem_custo)
      out.push({ key: 'sem_custo', label: 'Sem custo' });

    return out;
  }, [value, municipios, procedimentos, cbos]);

  const activeCount = chips.length;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-visible">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Filtros</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-blue-600 text-[10px] font-bold text-white leading-none">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {activeCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar tudo
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {isOpen ? 'Ocultar filtros' : 'Exibir filtros'}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter fields */}
      {isOpen && (
      <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Section label="Período" />
        <Field label="De" width="w-full sm:w-auto sm:min-w-[130px]">
          <Select
            options={inicioOpts}
            value={value.competencia_inicio ?? ''}
            onChange={(v) => set('competencia_inicio', v)}
            placeholder="Início"
            clearLabel="Todos"
          />
        </Field>
        <Field label="Até" width="w-full sm:w-auto sm:min-w-[130px]">
          <Select
            options={fimOpts}
            value={value.competencia_fim ?? ''}
            onChange={(v) => set('competencia_fim', v)}
            placeholder="Fim"
            clearLabel="Todos"
          />
        </Field>
        <Field label="Ano" width="w-full sm:w-auto sm:min-w-[88px]">
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={value.ano ?? ''}
            onChange={(e) => set('ano', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder={anoPlaceholder}
            className={inputCx}
          />
        </Field>

        <Section label="Localização" />
        <Field label="UF" width="w-full sm:w-auto sm:min-w-[96px]">
          <Select
            options={ufOpts}
            value={value.uf ?? ''}
            onChange={(v) => {
              onChange({ ...value, uf: v || undefined, codigo_mun: undefined });
            }}
            placeholder="Todas"
            clearLabel="Todas"
          />
        </Field>
        <Field label="Município" width="w-full sm:w-auto sm:min-w-[200px]">
          <Select
            options={municipioOpts}
            value={value.codigo_mun ?? ''}
            onChange={(v) => set('codigo_mun', v)}
            placeholder="Todos"
            clearLabel="Todos"
            searchable
            disabled={municipioOpts.length === 0}
          />
        </Field>

        <Section label="Clínico" />
        <Field label="Procedimento" width="w-full sm:w-auto sm:min-w-[210px]">
          <Select
            options={procedimentoOpts}
            value={value.cod_procedimento ?? ''}
            onChange={(v) => set('cod_procedimento', v)}
            placeholder="Todos"
            clearLabel="Todos"
            searchable
          />
        </Field>
        <Field label="CBO" width="w-full sm:w-auto sm:min-w-[200px]">
          <Select
            options={cboOpts}
            value={value.codigo_cbo ?? ''}
            onChange={(v) => set('codigo_cbo', v)}
            placeholder="Todos"
            clearLabel="Todos"
            searchable
          />
        </Field>
        <Field label="CNES" width="w-full sm:w-auto sm:min-w-[140px]">
          <Select
            options={cnesOpts}
            value={value.cnes ?? ''}
            onChange={(v) => set('cnes', v)}
            placeholder="Todos"
            clearLabel="Todos"
            searchable={cnesOpts.length > 8}
          />
        </Field>

        <Section label="Valor" />
        <Field label="Valor mínimo" width="w-full sm:w-auto sm:min-w-[110px]">
          <input
            type="number"
            min={0}
            value={value.min_valor ?? ''}
            onChange={(e) => onChange({ ...value, min_valor: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={minPlaceholder}
            className={inputCx}
          />
        </Field>
        <Field label="Valor máximo" width="w-full sm:w-auto sm:min-w-[110px]">
          <input
            type="number"
            min={0}
            value={value.max_valor ?? ''}
            onChange={(e) => onChange({ ...value, max_valor: e.target.value ? Number(e.target.value) : undefined })}
            placeholder={maxPlaceholder}
            className={inputCx}
          />
        </Field>
        <Field label="Sem custo" width="w-full sm:w-auto sm:min-w-[96px]">
          <label className="flex items-center gap-2 h-[33px] cursor-pointer select-none">
            <div
              onClick={() => onChange({ ...value, sem_custo: value.sem_custo ? undefined : '1' })}
              className={[
                'w-9 h-5 rounded-full border-2 transition-all duration-200 relative cursor-pointer flex-shrink-0',
                value.sem_custo
                  ? 'bg-blue-600 border-blue-600'
                  : 'bg-gray-100 border-gray-200',
              ].join(' ')}
            >
              <span
                className={[
                  'absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200',
                  value.sem_custo ? 'translate-x-[18px]' : 'translate-x-0.5',
                ].join(' ')}
              />
            </div>
            <span className={`text-sm transition-colors ${value.sem_custo ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
              Ativo
            </span>
          </label>
        </Field>
      </div>
      )}

      {/* Active chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3 border-t border-gray-50 pt-3">
          {chips.map(({ key, label }) => (
            <Chip key={key} label={label} onRemove={() => clearKey(key)} />
          ))}
        </div>
      )}
    </div>
  );
}
