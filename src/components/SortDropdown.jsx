import { SORT_OPTIONS, hasNewestSort } from '../utils/productUtils.js';

export default function SortDropdown({ value, onChange, products }) {
  const options = SORT_OPTIONS.filter((o) => o.value !== 'newest' || hasNewestSort(products));
  return (
    <div className="search-results-sort">
      <label htmlFor="catalog-sort">Sort by:</label>
      <select id="catalog-sort" className="sort-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
