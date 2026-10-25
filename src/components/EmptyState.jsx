export default function EmptyState({ title, message, children }) {
  return (
    <div className="state-box">
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
      {children && <div className="state-actions">{children}</div>}
    </div>
  );
}
