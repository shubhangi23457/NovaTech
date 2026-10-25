export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '…') pages.push('…');
  }
  return (
    <nav className="search-pagination" aria-label="Pagination">
      <button type="button" className="pagination-btn" disabled={page === 1} onClick={() => onChange(page - 1)}>‹ Previous</button>
      {pages.map((p, i) => p === '…'
        ? <span key={`gap${i}`} aria-hidden="true">…</span>
        : <button key={p} type="button" className={`pagination-btn ${p === page ? 'active' : ''}`} aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>{p}</button>)}
      <button type="button" className="pagination-btn" disabled={page === totalPages} onClick={() => onChange(page + 1)}>Next ›</button>
    </nav>
  );
}
