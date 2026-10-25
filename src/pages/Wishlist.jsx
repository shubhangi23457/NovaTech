import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../hooks/useWishlist.js';
import { useCart } from '../hooks/useCart.js';
import { useToast } from '../hooks/useToast.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import EmptyState from '../components/EmptyState.jsx';
import Modal from '../components/Modal.jsx';
import { onImageError } from '../components/ProductCard.jsx';

export default function Wishlist() {
  useDocumentTitle('Wishlist');
  const { items, removeFromWishlist, setQuantity, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const [confirmClear, setConfirmClear] = useState(false);

  const moveToCart = (item) => {
    const r = addToCart({ ...item, inStock: item.inStock }, item.quantity);
    if (r.ok) { removeFromWishlist(item.id); showToast('Moved item from wishlist to cart!'); }
    else showToast('This item can’t be added right now (out of stock).');
  };

  return (
    <div className="section-wrap product-page-wrap">
      <div className="section-heading" style={{ marginBottom: 30 }}>
        <div><p className="eyebrow"><span></span> Saved Favorites</p><h2>Your Wishlist ({items.length})</h2></div>
        {items.length > 0 && <button type="button" className="clear-filter" onClick={() => setConfirmClear(true)}>Clear Wishlist</button>}
      </div>

      {items.length === 0 ? (
        <EmptyState title="Your Wishlist is Empty" message="Explore our curated catalog and save your favorite tech gear.">
          <Link to="/products" className="button button-lime">Explore Products <span></span></Link>
        </EmptyState>
      ) : (
        <div style={{ display: 'grid', gap: 16 }}>
          {items.map((item) => (
            <div key={item.id} className="wishlist-row">
              <Link to={`/products/${item.id}`}><img src={item.image || '/placeholder.svg'} alt={item.name} onError={onImageError} /></Link>
              <div style={{ flex: 1, minWidth: 160 }}>
                <span className="eyebrow" style={{ marginBottom: 4 }}>{item.category}</span>
                <h3 style={{ margin: '0 0 6px', fontSize: 16 }}><Link to={`/products/${item.id}`}>{item.name}</Link></h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <strong style={{ fontSize: 18 }}>{formatCurrency(item.price * item.quantity)}</strong>
                  {item.oldPrice && <del style={{ color: 'var(--soft-ink)', fontSize: 12 }}>{formatCurrency(item.oldPrice)}</del>}
                </div>
              </div>
              <div className="qty-control" style={{ height: 38 }}>
                <button type="button" onClick={() => setQuantity(item.id, -1)} style={{ width: 32, fontSize: 16 }} aria-label={`Decrease quantity of ${item.name}`}>−</button>
                <span style={{ width: 36 }}>{item.quantity}</span>
                <button type="button" onClick={() => setQuantity(item.id, 1)} style={{ width: 32, fontSize: 16 }} aria-label={`Increase quantity of ${item.name}`}>+</button>
              </div>
              <button type="button" className="button button-lime" onClick={() => moveToCart(item)}>Move to Cart</button>
              <button type="button" className="button button-outline" onClick={() => removeFromWishlist(item.id)}>Remove</button>
            </div>
          ))}
        </div>
      )}

      <Modal open={confirmClear} title="Clear your wishlist?" onClose={() => setConfirmClear(false)}>
        <p className="muted">This removes all {items.length} saved items.</p>
        <div className="state-actions">
          <button type="button" className="button button-lime" onClick={() => { clearWishlist(); setConfirmClear(false); }}>Yes, clear it</button>
          <button type="button" className="button button-outline" onClick={() => setConfirmClear(false)}>Cancel</button>
        </div>
      </Modal>
    </div>
  );
}
