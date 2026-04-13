import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, lastPage, total, perPage, onPageChange }: PaginationProps) {
  const from = Math.min((currentPage - 1) * perPage + 1, total);
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
      <p className="text-xs text-gray-400 text-center sm:text-left">
        Exibindo <span className="font-medium text-gray-600">{from}–{to}</span> de{' '}
        <span className="font-medium text-gray-600">{total.toLocaleString('pt-BR')}</span> registros
      </p>
      <div className="flex items-center gap-1 self-center sm:self-auto">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 border border-gray-200 hover:border-gray-300 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="px-2 text-xs text-gray-600 font-medium">
          {currentPage} / {lastPage}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="flex items-center justify-center w-7 h-7 rounded-md text-gray-400 border border-gray-200 hover:border-gray-300 hover:text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
