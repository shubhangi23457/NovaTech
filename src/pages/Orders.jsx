import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { useStoredState } from '../hooks/useStoredState.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { userKey } from '../utils/storage.js';
import EmptyState from '../components/EmptyState.jsx';
import OrderCard from '../components/OrderCard.jsx';

export default function Orders() {
  useDocumentTitle('Returns & Orders');
  const { user } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useStoredState(userKey(user.id, 'orders'), [], (v) => (Array.isArray(v) ? v : []));

  const requestReturn = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, returnRequested: true, returnReason: 'Defect / Replacement', status: 'Return Requested' } : o)));
    showToast(`Return request (demo) submitted for #${id}. Pickup scheduled.`);
  };

  return (
    <div className="section-wrap product-page-wrap">
      <div className="section-heading" style={{ marginBottom: 24 }}>
        <div><p className="eyebrow"><span></span> Order Management</p><h2>Returns &amp; Orders Hub</h2></div>
      </div>
      <div className="demo-notice">
        <strong>Demo Mode Notice:</strong>
        <span className="muted"> Orders are saved only in this browser. They demonstrate the 4-step tracking pipeline and the return workflow; there is no real fulfilment backend.</span>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No Orders Found" message="Your past purchases and tracking history will appear here.">
          <Link to="/products" className="button button-lime">Shop New Gear <span></span></Link>
        </EmptyState>
      ) : (
        orders.map((o) => <OrderCard key={o.id} order={o} onReturn={requestReturn} />)
      )}
    </div>
  );
}
