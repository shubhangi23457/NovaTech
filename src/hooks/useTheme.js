import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext.jsx';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside its provider.');
  return ctx;
}
