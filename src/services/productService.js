// Product API client (DummyJSON by default — a free, READ-ONLY demo API).
// It only supports GET for our purposes: there is no way to create/update/delete real products.
import { formatCategory } from '../utils/categories.js';

export const API_BASE = (import.meta.env?.VITE_API_BASE_URL || 'https://dummyjson.com').replace(/\/$/, '');
const USD_TO_INR = Number(import.meta.env?.VITE_USD_TO_INR) > 0 ? Number(import.meta.env.VITE_USD_TO_INR) : 83;

// The electronics-related DummyJSON category slugs that make up the NovaTech catalog.
export const CATALOG_CATEGORIES = ['smartphones', 'laptops', 'tablets', 'mobile-accessories', 'mens-watches', 'womens-watches'];

export class ApiError extends Error {
  constructor(message, { status = 0, kind = 'network' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.kind = kind; // 'network' | 'http' | 'notfound' | 'invalid'
  }
}

async function request(path) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { headers: { Accept: 'application/json' } });
  } catch {
    throw new ApiError('Could not reach the product service. Check your internet connection.', { kind: 'network' });
  }
  if (res.status === 404) throw new ApiError('Product not found.', { status: 404, kind: 'notfound' });
  if (!res.ok) throw new ApiError(`The product service returned an error (${res.status}).`, { status: res.status, kind: 'http' });
  try {
    return await res.json();
  } catch {
    throw new ApiError('The product service sent an unreadable response.', { kind: 'invalid' });
  }
}

/** Validate + convert a raw API product to the shape the UI uses. Returns null for unusable records. */
export function normalizeProduct(raw) {
  if (!raw || raw.id == null || typeof raw.title !== 'string') return null;
  const usd = Number(raw.price);
  if (!Number.isFinite(usd) || usd <= 0) return null;
  const price = Math.max(1, Math.round(usd * USD_TO_INR));
  const discountPct = Number(raw.discountPercentage);
  const discount = Number.isFinite(discountPct) && discountPct > 0 ? Math.round(discountPct) : 0;
  const oldPrice = discount > 0 && discount < 100 ? Math.round(price / (1 - discount / 100)) : null;
  const stock = Number(raw.stock);
  const images = Array.isArray(raw.images) ? raw.images.filter(Boolean) : [];
  const image = raw.thumbnail || images[0] || '';
  return {
    id: String(raw.id),
    name: raw.title,
    description: raw.description || '',
    category: formatCategory(raw.category),
    categorySlug: raw.category || '',
    brand: raw.brand || '',
    price,
    oldPrice,
    discount,
    rating: Number.isFinite(Number(raw.rating)) ? Number(raw.rating) : null,
    stock: Number.isFinite(stock) ? stock : null,
    inStock: Number.isFinite(stock) ? stock > 0 : raw.availabilityStatus !== 'Out of Stock',
    availability: raw.availabilityStatus || '',
    image,
    images: images.length ? images : image ? [image] : [],
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    sku: raw.sku || '',
    weight: raw.weight ?? null,
    dimensions: raw.dimensions || null,
    warranty: raw.warrantyInformation || '',
    shipping: raw.shippingInformation || '',
    returnPolicy: raw.returnPolicy || '',
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    createdAt: raw.meta?.createdAt || '',
  };
}

const normalizeList = (data) => {
  if (!data || !Array.isArray(data.products)) throw new ApiError('The product service sent an unexpected response.', { kind: 'invalid' });
  return data.products.map(normalizeProduct).filter(Boolean);
};

export async function getProductsByCategory(slug) {
  return normalizeList(await request(`/products/category/${encodeURIComponent(slug)}?limit=100`));
}

let catalogPromise = null;

/** Whole NovaTech catalog. Cached for the session so pages/filters never refetch. */
export function getProducts({ force = false } = {}) {
  if (force || !catalogPromise) {
    catalogPromise = Promise.all(CATALOG_CATEGORIES.map(getProductsByCategory))
      .then((groups) => {
        const seen = new Set();
        const all = groups.flat().filter((p) => (seen.has(p.id) ? false : seen.add(p.id)));
        if (!all.length) throw new ApiError('No products are available right now.', { kind: 'invalid' });
        return all;
      })
      .catch((err) => { catalogPromise = null; throw err; });
  }
  return catalogPromise;
}

const byIdCache = new Map();

export async function getProductById(id) {
  const key = String(id ?? '').trim();
  if (!/^\d+$/.test(key)) throw new ApiError('Product not found.', { status: 404, kind: 'notfound' });
  if (byIdCache.has(key)) return byIdCache.get(key);
  const product = normalizeProduct(await request(`/products/${key}`));
  if (!product) throw new ApiError('Product not found.', { status: 404, kind: 'notfound' });
  byIdCache.set(key, product);
  return product;
}

/** Distinct category labels of the catalog. */
export async function getCategories() {
  const products = await getProducts();
  return [...new Set(products.map((p) => p.category))].sort();
}

export function __resetProductCache() { catalogPromise = null; byIdCache.clear(); }
