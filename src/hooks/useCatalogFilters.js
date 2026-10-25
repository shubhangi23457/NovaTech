import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DEFAULT_FILTERS, filtersFromParams, paramsFromFilters } from '../utils/productUtils.js';

/** Search / filter / sort / page state, stored in the URL so links are shareable and refresh-safe. */
export function useCatalogFilters() {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => filtersFromParams(params), [params]);

  const update = useCallback((patch, { replace = true, keepPage = false } = {}) => {
    const next = { ...filters, ...patch };
    if (!keepPage && !('page' in patch)) next.page = 1; // any filter change returns to page 1
    setParams(paramsFromFilters(next), { replace });
  }, [filters, setParams]);

  const clearAll = useCallback(() => setParams(paramsFromFilters({ ...DEFAULT_FILTERS, q: filters.q }), { replace: true }), [filters.q, setParams]);

  return { filters, update, clearAll };
}
