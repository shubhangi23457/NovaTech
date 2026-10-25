import { useEffect } from 'react';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — NovaTech` : 'NovaTech — Future-ready electronics';
  }, [title]);
}
