import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll to the #hash target (if any) or to the top on every route change. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) { el.scrollIntoView(); return; }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}
