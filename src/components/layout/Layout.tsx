import { useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function Layout({ children, title, subtitle, actions }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen lg:h-screen bg-gray-50 lg:overflow-hidden">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/45"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative h-full w-[82%] max-w-72 shadow-2xl">
            <Sidebar className="h-full" onNavigate={() => setMobileMenuOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 min-h-screen lg:min-h-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-4 lg:py-5 flex items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-flex lg:hidden mt-0.5 h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h1>
              {subtitle && <p className="text-xs sm:text-sm text-gray-400 mt-0.5 line-clamp-2">{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="flex items-center gap-2 sm:gap-3 shrink-0">{actions}</div>}
        </header>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
