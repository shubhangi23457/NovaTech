import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useCart } from '../hooks/useCart.js';
import { useToast } from '../hooks/useToast.js';
import { useStoredState } from '../hooks/useStoredState.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { addOrder, createOrderId } from '../services/accountService.js';
import { userKey } from '../utils/storage.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { validateAddress } from '../utils/validation.js';
import EmptyState from '../components/EmptyState.jsx';
import AddressForm, { EMPTY_ADDRESS, formatAddress } from '../components/AddressForm.jsx';
import { onImageError } from '../components/ProductCard.jsx';

const PAYMENTS = [
  ['UPI', 'UPI Payment (Instant)', 'Google Pay, PhonePe, Paytm'],
  ['Credit/Debit Card', 'Credit / Debit Card', 'Visa, Mastercard, RuPay'],
  ['Net Banking', 'Net Banking', 'All major Indian banks'],
  ['Cash on Delivery', 'Cash on Delivery (COD)', 'Pay upon express delivery'],
];

export default function Checkout() {
  useDocumentTitle('Checkout');
  const { user } = useAuth();
  const { items, subtotal, totalItems, clearCart } = useCart();
  const { showToast } = useToast();
  const [addresses, setAddresses] = useStoredState(userKey(user.id, 'addresses'), [], (v) => (Array.isArray(v) ? v : []));
  const [selected, setSelected] = useState(() => addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || 'new');
  const [draft, setDraft] = useState({ ...EMPTY_ADDRESS, name: user.name, phone: user.phone || '' });
  const [errors, setErrors] = useState({});
  const [saveDraft, setSaveDraft] = useState(true);
  const [payment, setPayment] = useState('UPI');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  if (confirmation) {
    return (
      <div className="section-wrap product-page-wrap confirmation">
        <div className="confirm-tick" aria-hidden="true">✓</div>
        <h2>Order Confirmed!</h2>
        <p className="muted">Thank you for shopping with NovaTech. This was a <strong>demo order</strong>: no payment was taken.</p>
        <div className="confirm-box">
          <div>Order Number: <strong>{confirmation.id}</strong></div>
          <div style={{ marginTop: 4 }}>Total: <strong>{formatCurrency(confirmation.total)}</strong></div>
          <div style={{ marginTop: 4 }}>Points Earned: <strong style={{ color: 'var(--lime)' }}>{confirmation.points}</strong></div>
        </div>
        <div className="state-actions" style={{ marginTop: 30 }}>
          <Link to="/orders" className="button button-lime">Track Order <span></span></Link>
          <Link to="/" className="button button-outline">Return to Homepage</Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section-wrap product-page-wrap">
        <EmptyState title="Your shopping bag is empty" message="Add items to your cart before proceeding to checkout.">
          <Link to="/products" className="button button-lime">Continue Shopping <span></span></Link>
        </EmptyState>
      </div>
    );
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    if (placing) return;
    setError('');

    let address = addresses.find((a) => a.id === selected);
    if (selected === 'new' || !address) {
      const errs = validateAddress(draft);
      setErrors(errs);
      if (Object.keys(errs).length) return;
      address = { ...draft, id: `addr-${Date.now()}`, isDefault: addresses.length === 0 };
    } else {
      const errs = validateAddress(address);
      if (Object.keys(errs).length) { setError('The selected address is incomplete. Edit it in your account or add a new one.'); return; }
    }

    setPlacing(true);
    try {
      await new Promise((r) => setTimeout(r, import.meta.env.MODE === 'test' ? 0 : 800)); // simulated processing
      const order = {
        id: createOrderId(),
        date: new Date().toISOString().split('T')[0],
        items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, image: i.image, discount: i.discount })),
        subtotal, discount: 0, delivery: 0, total: subtotal,
        paymentMethod: payment, status: 'Order Placed',
        address: formatAddress(address), trackingStep: 1, returnRequested: false, returnReason: '',
      };
      const { points } = addOrder(user.id, order);
      if (selected === 'new' && saveDraft) setAddresses((prev) => [...prev, address]);
      clearCart();
      setConfirmation({ id: order.id, total: order.total, points });
      showToast('Demo order placed!');
    } catch {
      setError('We could not place your order. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <div className="section-wrap product-page-wrap">
      <div className="section-heading" style={{ marginBottom: 24 }}>
        <div><p className="eyebrow"><span></span> Secure Checkout (demo)</p><h2>Complete Your Order</h2></div>
      </div>

      <form className="account-layout" onSubmit={placeOrder} noValidate>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <fieldset className="box">
            <legend><h3>1. Delivery Address</h3></legend>
            {addresses.map((a) => (
              <label key={a.id} className="pay-option">
                <input type="radio" name="address" checked={selected === a.id} onChange={() => setSelected(a.id)} />
                <div><strong>{a.name}</strong> {a.isDefault && <mark className="default-tag">Default</mark>}<div className="muted" style={{ fontSize: 12 }}>{formatAddress(a)}</div></div>
              </label>
            ))}
            <label className="pay-option">
              <input type="radio" name="address" checked={selected === 'new'} onChange={() => setSelected('new')} />
              <div><strong>Add a new address</strong></div>
            </label>
            {selected === 'new' && (
              <div style={{ marginTop: 14 }}>
                <AddressForm idPrefix="chk" values={draft} errors={errors} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} disabled={placing} />
                <label className="inline-check"><input type="checkbox" checked={saveDraft} onChange={(e) => setSaveDraft(e.target.checked)} /> Save this address to my account</label>
              </div>
            )}
          </fieldset>

          <fieldset className="box">
            <legend><h3>2. Select Payment Method</h3></legend>
            <p className="muted" style={{ fontSize: 11, marginBottom: 16 }}>This is a frontend demo checkout. No actual money will be charged and no card details are collected.</p>
            {PAYMENTS.map(([value, title, sub]) => (
              <label key={value} className="pay-option">
                <input type="radio" name="payment" value={value} checked={payment === value} onChange={() => setPayment(value)} />
                <div><strong>{title}</strong><div className="muted" style={{ fontSize: 10 }}>{sub}</div></div>
              </label>
            ))}
          </fieldset>
        </div>

        <aside className="summary-box">
          <h3>3. Order Summary</h3>
          <div style={{ marginBlock: '16px 20px' }}>
            {items.map((i) => (
              <div key={i.id} className="order-line">
                <img src={i.image || '/placeholder.svg'} alt="" onError={onImageError} />
                <div style={{ flex: 1 }}><strong style={{ fontSize: 12 }}>{i.name}</strong><div className="muted" style={{ fontSize: 11 }}>Qty {i.quantity} × {formatCurrency(i.price)}</div></div>
                <strong>{formatCurrency(i.price * i.quantity)}</strong>
              </div>
            ))}
          </div>
          <div className="subtotal"><span>Subtotal ({totalItems} items)</span><strong>{formatCurrency(subtotal)}</strong></div>
          <div className="subtotal"><span>Express Shipping</span><strong style={{ color: '#72e400' }}>FREE</strong></div>
          <div className="subtotal total"><span>Total Payable</span><strong>{formatCurrency(subtotal)}</strong></div>
          {error && <div className="form-alert" role="alert" style={{ marginTop: 14 }}>{error}</div>}
          <button className="button button-lime full" type="submit" disabled={placing} aria-busy={placing} style={{ marginTop: 20 }}>
            {placing ? 'Placing order…' : 'Confirm & Place Order'} <span></span>
          </button>
        </aside>
      </form>
    </div>
  );
}
