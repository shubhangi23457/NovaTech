import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { Route, Routes } from 'react-router-dom';
import SearchResults from '../pages/SearchResults.jsx';
import ProductDetails from '../pages/ProductDetails.jsx';
import { __resetProductCache } from '../services/productService.js';
import { mockCatalogFetch } from './fixtures.js';
import { renderWithProviders } from './utils.jsx';

beforeEach(() => __resetProductCache());

const Tree = () => (
  <Routes>
    <Route path="/search" element={<SearchResults />} />
    <Route path="/products/:id" element={<ProductDetails />} />
  </Routes>
);

describe('search results page', () => {
  it('shows a loading state, then products', async () => {
    mockCatalogFetch();
    renderWithProviders(<Tree />, { route: '/search' });
    expect(screen.getByLabelText('Loading products')).toBeInTheDocument();
    expect(await screen.findAllByTestId('product-card')).toHaveLength(4);
    expect(screen.getByText('4 products found')).toBeInTheDocument();
  });
  it('reads the query from the URL', async () => {
    mockCatalogFetch();
    renderWithProviders(<Tree />, { route: '/search?q=watch' });
    expect(await screen.findAllByTestId('product-card')).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Results for “watch”');
    expect(screen.getByText('1 product found')).toBeInTheDocument();
  });
  it('debounces typing and updates results', async () => {
    mockCatalogFetch();
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/search' });
    await screen.findAllByTestId('product-card');
    await user.type(screen.getByRole('searchbox', { name: /search products/i }), 'laptop');
    await waitFor(() => expect(screen.getAllByTestId('product-card')).toHaveLength(1), { timeout: 2000 });
    expect(screen.getByRole('heading', { level: 3, name: 'Beta Laptop' })).toBeInTheDocument();
  });
  it('shows an empty state when nothing matches and can clear', async () => {
    mockCatalogFetch();
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/search?q=zzzz' });
    expect(await screen.findByText('No results found')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reset search' }));
    expect(await screen.findAllByTestId('product-card')).toHaveLength(4);
  });
  it('applies filters and shows removable chips', async () => {
    mockCatalogFetch();
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/search' });
    await screen.findAllByTestId('product-card');
    await user.click(screen.getByLabelText(/^Smartphones/));
    expect(screen.getAllByTestId('product-card')).toHaveLength(1);
    await user.click(screen.getByRole('button', { name: /Smartphones.*remove filter/ }));
    expect(screen.getAllByTestId('product-card')).toHaveLength(4);
  });
  it('sorts by price', async () => {
    mockCatalogFetch();
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/search' });
    await screen.findAllByTestId('product-card');
    await user.selectOptions(screen.getByLabelText('Sort by:'), 'price-asc');
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent).filter((t) => /Alpha|Beta|Gamma|Delta/.test(t));
    expect(names).toEqual(['Delta Earbuds', 'Gamma Watch', 'Alpha Phone', 'Beta Laptop']);
  });
  it('shows an error with a working retry', async () => {
    mockCatalogFetch({ fail: true });
    const user = userEvent.setup();
    renderWithProviders(<Tree />, { route: '/search' });
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the product service/i);
    mockCatalogFetch();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findAllByTestId('product-card')).toHaveLength(4);
  });
});

describe('product details page', () => {
  it('loads the product from the route param', async () => {
    mockCatalogFetch();
    renderWithProviders(<Tree />, { route: '/products/1' });
    expect(await screen.findByRole('heading', { level: 1, name: 'Alpha Phone' })).toBeInTheDocument();
  });
  it('handles an unknown product id', async () => {
    mockCatalogFetch();
    renderWithProviders(<Tree />, { route: '/products/999' });
    expect(await screen.findByText('Product not found')).toBeInTheDocument();
  });
});
