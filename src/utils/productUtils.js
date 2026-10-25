// Pure search / filter / sort logic. Never mutates its inputs.

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Recommended' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating: High to Low' },
  { value: 'name', label: 'Name: A to Z' },
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'newest', label: 'Newest First' },
];

export const DEFAULT_FILTERS = {
  q: '', categories: [], brands: [], min: '', max: '', rating: '', inStock: false, discount: '', sort: 'featured', page: 1,
};

export const normalizeQuery = (q) => String(q ?? '').trim().replace(/\s+/g, ' ').toLowerCase();

export function searchProducts(products, query) {
  const q = normalizeQuery(query);
  if (!q) return products;
  const terms = q.split(' ');
  return products.filter((p) => {
    const haystack = [p.name, p.description, p.brand, p.category, ...(p.tags || [])].join(' ').toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v));

export function filterProducts(products, f) {
  const min = num(f.min);
  const max = num(f.max);
  const rating = num(f.rating);
  const discount = num(f.discount);
  return products.filter((p) => {
    if (f.categories?.length && !f.categories.includes(p.category)) return false;
    if (f.brands?.length && !f.brands.includes(p.brand)) return false;
    if (min !== null && Number.isFinite(min) && p.price < min) return false;
    if (max !== null && Number.isFinite(max) && p.price > max) return false;
    if (rating !== null && (p.rating || 0) < rating) return false;
    if (f.inStock && !p.inStock) return false;
    if (discount !== null && (p.discount || 0) < discount) return false;
    return true;
  });
}

const byNumber = (get, dir) => (a, b) => {
  const x = get(a), y = get(b);
  const ax = Number.isFinite(x), ay = Number.isFinite(y);
  if (!ax && !ay) return 0;
  if (!ax) return 1;       // missing values always sink to the bottom
  if (!ay) return -1;
  return dir * (x - y);
};

export function sortProducts(products, sort) {
  const list = [...products];
  switch (sort) {
    case 'price-asc': return list.sort(byNumber((p) => p.price, 1));
    case 'price-desc': return list.sort(byNumber((p) => p.price, -1));
    case 'rating': return list.sort(byNumber((p) => p.rating, -1));
    case 'discount': return list.sort(byNumber((p) => p.discount, -1));
    case 'newest': return list.sort(byNumber((p) => (p.createdAt ? Date.parse(p.createdAt) : NaN), -1));
    case 'name': return list.sort((a, b) => String(a.name).localeCompare(String(b.name)));
    default: return list;
  }
}

export const applyCatalogQuery = (products, f) => sortProducts(filterProducts(searchProducts(products, f.q), f), f.sort);

export const uniqueSorted = (values) => [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b));

export const hasNewestSort = (products) => products.some((p) => p.createdAt && !Number.isNaN(Date.parse(p.createdAt)));

// ---- URL <-> filters ----
const list = (s) => (s ? s.split(',').map((x) => x.trim()).filter(Boolean) : []);

export function filtersFromParams(params) {
  const page = parseInt(params.get('page') || '1', 10);
  const sort = params.get('sort');
  return {
    q: params.get('q') || '',
    categories: list(params.get('category')),
    brands: list(params.get('brand')),
    min: params.get('min') || '',
    max: params.get('max') || '',
    rating: params.get('rating') || '',
    inStock: params.get('stock') === '1',
    discount: params.get('discount') || '',
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? sort : 'featured',
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

export function paramsFromFilters(f) {
  const p = new URLSearchParams();
  if (f.q) p.set('q', f.q);
  if (f.categories?.length) p.set('category', f.categories.join(','));
  if (f.brands?.length) p.set('brand', f.brands.join(','));
  if (f.min !== '' && f.min != null) p.set('min', f.min);
  if (f.max !== '' && f.max != null) p.set('max', f.max);
  if (f.rating) p.set('rating', f.rating);
  if (f.inStock) p.set('stock', '1');
  if (f.discount) p.set('discount', f.discount);
  if (f.sort && f.sort !== 'featured') p.set('sort', f.sort);
  if (f.page > 1) p.set('page', String(f.page));
  return p;
}

export function activeFilterChips(f) {
  const chips = [];
  f.categories.forEach((c) => chips.push({ key: `category:${c}`, label: c }));
  f.brands.forEach((b) => chips.push({ key: `brand:${b}`, label: b }));
  if (f.min !== '') chips.push({ key: 'min', label: `Min ₹${f.min}` });
  if (f.max !== '') chips.push({ key: 'max', label: `Max ₹${f.max}` });
  if (f.rating) chips.push({ key: 'rating', label: `${f.rating}★ & up` });
  if (f.discount) chips.push({ key: 'discount', label: `${f.discount}%+ off` });
  if (f.inStock) chips.push({ key: 'inStock', label: 'In stock' });
  return chips;
}

export function removeChip(f, key) {
  const next = { ...f, page: 1 };
  if (key.startsWith('category:')) next.categories = f.categories.filter((c) => c !== key.slice(9));
  else if (key.startsWith('brand:')) next.brands = f.brands.filter((b) => b !== key.slice(6));
  else if (key === 'inStock') next.inStock = false;
  else next[key] = '';
  return next;
}
