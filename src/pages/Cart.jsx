import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import EmptyState from '../components/EmptyState.jsx';
import { onImageError } from '../components/ProductCard.jsx';

export default function Cart() {
  useDocumentTitle('Your cart');
  const { items, totalItems, subtotal, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } = useCart();

  return (
    <div className="section-wrap product-page-wrap">
      <div className="section-heading" style={{ marginBottom: 24 }}>
        <div><p className="eyebrow"><span></span> Shopping bag</p><h2>Your Cart ({totalItems})</h2></div>
        {items.length > 0 && <button type="button" className="clear-filter" onClick={clearCart}>Empty cart</button>}
      </div>

      {items.length === 0 ? (
        <EmptyState title="Your shopping bag is empty" message="Add some gear and it will show up here.">
          <Link to="/products" className="button button-lime">Continue shopping <span></span></Link>
        </EmptyState>
      ) : (
        <div className="account-layout">
          <ul className="cart-list">
            {items.map((item) => (
              <li key={item.id} className="cart-row">
                <Link to={`/products/${item.id}`}><img src={item.image || '/placeholder.svg'} alt={item.name} onError={onImageError} /></Link>
                <div style={{ flex: 1, minWidth: 150 }}>
                  <small className="muted">{item.category}</small>
                  <h3 style={{ margin: '2px 0 6px', fontSize: 15 }}><Link to={`/products/${item.id}`}>{item.name}</Link></h3>
                  <span className="muted" style={{ fontSize: 12 }}>{formatCurrency(item.price)} each</span>
                </div>
                <div className="qty-control" style={{ height: 38 }}>
                  <button type="button" onClick={() => decreaseQuantity(item.id)} aria-label={`Decrease quantity of ${item.name}`} style={{ width: 32 }}>−</button>
                  <span style={{ width: 36 }} aria-live="polite">{item.quantity}</span>
                  <button type="button" onClick={() => increaseQuantity(item.id)} aria-label={`Increase quantity of ${item.name}`} style={{ width: 32 }}>+</button>
                </div>
                <strong className="cart-line-total">{formatCurrency(item.price * item.quantity)}</strong>
                <button type="button" className="button button-outline" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>Remove</button>
              </li>
            ))}
          </ul>

          <aside className="summary-box">
            <h3>Order summary</h3>
            <div className="subtotal"><span>Items ({totalItems})</span><strong>{formatCurrency(subtotal)}</strong></div>
            <div className="subtotal"><span>Express shipping</span><strong style={{ color: '#72e400' }}>FREE</strong></div>
            <div className="subtotal total"><span>Total</span><strong>{formatCurrency(subtotal)}</strong></div>
            <Link to="/checkout" className="button button-lime full" style={{ marginTop: 20 }}>Proceed to checkout <span></span></Link>
          </aside>
        </div>
      )}
    </div>
  );
}
