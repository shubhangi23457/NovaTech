import { beforeEach, describe, expect, it } from 'vitest';
import { __resetProductCache, getCategories, getProductById, getProducts, normalizeProduct } from '../services/productService.js';
import { mockCatalogFetch, rawProducts } from './fixtures.js';

beforeEach(() => __resetProductCache());

describe('normalizeProduct', () => {
  it('converts USD to INR and derives the original price', () => {
    const p = normalizeProduct(rawProducts[0]);
    expect(p.price).toBe(8300);
    expect(p.discount).toBe(10);
    expect(p.oldPrice).toBe(9222);
    expect(p.category).toBe('Smartphones');
    expect(p.inStock).toBe(true);
  });
  it('rejects unusable records', () => {
    expect(normalizeProduct(null)).toBeNull();
    expect(normalizeProduct({ id: 1, title: 'x', price: 'abc' })).toBeNull();
    expect(normalizeProduct({ id: 1, title: 'x', price: -5 })).toBeNull();
  });
});

describe('product API', () => {
  it('loads the catalog once and caches it', async () => {
    const spy = mockCatalogFetch();
    const a = await getProducts();
    const calls = spy.mock.calls.length;
    const b = await getProducts();
    expect(a).toHaveLength(4);
    expect(b).toBe(a);
    expect(spy.mock.calls.length).toBe(calls); // no duplicate requests
  });
  it('lists categories', async () => {
    mockCatalogFetch();
    expect(await getCategories()).toEqual(['Laptops', 'Mobile Accessories', 'Smartphones', 'Watches']);
  });
  it('maps network failures to a friendly error and allows retry', async () => {
    mockCatalogFetch({ fail: true });
    await expect(getProducts()).rejects.toMatchObject({ kind: 'network' });
    mockCatalogFetch();
    await expect(getProducts()).resolves.toHaveLength(4);
  });
  it('maps HTTP errors', async () => {
    mockCatalogFetch({ status: 500 });
    await expect(getProducts()).rejects.toMatchObject({ kind: 'http' });
  });
  it('gets a product by id and handles unknown / invalid ids', async () => {
    mockCatalogFetch();
    expect((await getProductById('2')).name).toBe('Beta Laptop');
    await expect(getProductById('999')).rejects.toMatchObject({ kind: 'notfound' });
    await expect(getProductById('abc')).rejects.toMatchObject({ kind: 'notfound' });
  });
});
