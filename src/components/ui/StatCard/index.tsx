import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  orange: 'bg-orange-50 text-orange-600',
};

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'blue' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 shadow-xs">
      <div className="flex items-start justify-between">
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <div>
        <p className="text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {trend && (
        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-50">
          <span
            className={`text-xs font-medium ${trend.value >= 0 ? 'text-green-600' : 'text-red-500'}`}
          >
            {trend.value >= 0 ? '▲' : '▼'} {Math.abs(trend.value)}%
          </span>
          <span className="text-xs text-gray-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}

// Skeleton loader para StatCard
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 shadow-xs animate-pulse">
      <div className="flex items-start justify-between">
        <div className="h-4 w-28 bg-gray-100 rounded" />
        <div className="w-9 h-9 bg-gray-100 rounded-lg" />
      </div>
      <div>
        <div className="h-7 w-32 bg-gray-100 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded mt-1" />
      </div>
    </div>
  );
}

interface StatCardGridProps {
  children: ReactNode;
}

export function StatCardGrid({ children }: StatCardGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {children}
    </div>
  );
}
