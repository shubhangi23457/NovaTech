import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import CartDrawer from '../components/CartDrawer.jsx';
import MenuDrawer from '../components/MenuDrawer.jsx';
import ScrollToTop from '../components/ScrollToTop.jsx';

export default function MainLayout() {
  const [panel, setPanel] = useState(null); // null | 'cart' | 'menu'
  const location = useLocation();
  const close = useCallback(() => setPanel(null), []);
  useEffect(() => close(), [location.pathname, close]);

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <ScrollToTop />
      <Navbar onOpenCart={() => setPanel('cart')} onOpenMenu={() => setPanel('menu')} />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer open={panel === 'cart'} onClose={close} />
      <MenuDrawer open={panel === 'menu'} onClose={close} />
    </>
  );
}
