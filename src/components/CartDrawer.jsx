import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import SidePanel from './SidePanel.jsx';
import { onImageError } from './ProductCard.jsx';

export default function CartDrawer({ open, onClose }) {
  const { items, totalItems, subtotal, increaseQuantity, decreaseQuantity, removeFromCart } = useCart();

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      id="cart-panel"
      eyebrow="Your selection"
      title={`Shopping bag (${totalItems})`}
      footer={(
        <div className="panel-foot">
          <div className="subtotal"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
          <small>Shipping and taxes calculated at checkout.</small>
          <Link className="button button-lime full" to="/cart" onClick={onClose}>View bag</Link>
          {items.length > 0 && <Link className="button button-outline full" style={{ marginTop: 8 }} to="/checkout" onClick={onClose}>Checkout</Link>}
        </div>
      )}
    >
      <div className="cart-items">
        {items.length === 0 && <p className="empty-panel">Your shopping bag is empty.</p>}
        {items.map((item) => (
          <div className="panel-item" key={item.id}>
            <img src={item.image || '/placeholder.svg'} alt={item.name} loading="lazy" onError={onImageError} />
            <div className="panel-item-info">
              <strong>{item.name}</strong>
              <small>{item.category}</small>
              <b>{formatCurrency(item.price * item.quantity)}</b>
              <div className="qty-control">
                <button type="button" onClick={() => decreaseQuantity(item.id)} aria-label={`Decrease quantity of ${item.name}`}>−</button>
                <span aria-live="polite">{item.quantity}</span>
                <button type="button" onClick={() => increaseQuantity(item.id)} aria-label={`Increase quantity of ${item.name}`}>+</button>
              </div>
            </div>
            <button type="button" className="panel-remove" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`}>×</button>
          </div>
        ))}
      </div>
    </SidePanel>
  );
}
