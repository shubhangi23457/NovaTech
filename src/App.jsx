import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import MainLayout from './layouts/MainLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import SearchResults from './pages/SearchResults.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Policies from './pages/Policies.jsx';
import SellerDashboard from './pages/SellerDashboard.jsx';
import NotFound from './pages/NotFound.jsx';

// Protected pages are code-split: they are only downloaded when needed.
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const Account = lazy(() => import('./pages/Account.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="products" element={<Products />} />
                    <Route path="products/:id" element={<ProductDetails />} />
                    <Route path="search" element={<SearchResults />} />
                    <Route path="wishlist" element={<Wishlist />} />
                    <Route path="policies" element={<Policies />} />
                    <Route path="seller" element={<SellerDashboard />} />
                    <Route element={<ProtectedRoute />}>
                      <Route path="cart" element={<Cart />} />
                      <Route path="checkout" element={<Checkout />} />
                      <Route path="account" element={<Account />} />
                      <Route path="orders" element={<Orders />} />
                    </Route>
                    <Route path="404" element={<NotFound />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route element={<PublicOnlyRoute />}>
                    <Route element={<AuthLayout />}>
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
