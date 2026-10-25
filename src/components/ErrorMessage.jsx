export default function ErrorMessage({ title = 'Something went wrong', message, onRetry, children }) {
  return (
    <div className="state-box state-error" role="alert">
      <h3>{title}</h3>
      {message && <p className="muted">{message}</p>}
      <div className="state-actions">
        {onRetry && <button type="button" className="button button-lime" onClick={onRetry}>Try again</button>}
        {children}
      </div>
    </div>
  );
}
