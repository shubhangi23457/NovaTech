import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="section-wrap product-page-wrap">
      <EmptyState title="404 — Page not found" message="The page you’re looking for doesn’t exist or has moved.">
        <Link to="/" className="button button-lime">Back to home</Link>
        <Link to="/products" className="button button-outline">Browse products</Link>
      </EmptyState>
    </div>
  );
}
