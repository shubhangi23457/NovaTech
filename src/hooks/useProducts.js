import { useCallback, useEffect, useRef, useState } from 'react';
import { getProducts, getProductById } from '../services/productService.js';

/** Loads the whole (cached) catalog: { products, loading, error, refetch }. */
export function useProducts() {
  const [state, setState] = useState({ products: [], loading: true, error: null });
  const run = useRef(0);

  const load = useCallback((force = false) => {
    const id = ++run.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    getProducts({ force })
      .then((products) => { if (id === run.current) setState({ products, loading: false, error: null }); })
      .catch((error) => { if (id === run.current) setState({ products: [], loading: false, error }); });
  }, []);

  useEffect(() => { load(); return () => { run.current += 1; }; }, [load]);
  return { ...state, refetch: () => load(true) };
}

/** Loads one product by id (route param). Handles invalid ids and network errors. */
export function useProduct(id) {
  const [state, setState] = useState({ product: null, loading: true, error: null });
  const run = useRef(0);

  const load = useCallback(() => {
    const token = ++run.current;
    setState({ product: null, loading: true, error: null });
    getProductById(id)
      .then((product) => { if (token === run.current) setState({ product, loading: false, error: null }); })
      .catch((error) => { if (token === run.current) setState({ product: null, loading: false, error }); });
  }, [id]);

  useEffect(() => { load(); return () => { run.current += 1; }; }, [load]);
  return { ...state, refetch: load };
}
