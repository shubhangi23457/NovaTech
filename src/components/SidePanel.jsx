import { useEffect, useRef } from 'react';

/** Slide-in drawer + overlay (used for the cart and the main menu). */
export default function SidePanel({ open, onClose, title, eyebrow, left = false, id, children, footer }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    ref.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div className={`overlay ${open ? 'active' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside
        id={id}
        ref={ref}
        tabIndex={-1}
        className={`side-panel ${left ? 'panel-left' : ''} ${open ? 'active' : ''}`}
        aria-hidden={!open}
        aria-label={title}
        {...(open ? {} : { inert: '' })}
      >
        <div className="panel-head">
          <div>
            {eyebrow && <p className="eyebrow"><span></span> {eyebrow}</p>}
            <h2>{title}</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label={`Close ${title}`}>×</button>
        </div>
        {children}
        {footer}
      </aside>
    </>
  );
}
