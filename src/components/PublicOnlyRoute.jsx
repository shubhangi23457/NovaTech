import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import LoadingSpinner from './LoadingSpinner.jsx';

/** Keeps signed-in users away from /login and /register (sends them where they were heading, or home). */
export default function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingSpinner label="Checking your session…" />;
  if (isAuthenticated) {
    const from = location.state?.from;
    const target = from ? `${from.pathname}${from.search || ''}${from.hash || ''}` : '/';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
