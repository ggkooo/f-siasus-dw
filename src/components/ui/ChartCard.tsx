import { type ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  isLoading?: boolean;
  actions?: ReactNode;
}

export default function ChartCard({ title, subtitle, children, isLoading, actions }: ChartCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xs">
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-50">
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-5">
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-48 bg-gray-50 rounded-lg" />
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
