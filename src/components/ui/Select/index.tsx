import { ChevronDown, Search, X } from 'lucide-react';
import SelectOptionsList from './SelectOptionsList';
import { useSelectState } from './useSelectState';
import type { SelectOption } from './types';

export type { SelectOption } from './types';

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  clearLabel?: string;
  disabled?: boolean;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Selecionar',
  searchable = false,
  clearLabel,
  disabled = false,
}: SelectProps) {
  const { open, setOpen, query, setQuery, containerRef, inputRef } = useSelectState(searchable);

  const selected = options.find((o) => o.value === value);

  const visible = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); e.stopPropagation(); }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className={[
          'w-full flex items-center justify-between gap-2 px-3 py-[7px] rounded-lg border text-sm',
          'transition-all duration-150 bg-white text-left focus:outline-none',
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : '',
          open
            ? 'border-blue-400 ring-2 ring-blue-500/15 shadow-sm'
            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/40',
          selected ? 'text-gray-800' : 'text-gray-400',
        ].join(' ')}
      >
        <span className="truncate min-w-0 leading-snug">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 shrink-0 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className="absolute z-50 top-[calc(100%+6px)] left-0 w-full sm:min-w-full sm:w-max max-w-full sm:max-w-[320px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          onKeyDown={handleKeyDown}
        >
          {searchable && (
            <div className="p-2 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          <SelectOptionsList
            visible={visible}
            value={value}
            clearLabel={clearLabel ?? placeholder}
            onChange={onChange}
            onClose={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
