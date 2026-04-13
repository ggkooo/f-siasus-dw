import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { FiltrosDashboard } from '../types';

const FILTROS_SESSION_KEY = 'dashboard_filtros';

function readStoredFiltros(): FiltrosDashboard {
  try {
    const raw = sessionStorage.getItem(FILTROS_SESSION_KEY);
    return raw ? (JSON.parse(raw) as FiltrosDashboard) : {};
  } catch {
    return {};
  }
}

interface FilterContextType {
  filtros: FiltrosDashboard;
  setFiltros: (filtros: FiltrosDashboard) => void;
}

const FilterContext = createContext<FilterContextType | null>(null);

export function FilterProvider({ children }: { children: ReactNode }) {
  const [filtros, setFiltrosState] = useState<FiltrosDashboard>(readStoredFiltros);

  const setFiltros = useCallback((next: FiltrosDashboard) => {
    setFiltrosState(next);
    try {
      sessionStorage.setItem(FILTROS_SESSION_KEY, JSON.stringify(next));
    } catch {
      // ignore quota errors
    }
  }, []);

  return (
    <FilterContext.Provider value={{ filtros, setFiltros }}>
      {children}
    </FilterContext.Provider>
  );
}

export function useFiltros(): FilterContextType {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFiltros must be used within FilterProvider');
  return ctx;
}
