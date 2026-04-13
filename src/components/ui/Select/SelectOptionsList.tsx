import { Check } from 'lucide-react';
import type { SelectOption } from './types';

interface SelectOptionsListProps {
  visible: SelectOption[];
  value: string;
  clearLabel: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

export default function SelectOptionsList({
  visible,
  value,
  clearLabel,
  onChange,
  onClose,
}: SelectOptionsListProps) {
  return (
    <ul className="max-h-56 overflow-y-auto overscroll-contain py-1">
      <li
        onClick={() => {
          onChange('');
          onClose();
        }}
        className={[
          'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors select-none',
          !value ? 'text-blue-600 bg-blue-50/60 font-medium' : 'text-gray-400 hover:bg-gray-50',
        ].join(' ')}
      >
        <span className="w-4 shrink-0 flex justify-center">{!value && <Check className="w-3.5 h-3.5" />}</span>
        <span className="italic">{clearLabel}</span>
      </li>

      {visible.length === 0 ? (
        <li className="px-3 py-4 text-sm text-gray-400 text-center">Nenhum resultado</li>
      ) : (
        visible.map((opt) => (
          <li
            key={opt.value}
            onClick={() => {
              onChange(opt.value);
              onClose();
            }}
            className={[
              'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors select-none',
              opt.value === value ? 'text-blue-600 bg-blue-50/60 font-medium' : 'text-gray-700 hover:bg-gray-50',
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
  );
}
