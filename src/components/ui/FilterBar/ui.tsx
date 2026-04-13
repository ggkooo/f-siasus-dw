import { X } from 'lucide-react';

export function Field({
  label,
  children,
  width = 'w-full sm:w-auto sm:min-w-[130px]',
}: {
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

export function Section({ label }: { label: string }) {
  return (
    <div className="col-span-full flex items-center gap-2 w-full mt-1">
      <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest whitespace-nowrap">
        {label}
      </span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  );
}

export const inputCx =
  'w-full px-3 py-[7px] rounded-lg border border-gray-200 text-sm text-gray-800 ' +
  'placeholder-gray-400 bg-white transition-all duration-150 outline-none ' +
  'hover:border-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15 focus:shadow-sm';

export function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
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
