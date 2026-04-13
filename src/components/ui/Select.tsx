import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const visible = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  useEffect(() => {
    if (!open) { setQuery(''); return; }
    if (searchable) requestAnimationFrame(() => inputRef.current?.focus());
  }, [open, searchable]);

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
          className="absolute z-50 top-[calc(100%+6px)] left-0 min-w-full w-max max-w-[300px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
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

          <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
            <li
              onClick={() => { onChange(''); setOpen(false); }}
              className={[
                'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors select-none',
                !value ? 'text-blue-600 bg-blue-50/60 font-medium' : 'text-gray-400 hover:bg-gray-50',
              ].join(' ')}
            >
              <span className="w-4 shrink-0 flex justify-center">
                {!value && <Check className="w-3.5 h-3.5" />}
              </span>
              <span className="italic">{clearLabel ?? placeholder}</span>
            </li>

            {visible.length === 0 ? (
              <li className="px-3 py-4 text-sm text-gray-400 text-center">Nenhum resultado</li>
            ) : (
              visible.map((opt) => (
                <li
                  key={opt.value}
                  onClick={() => { onChange(opt.value); setOpen(false); }}
                  className={[
                    'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors select-none',
                    opt.value === value
                      ? 'text-blue-600 bg-blue-50/60 font-medium'
                      : 'text-gray-700 hover:bg-gray-50',
                  ].join(' ')}
                >
                  <span className="w-4 shrink-0 flex justify-center">
                    {opt.value === value && <Check className="w-3.5 h-3.5" />}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
