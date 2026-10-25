import { describe, expect, it } from 'vitest';
import { applyCatalogQuery, DEFAULT_FILTERS, filterProducts, filtersFromParams, paramsFromFilters, searchProducts, sortProducts } from '../utils/productUtils.js';
import { normalizeProduct } from '../services/productService.js';
import { rawProducts } from './fixtures.js';

const products = rawProducts.map(normalizeProduct);

describe('search', () => {
  it('matches name case-insensitively and trims whitespace', () => {
    expect(searchProducts(products, '  ALPHA  ').map((p) => p.name)).toEqual(['Alpha Phone']);
  });
  it('matches the description too', () => {
    expect(searchProducts(products, 'noise cancelling').map((p) => p.id)).toEqual(['4']);
  });
  it('requires every word to match', () => {
    expect(searchProducts(products, 'wireless laptop')).toHaveLength(0);
  });
  it('returns everything for an empty query', () => {
    expect(searchProducts(products, '   ')).toHaveLength(4);
  });
});

describe('filters', () => {
  it('filters by category and price range together', () => {
    const r = filterProducts(products, { ...DEFAULT_FILTERS, categories: ['Smartphones', 'Laptops'], max: '20000' });
    expect(r.map((p) => p.id)).toEqual(['1']);
  });
  it('filters by brand, in-stock, rating and discount', () => {
    expect(filterProducts(products, { ...DEFAULT_FILTERS, inStock: true }).map((p) => p.id)).toEqual(['1', '3', '4']);
    expect(filterProducts(products, { ...DEFAULT_FILTERS, rating: '4' }).map((p) => p.id)).toEqual(['1', '2']);
    expect(filterProducts(products, { ...DEFAULT_FILTERS, discount: '10' }).map((p) => p.id)).toEqual(['1', '3']);
    expect(filterProducts(products, { ...DEFAULT_FILTERS, brands: ['Gamma'] }).map((p) => p.id)).toEqual(['3']);
  });
});

describe('sorting', () => {
  it('sorts by price both ways without mutating the input', () => {
    const copy = [...products];
    expect(sortProducts(products, 'price-asc').map((p) => p.id)).toEqual(['4', '3', '1', '2']);
    expect(sortProducts(products, 'price-desc').map((p) => p.id)).toEqual(['2', '1', '3', '4']);
    expect(products).toEqual(copy);
  });
  it('puts products with a missing rating last', () => {
    expect(sortProducts(products, 'rating').map((p) => p.id)).toEqual(['1', '2', '3', '4']);
  });
  it('sorts by name and newest (missing dates last)', () => {
    expect(sortProducts(products, 'name').map((p) => p.name)[0]).toBe('Alpha Phone');
    expect(sortProducts(products, 'newest').map((p) => p.id)).toEqual(['2', '1', '3', '4']);
  });
  it('works together with search and filters', () => {
    const r = applyCatalogQuery(products, { ...DEFAULT_FILTERS, q: 'a', inStock: true, sort: 'price-asc' });
    expect(r.map((p) => p.id)).toEqual(['4', '3', '1']);
  });
});

describe('URL state', () => {
  it('round-trips filters through search params', () => {
    const f = { ...DEFAULT_FILTERS, q: 'phone', categories: ['Smartphones'], min: '100', sort: 'price-asc', inStock: true, page: 2 };
    expect(filtersFromParams(paramsFromFilters(f))).toEqual(f);
  });
  it('ignores an invalid sort value', () => {
    expect(filtersFromParams(new URLSearchParams('sort=hack')).sort).toBe('featured');
  });
});
