import { useEffect, useState } from 'react';
import { uniqueSorted } from '../utils/productUtils.js';
import { FilterIcon } from './Icons.jsx';

const PRICE_RANGES = [
  { label: 'All prices', min: '', max: '' },
  { label: 'Under ₹5,000', min: '', max: '5000' },
  { label: '₹5,000 – ₹20,000', min: '5000', max: '20000' },
  { label: '₹20,000 – ₹50,000', min: '20000', max: '50000' },
  { label: '₹50,000 – ₹1,00,000', min: '50000', max: '100000' },
  { label: 'Over ₹1,00,000', min: '100000', max: '' },
];

const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

/** Only shows filter groups for attributes that the loaded catalog actually provides. */
export default function FilterSidebar({ products, filters, onChange, onClear }) {
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(filters.min);
  const [max, setMax] = useState(filters.max);
  useEffect(() => { setMin(filters.min); setMax(filters.max); }, [filters.min, filters.max]);

  const categories = uniqueSorted(products.map((p) => p.category));
  const brands = uniqueSorted(products.map((p) => p.brand));
  const countBy = (key, v) => products.filter((p) => p[key] === v).length;
  const hasDiscount = products.some((p) => p.discount > 0);
  const hasStock = products.some((p) => p.stock !== null);
  const hasRating = products.some((p) => p.rating != null);

  const applyPrice = (e) => {
    e.preventDefault();
    let lo = min === '' ? '' : Math.max(0, Number(min));
    let hi = max === '' ? '' : Math.max(0, Number(max));
    if (lo !== '' && hi !== '' && lo > hi) [lo, hi] = [hi, lo];
    onChange({ min: lo === '' ? '' : String(lo), max: hi === '' ? '' : String(hi) });
  };
  const rangeValue = PRICE_RANGES.find((r) => r.min === filters.min && r.max === filters.max)?.label ?? '';

  return (
    <aside className="search-sidebar" aria-label="Product filters">
      <button type="button" className="search-filter-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="catalog-filters">
        <FilterIcon /> Filters
      </button>
      <div className={`search-filters ${open ? 'active' : ''}`} id="catalog-filters">
        <div className="filter-group">
          <h3 className="filter-title">Category</h3>
          <div className="filter-options">
            {categories.map((c) => (
              <label key={c} className="filter-check">
                <input type="checkbox" checked={filters.categories.includes(c)} onChange={() => onChange({ categories: toggle(filters.categories, c) })} />
                {c} <small>({countBy('category', c)})</small>
              </label>
            ))}
          </div>
        </div>

        {brands.length > 0 && (
          <div className="filter-group">
            <h3 className="filter-title">Brand</h3>
            <div className="filter-options scroll-options">
              {brands.map((b) => (
                <label key={b} className="filter-check">
                  <input type="checkbox" checked={filters.brands.includes(b)} onChange={() => onChange({ brands: toggle(filters.brands, b) })} />
                  {b} <small>({countBy('brand', b)})</small>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="filter-group">
          <h3 className="filter-title">Price</h3>
          <div className="filter-price-ranges">
            {PRICE_RANGES.map((r) => (
              <label key={r.label} className="filter-radio">
                <input type="radio" name="price-range" checked={rangeValue === r.label} onChange={() => onChange({ min: r.min, max: r.max })} />
                {r.label}
              </label>
            ))}
          </div>
          <form className="filter-price-custom" onSubmit={applyPrice}>
            <input type="number" min="0" inputMode="numeric" placeholder="₹ Min" aria-label="Minimum price" value={min} onChange={(e) => setMin(e.target.value)} />
            <span>–</span>
            <input type="number" min="0" inputMode="numeric" placeholder="₹ Max" aria-label="Maximum price" value={max} onChange={(e) => setMax(e.target.value)} />
            <button type="submit" className="filter-go-btn">Go</button>
          </form>
        </div>

        {hasRating && (
          <div className="filter-group">
            <h3 className="filter-title">Customer rating</h3>
            <div className="filter-ratings">
              {[['', 'All ratings'], ['4', '4★ & up'], ['3', '3★ & up'], ['2', '2★ & up']].map(([v, label]) => (
                <label key={v || 'all'} className="filter-radio">
                  <input type="radio" name="rating" checked={filters.rating === v} onChange={() => onChange({ rating: v })} /> {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {hasDiscount && (
          <div className="filter-group">
            <h3 className="filter-title">Discount</h3>
            <div className="filter-options">
              {[['', 'All'], ['5', '5% off or more'], ['10', '10% off or more'], ['15', '15% off or more']].map(([v, label]) => (
                <label key={v || 'all'} className="filter-radio">
                  <input type="radio" name="discount" checked={filters.discount === v} onChange={() => onChange({ discount: v })} /> {label}
                </label>
              ))}
            </div>
          </div>
        )}

        {hasStock && (
          <div className="filter-group">
            <h3 className="filter-title">Availability</h3>
            <div className="filter-options">
              <label className="filter-check">
                <input type="checkbox" checked={filters.inStock} onChange={(e) => onChange({ inStock: e.target.checked })} /> In stock only
              </label>
            </div>
          </div>
        )}

        <button type="button" className="filter-clear-btn" onClick={onClear}>Clear all filters</button>
      </div>
    </aside>
  );
}
