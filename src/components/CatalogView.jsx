import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.js';
import { useCatalogFilters } from '../hooks/useCatalogFilters.js';
import { activeFilterChips, applyCatalogQuery, removeChip } from '../utils/productUtils.js';
import SearchBar from './SearchBar.jsx';
import FilterSidebar from './FilterSidebar.jsx';
import SortDropdown from './SortDropdown.jsx';
import Pagination from './Pagination.jsx';
import ProductGrid from './ProductGrid.jsx';
import ProductSkeleton from './ProductSkeleton.jsx';
import ErrorMessage from './ErrorMessage.jsx';
import EmptyState from './EmptyState.jsx';

const PAGE_SIZE = 12;

/** Shared catalog browser: search + filters + sort + pagination, all stored in the URL. */
export default function CatalogView({ heading, eyebrow }) {
  const { products, loading, error, refetch } = useProducts();
  const { filters, update, clearAll } = useCatalogFilters();

  const results = useMemo(() => applyCatalogQuery(products, filters), [products, filters]);
  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const visible = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const chips = activeFilterChips(filters);
  const onSearch = useCallback((q) => update({ q }), [update]);

  return (
    <div className="search-page section-wrap">
      <div className="search-page-header">
        <p className="search-breadcrumb"><Link to="/">Home</Link> <span>›</span> <span>{filters.q ? 'Search results' : heading}</span></p>
        <p className="eyebrow"><span></span> {eyebrow}</p>
        <h1>{filters.q ? <>Results for “{filters.q}”</> : heading}</h1>
        {!loading && !error && (
          <p className="search-result-count" aria-live="polite">
            {results.length} {results.length === 1 ? 'product' : 'products'} found
          </p>
        )}
        <SearchBar value={filters.q} onSearch={onSearch} />
      </div>

      {error ? (
        <ErrorMessage title="We couldn’t load the products" message={error.message} onRetry={refetch} />
      ) : (
        <div className="search-page-layout">
          {loading ? (
            <aside className="search-sidebar" aria-hidden="true"><div className="skeleton skeleton-side" /></aside>
          ) : (
            <FilterSidebar products={products} filters={filters} onChange={update} onClear={clearAll} />
          )}

          <div className="search-results-area">
            <div className="search-results-topbar">
              <SortDropdown value={filters.sort} onChange={(sort) => update({ sort })} products={products} />
            </div>

            {chips.length > 0 && (
              <div className="active-filters" aria-label="Active filters">
                {chips.map((c) => (
                  <button key={c.key} type="button" className="chip" onClick={() => update(removeChip(filters, c.key))}>
                    {c.label} <span aria-hidden="true">×</span><span className="sr-only"> remove filter</span>
                  </button>
                ))}
                <button type="button" className="chip chip-clear" onClick={clearAll}>Clear all</button>
              </div>
            )}

            {loading ? (
              <ProductSkeleton count={8} />
            ) : visible.length === 0 ? (
              <EmptyState
                title="No results found"
                message={filters.q ? `Nothing matched “${filters.q}” with your current filters. Try different keywords or remove a filter.` : 'No products match your filters.'}
              >
                <button type="button" className="button button-lime" onClick={clearAll}>Clear filters</button>
                {filters.q && <button type="button" className="button button-outline" onClick={() => update({ q: '' })}>Reset search</button>}
              </EmptyState>
            ) : (
              <>
                <ProductGrid products={visible} className="product-grid catalog-grid" />
                <Pagination page={page} totalPages={totalPages} onChange={(p) => { update({ page: p }, { keepPage: true, replace: false }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
