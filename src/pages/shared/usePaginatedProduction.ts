import { useEffect, useMemo, useRef, useState } from 'react';
import type { FiltrosDashboard, PaginatedResponse } from '../../types';

interface UsePaginatedProductionParams<T> {
  filtros: FiltrosDashboard;
  searchValue: string;
  searchKey: keyof FiltrosDashboard;
  perPage: number;
  getFromCache: (filtros?: FiltrosDashboard) => PaginatedResponse<T>;
  getData: (filtros?: FiltrosDashboard) => Promise<PaginatedResponse<T>>;
}

export function usePaginatedProduction<T>({
  filtros,
  searchValue,
  searchKey,
  perPage,
  getFromCache,
  getData,
}: UsePaginatedProductionParams<T>) {
  const [page, setPage] = useState(1);
  const requestVersionRef = useRef(0);
  const [result, setResult] = useState<PaginatedResponse<T>>(
    () => getFromCache({ ...filtros, [searchKey]: undefined, page: 1, per_page: perPage })
  );
  const [loading, setLoading] = useState(result.data.length === 0);

  useEffect(() => {
    setPage(1);
  }, [filtros, searchValue]);

  useEffect(() => {
    const requestVersion = ++requestVersionRef.current;

    const params = {
      ...filtros,
      [searchKey]: searchValue.trim() || undefined,
      page,
      per_page: perPage,
    };

    const cached = getFromCache(params);
    if (cached.data.length > 0) {
      setResult(cached);
      setLoading(false);
      void getData(params)
        .then((next) => {
          if (requestVersionRef.current === requestVersion) {
            setResult(next);
          }
        })
        .catch(() => {});
      return;
    }

    setLoading(true);
    void getData(params)
      .then((next) => {
        if (requestVersionRef.current === requestVersion) {
          setResult(next);
        }
      })
      .finally(() => {
        if (requestVersionRef.current === requestVersion) {
          setLoading(false);
        }
      });
  }, [filtros, searchValue, page, searchKey, perPage, getFromCache, getData]);

  const pagination = useMemo(() => {
    const useServerPagination = result.last_page > 1 || result.total > result.data.length;
    const localLastPage = Math.max(1, Math.ceil(result.data.length / perPage));
    const effectiveLastPage = useServerPagination ? result.last_page : localLastPage;
    const effectivePage = Math.min(page, effectiveLastPage);
    const tableData = useServerPagination
      ? result.data
      : result.data.slice((effectivePage - 1) * perPage, effectivePage * perPage);

    return {
      useServerPagination,
      effectiveLastPage,
      effectivePage,
      tableData,
      effectiveTotal: useServerPagination ? result.total : result.data.length,
      effectivePerPage: useServerPagination ? result.per_page : perPage,
    };
  }, [result, page, perPage]);

  return {
    page,
    setPage,
    result,
    loading,
    ...pagination,
  };
}
