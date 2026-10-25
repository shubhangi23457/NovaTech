import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '../hooks/useDebounce.js';
import { SearchIcon } from './Icons.jsx';

/** Reusable search box. Calls onSearch(query) ~300ms after the user stops typing. */
export default function SearchBar({ value, onSearch, placeholder = 'Search products…', delay = 300, label = 'Search products' }) {
  const [text, setText] = useState(value);
  const debounced = useDebounce(text, delay);
  const lastPushed = useRef(value);

  // Keep the box in sync when the URL changes from elsewhere (back button, "clear all", …).
  useEffect(() => {
    if (value !== lastPushed.current) {
      lastPushed.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    const q = debounced.trim().replace(/\s+/g, ' ');
    if (q !== lastPushed.current) {
      lastPushed.current = q;
      onSearch(q);
    }
  }, [debounced, onSearch]);

  const clear = () => { setText(''); lastPushed.current = ''; onSearch(''); };

  return (
    <form className="catalog-search" role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor="catalog-search-input" className="sr-only">{label}</label>
      <SearchIcon />
      <input
        id="catalog-search-input"
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {text && <button type="button" className="catalog-search-clear" onClick={clear} aria-label="Clear search">×</button>}
    </form>
  );
}
