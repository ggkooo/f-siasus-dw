import { useMemo, useState } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown } from 'lucide-react';
import Select from '../Select';
import type { FiltrosDashboard } from '../../../types';
import { getActiveFilterChips } from './getActiveFilterChips';
import { Field, Section, Chip, inputCx } from './ui';
import { useFilterOptions } from './useFilterOptions';

interface FilterBarProps {
  value: FiltrosDashboard;
  onChange: (filtros: FiltrosDashboard) => void;
}

// ————————————————————————————————————————————————————————————————
export default function FilterBar({ value, onChange }: FilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
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
  } = useFilterOptions(value.uf);

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
  const chips = useMemo(
    () => getActiveFilterChips(value, municipios, procedimentos, cbos),
    [value, municipios, procedimentos, cbos]
  );

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
