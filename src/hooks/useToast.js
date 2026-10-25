import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext.jsx';

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside its provider.');
  return ctx;
}
