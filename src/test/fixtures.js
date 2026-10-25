import { vi } from "vitest";
// Shape of the DummyJSON API, used to mock fetch in tests.
export const rawProducts = [
  { id: 1, title: 'Alpha Phone', description: 'A fast smartphone with a great camera', category: 'smartphones', price: 100, discountPercentage: 10, rating: 4.5, stock: 20, brand: 'Alpha', tags: ['phone'], thumbnail: 'a.png', images: ['a.png'], availabilityStatus: 'In Stock', meta: { createdAt: '2024-05-01T00:00:00Z' } },
  { id: 2, title: 'Beta Laptop', description: 'Powerful laptop for work', category: 'laptops', price: 500, discountPercentage: 0, rating: 4.0, stock: 0, brand: 'Beta', tags: ['laptop'], thumbnail: 'b.png', images: ['b.png'], availabilityStatus: 'Out of Stock', meta: { createdAt: '2024-06-01T00:00:00Z' } },
  { id: 3, title: 'Gamma Watch', description: 'Elegant watch', category: 'mens-watches', price: 50, discountPercentage: 20, rating: 3.2, stock: 5, brand: 'Gamma', tags: ['watch'], thumbnail: 'c.png', images: ['c.png'], availabilityStatus: 'Low Stock', meta: { createdAt: '2024-04-01T00:00:00Z' } },
  { id: 4, title: 'Delta Earbuds', description: 'Wireless earbuds with noise cancelling', category: 'mobile-accessories', price: 20, discountPercentage: 5, rating: null, stock: 50, brand: 'Delta', tags: ['audio'], thumbnail: 'd.png', images: ['d.png'], availabilityStatus: 'In Stock', meta: {} },
];

export function mockCatalogFetch({ fail = false, status = 200 } = {}) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    if (fail) throw new TypeError('network down');
    const u = String(url);
    const cat = u.match(/\/products\/category\/([^?]+)/);
    if (cat) return { ok: status < 400, status, json: async () => ({ products: rawProducts.filter((p) => p.category === cat[1]) }) };
    const id = u.match(/\/products\/(\d+)$/);
    if (id) {
      const p = rawProducts.find((x) => String(x.id) === id[1]);
      return p ? { ok: true, status: 200, json: async () => p } : { ok: false, status: 404, json: async () => ({ message: 'not found' }) };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  });
}
