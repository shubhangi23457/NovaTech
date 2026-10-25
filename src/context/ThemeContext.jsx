import { createContext, useCallback, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

export const ThemeContext = createContext(null);

const initial = () => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(initial);

  const apply = useCallback((next) => {
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('novatech-theme', next); } catch { /* storage unavailable */ }
    setTheme(next);
  }, []);

  // Circular reveal from the click point when the browser supports View Transitions.
  const toggleTheme = useCallback((event) => {
    const next = theme === 'dark' ? 'light' : 'dark';
    if (!document.startViewTransition || !event || typeof event.clientX !== 'number' || event.clientX === 0) {
      apply(next);
      return;
    }
    const { clientX: x, clientY: y } = event;
    const r = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const t = document.startViewTransition(() => flushSync(() => apply(next)));
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${r}px at ${x}px ${y}px)`] },
        { duration: 500, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
      );
    }).catch(() => {});
  }, [theme, apply]);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
