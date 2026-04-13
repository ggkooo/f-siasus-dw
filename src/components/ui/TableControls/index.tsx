import { Search } from 'lucide-react';
import { type ReactNode } from 'react';

interface TableControlsProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  maxItemsPerPage?: number;
  children?: ReactNode;
}

export default function TableControls({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  maxItemsPerPage,
  children,
}: TableControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/15"
          />
        </div>
        {typeof maxItemsPerPage === 'number' && (
          <span className="text-xs text-gray-400 whitespace-nowrap self-start sm:self-auto">
            Máx. {maxItemsPerPage} por página
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
