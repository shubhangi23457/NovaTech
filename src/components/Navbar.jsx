import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { useTheme } from '../hooks/useTheme.js';
import { useToast } from '../hooks/useToast.js';
import { getAddresses } from '../services/accountService.js';
import { CATALOG_CATEGORIES } from '../services/productService.js';
import { formatCategory } from '../utils/categories.js';
import { CartIcon, HeartIcon, PinIcon, SearchIcon, UserIcon } from './Icons.jsx';
import ThemeIcon from './ThemeIcon.jsx';

const NAV_CATEGORIES = [...new Set(CATALOG_CATEGORIES.map(formatCategory))];

export default function Navbar({ onOpenCart, onOpenMenu }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const { count: wishCount } = useWishlist();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const urlQuery = useMemo(() => (location.pathname === '/search' ? new URLSearchParams(location.search).get('q') || '' : ''), [location]);
  const [query, setQuery] = useState(urlQuery);
  const [category, setCategory] = useState('All');
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setQuery(urlQuery), [urlQuery]);
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const city = useMemo(() => (user ? getAddresses(user.id).find((a) => a.isDefault)?.city : '') || 'India', [user]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const params = new URLSearchParams({ q });
    if (category !== 'All') params.set('category', category);
    navigate(`/search?${params.toString()}`);
  };

  const handleLogout = async () => {
    await logout();
    showToast('You have been signed out.');
    navigate('/');
  };

  const secClass = ({ isActive }) => `sec-nav-link ${isActive ? 'active' : ''}`;

  return (
    <header className="site-header" id="top">
      <nav className="top-nav" aria-label="Primary navigation">
        <div className="top-nav-inner">
          <Link className="brand" to="/" aria-label="NovaTech home">
            <span className="brand-mark" aria-hidden="true">N</span><span>NOVA<span>TECH</span></span>
          </Link>

          <div className="deliver-to desktop-only">
            <PinIcon />
            <div><small>Deliver to</small><strong>{city}</strong></div>
          </div>

          <form className="nav-search" role="search" onSubmit={submitSearch}>
            <select className="nav-search-cat" aria-label="Search category" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="All">All</option>
              {NAV_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="search" className="nav-search-input" placeholder="Search NovaTech" autoComplete="off" aria-label="Search NovaTech" value={query} onChange={(e) => setQuery(e.target.value)} />
            <button type="submit" className="nav-search-btn" aria-label="Search"><SearchIcon /></button>
          </form>

          <div className="top-nav-actions">
            <button type="button" className="top-nav-link" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Dark mode on. Switch to light mode' : 'Light mode on. Switch to dark mode'} title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
              <span id="theme-toggle-icon"><ThemeIcon /></span>
              <div><small>Theme</small><strong>Mode</strong></div>
            </button>

            {isAuthenticated ? (
              <>
                <Link className="top-nav-link" to="/account">
                  <UserIcon />
                  <div><small>Hello, {user.name.split(' ')[0]}</small><strong>Account</strong></div>
                </Link>
                <button type="button" className="top-nav-link" onClick={handleLogout}>
                  <div><small>Signed in</small><strong>Logout</strong></div>
                </button>
              </>
            ) : (
              <Link className="top-nav-link" to="/login">
                <UserIcon />
                <div><small>Hello, sign in</small><strong>Login</strong></div>
              </Link>
            )}

            <Link className="top-nav-link" to="/wishlist" aria-label={`Wishlist, ${wishCount} items`}>
              <HeartIcon />
              <strong>Wishlist</strong>
              <b className="count-badge wishlist-count">{wishCount}</b>
            </Link>

            <button type="button" className="top-nav-link cart-link" onClick={onOpenCart} aria-label={`Shopping cart, ${totalItems} items`}>
              <CartIcon />
              <strong>Cart</strong>
              <b className="count-badge cart-count">{totalItems}</b>
            </button>
          </div>

          <button type="button" className="mobile-toggle" aria-label="Open menu" aria-expanded={menuOpen} aria-controls="secondary-nav-links" onClick={() => setMenuOpen((o) => !o)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      <nav className="secondary-nav" aria-label="Secondary navigation">
        <div className={`secondary-nav-inner ${menuOpen ? 'open' : ''}`} id="secondary-nav-links">
          <button type="button" className="sec-nav-link" onClick={onOpenMenu}>☰ All</button>
          <NavLink className={secClass} to="/products" end>Shop</NavLink>
          <NavLink className={secClass} to="/search">Search</NavLink>
          <Link className="sec-nav-link" to="/products?sort=discount">Deals</Link>
          <NavLink className={secClass} to="/wishlist">Wishlist</NavLink>
          <NavLink className={secClass} to="/orders">Returns &amp; Orders</NavLink>
          <NavLink className={secClass} to="/seller">Sell on NovaTech</NavLink>
        </div>
      </nav>
    </header>
  );
}
