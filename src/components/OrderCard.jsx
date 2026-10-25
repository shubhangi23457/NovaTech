import { formatCurrency } from '../utils/formatCurrency.js';
import { onImageError } from './ProductCard.jsx';

const STEPS = ['Order Placed', 'Packed', 'Shipped', 'Delivered'];

export default function OrderCard({ order, onReturn }) {
  return (
    <div className="order-card order-box">
      <div className="order-head">
        <div>
          <strong style={{ fontSize: 16 }}>Order #{order.id}</strong>
          <div className="muted" style={{ fontSize: 11 }}>Placed on {order.date} · Paid via {order.paymentMethod}</div>
          <div className="muted" style={{ fontSize: 11 }}>Deliver to: {order.address}</div>
        </div>
        <span className="product-label" style={{ fontSize: 10, position: 'static' }}>{order.status}</span>
      </div>

      <ol className="order-stepper" aria-label="Order progress">
        {STEPS.map((label, i) => (
          <li key={label} className={`step-node ${order.trackingStep >= i + 1 ? 'completed' : ''}`}>
            <div className="circle">{order.trackingStep >= i + 1 ? '✓' : i + 1}</div><span>{label}</span>
          </li>
        ))}
      </ol>

      <div style={{ marginBlock: '20px 14px' }}>
        {order.items.map((item) => (
          <div key={item.id} className="order-line">
            <img src={item.image || '/placeholder.svg'} alt="" onError={onImageError} />
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 13 }}>{item.name}</strong>
              <div className="muted" style={{ fontSize: 11 }}>Quantity: {item.quantity} × {formatCurrency(item.price)}</div>
            </div>
            <strong>{formatCurrency(item.price * item.quantity)}</strong>
          </div>
        ))}
      </div>

      <div className="order-foot">
        <div>Total Paid: <strong style={{ fontSize: 18 }}>{formatCurrency(order.total)}</strong></div>
        {order.returnRequested ? (
          <div className="return-note">✓ Return requested — pickup pending</div>
        ) : onReturn && (
          <button type="button" className="button button-outline" onClick={() => onReturn(order.id)}>Return / Replace Item</button>
        )}
      </div>
    </div>
  );
}
