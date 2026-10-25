import { useEffect, useRef } from 'react';

/** Small accessible confirmation dialog (Esc closes, focus moves into it). */
export default function Modal({ open, title, children, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal active" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box compact" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={ref}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </div>
  );
}
