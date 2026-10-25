import { Link, Outlet } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';
import ThemeIcon from '../components/ThemeIcon.jsx';

/** Minimal chrome (logo + theme toggle) for the login / register screens. */
export default function AuthLayout() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div className="auth-layout">
      <header className="auth-header section-wrap">
        <Link className="brand" to="/" aria-label="NovaTech home"><span className="brand-mark" aria-hidden="true">N</span><span>NOVA<span>TECH</span></span></Link>
        <button type="button" className="top-nav-link" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
          <span id="theme-toggle-icon"><ThemeIcon /></span>
        </button>
      </header>
      <main id="main" className="auth-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="auth-footer">
        <Link to="/policies?policy=terms">Terms</Link> · <Link to="/policies?policy=privacy">Privacy</Link> · <Link to="/">Back to store</Link>
      </footer>
    </div>
  );
}
