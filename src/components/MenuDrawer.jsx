import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useProducts } from '../hooks/useProducts.js';
import SidePanel from './SidePanel.jsx';

export default function MenuDrawer({ open, onClose }) {
  const { isAuthenticated, user, logout } = useAuth();
  const { products } = useProducts();
  const categories = [...new Set(products.map((p) => p.category))].sort();

  return (
    <SidePanel open={open} onClose={onClose} left id="menu-panel" title="Menu">
      <div className="all-menu-body">
        <p className="all-menu-heading">{isAuthenticated ? `Hello, ${user.name.split(' ')[0]}` : 'Welcome to NovaTech'}</p>
        <nav className="category-drawer-list" aria-label="Product categories">
          <h3>Shop by category</h3>
          <Link to="/products" onClick={onClose}>All products</Link>
          {categories.map((c) => (
            <Link key={c} to={`/products?category=${encodeURIComponent(c)}`} onClick={onClose}>
              {c} <small>({products.filter((p) => p.category === c).length})</small>
            </Link>
          ))}
        </nav>
        <nav className="category-drawer-list" aria-label="Account and help">
          <h3>Account &amp; help</h3>
          {isAuthenticated ? (
            <>
              <Link to="/account" onClick={onClose}>My account</Link>
              <Link to="/orders" onClick={onClose}>Returns &amp; orders</Link>
              <button type="button" className="link-button" onClick={() => { logout(); onClose(); }}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={onClose}>Login</Link>
              <Link to="/register" onClick={onClose}>Create account</Link>
            </>
          )}
          <Link to="/wishlist" onClick={onClose}>Wishlist</Link>
          <Link to="/seller" onClick={onClose}>Sell on NovaTech</Link>
          <Link to="/policies" onClick={onClose}>Store policies</Link>
        </nav>
      </div>
    </SidePanel>
  );
}
