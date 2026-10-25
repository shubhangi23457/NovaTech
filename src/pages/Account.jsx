import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { useTheme } from '../hooks/useTheme.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { useStoredState } from '../hooks/useStoredState.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { getRewards } from '../services/accountService.js';
import { ACHIEVEMENTS } from '../data/achievements.js';
import { userKey } from '../utils/storage.js';
import { validateAddress, validateProfile } from '../utils/validation.js';
import FormInput from '../components/FormInput.jsx';
import EmptyState from '../components/EmptyState.jsx';
import OrderCard from '../components/OrderCard.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import Modal from '../components/Modal.jsx';
import AddressForm, { EMPTY_ADDRESS, formatAddress } from '../components/AddressForm.jsx';

const TABS = [
  ['profile', 'Profile'], ['orders', 'Orders & Tracking'], ['returns', 'Returns & Refund'],
  ['wishlist', 'Saved Wishlist'], ['rewards', 'Rewards & Badges'], ['addresses', 'Saved Addresses'], ['preferences', 'Preferences'],
];
const asArray = (v) => (Array.isArray(v) ? v : []);

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  const [values, setValues] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const errs = validateProfile(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    try {
      await updateProfile(values);
      showToast('Profile updated successfully.');
    } catch (err) {
      setErrors(err.field ? { [err.field]: err.message } : { form: err.message });
    } finally { setSaving(false); }
  };

  return (
    <>
      <h3>Personal Profile</h3>
      <p className="muted" style={{ marginBottom: 20 }}>Manage your account details and contact information.</p>
      <form className="form-stack" style={{ maxWidth: 540 }} onSubmit={submit} noValidate>
        {errors.form && <div className="form-alert" role="alert">{errors.form}</div>}
        <FormInput id="prof-name" label="Full name" value={values.name} onChange={set('name')} error={errors.name} disabled={saving} />
        <FormInput id="prof-email" type="email" label="Email address" value={values.email} onChange={set('email')} error={errors.email} disabled={saving} />
        <FormInput id="prof-phone" type="tel" label="Phone number (optional)" value={values.phone} onChange={set('phone')} error={errors.phone} disabled={saving} />
        <button className="button button-lime" type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>{saving ? 'Saving…' : 'Save Profile Changes'}</button>
      </form>
    </>
  );
}

function OrdersTab({ orders, onReturn, returnsMode }) {
  if (!orders.length) return <p className="empty-panel">{returnsMode ? 'No eligible orders for return.' : 'No orders placed yet.'}</p>;
  return (
    <>
      <h3>{returnsMode ? 'Returns & Exchanges' : 'Order History & Tracking'}</h3>
      <p className="muted" style={{ marginBottom: 20 }}>{returnsMode ? 'Eligible for 14-day easy return.' : 'View active order status and past purchases.'}</p>
      {orders.map((o) => <OrderCard key={o.id} order={o} onReturn={returnsMode ? onReturn : undefined} />)}
    </>
  );
}

function RewardsTab({ userId }) {
  const rewards = getRewards(userId);
  const unlocked = new Set(rewards.unlockedAchievements);
  return (
    <>
      <h3>NovaTech Rewards &amp; Badges</h3>
      <div className="rewards-banner">
        <div><p className="eyebrow" style={{ color: '#111', marginBottom: 4 }}><span></span> Current Balance</p><h2 style={{ fontSize: 36, margin: 0 }}>{rewards.points} Points</h2></div>
        <span style={{ fontWeight: 800, fontSize: 14 }}>Earn 10% back on every order</span>
      </div>
      <h4>Achievement Badges</h4>
      <div className="achievement-badge-grid">
        {ACHIEVEMENTS.map((a) => {
          const on = unlocked.has(a.id);
          return (
            <div key={a.id} className={`achievement-badge ${on ? 'unlocked' : 'locked'}`}>
              <div className="icon">{a.icon}</div><strong>{a.name}</strong><p>{a.desc}</p>
              <span style={{ font: '700 10px var(--mono)', color: 'var(--lime)' }}>{on ? 'Unlocked ✓' : `Locked (+${a.points} pts)`}</span>
            </div>
          );
        })}
      </div>
    </>
  );
}

function AddressesTab({ userId }) {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useStoredState(userKey(userId, 'addresses'), [], asArray);
  const [draft, setDraft] = useState(EMPTY_ADDRESS);
  const [errors, setErrors] = useState({});
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const add = (e) => {
    e.preventDefault();
    const errs = validateAddress(draft);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setAddresses((prev) => [...prev, { ...draft, id: `addr-${Date.now()}`, isDefault: prev.length === 0 }]);
    setDraft(EMPTY_ADDRESS); setAdding(false);
    showToast('Address saved.');
  };
  const makeDefault = (id) => setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  const remove = () => {
    setAddresses((prev) => {
      const rest = prev.filter((a) => a.id !== toDelete.id);
      return rest.length && !rest.some((a) => a.isDefault) ? rest.map((a, i) => ({ ...a, isDefault: i === 0 })) : rest;
    });
    setToDelete(null); showToast('Address deleted.');
  };

  return (
    <>
      <h3>Saved Delivery Addresses</h3>
      <p className="muted" style={{ marginBottom: 20 }}>Manage delivery addresses for fast checkout.</p>
      <div style={{ display: 'grid', gap: 14 }}>
        {addresses.length === 0 && <p className="empty-panel">No saved addresses yet.</p>}
        {addresses.map((a) => (
          <div key={a.id} className="address-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <strong>{a.name} {a.isDefault && <mark className="default-tag">Default</mark>}</strong>
              <span>
                {!a.isDefault && <button type="button" className="link-button" onClick={() => makeDefault(a.id)}>Make default</button>}{' '}
                <button type="button" className="link-button" onClick={() => setToDelete(a)}>Delete</button>
              </span>
            </div>
            <p style={{ margin: '8px 0 0', color: 'var(--soft-ink)', fontSize: 12 }}>{formatAddress(a)}</p>
          </div>
        ))}
      </div>
      {adding ? (
        <form onSubmit={add} noValidate style={{ marginTop: 20, maxWidth: 540 }}>
          <AddressForm idPrefix="addr" values={draft} errors={errors} onChange={(p) => setDraft((d) => ({ ...d, ...p }))} />
          <div className="state-actions" style={{ justifyContent: 'flex-start', marginTop: 12 }}>
            <button className="button button-lime" type="submit">Save address</button>
            <button className="button button-outline" type="button" onClick={() => { setAdding(false); setErrors({}); }}>Cancel</button>
          </div>
        </form>
      ) : (
        <button type="button" className="button button-outline" style={{ marginTop: 20 }} onClick={() => setAdding(true)}>+ Add new address</button>
      )}
      <Modal open={Boolean(toDelete)} title="Delete this address?" onClose={() => setToDelete(null)}>
        <p className="muted">{toDelete && formatAddress(toDelete)}</p>
        <div className="state-actions">
          <button type="button" className="button button-lime" onClick={remove}>Delete</button>
          <button type="button" className="button button-outline" onClick={() => setToDelete(null)}>Cancel</button>
        </div>
      </Modal>
    </>
  );
}

function PreferencesTab({ userId }) {
  const { theme, toggleTheme } = useTheme();
  const [prefs, setPrefs] = useStoredState(userKey(userId, 'prefs'), { notifications: true }, (v) => ({ notifications: v?.notifications !== false }));
  return (
    <>
      <h3>Account Preferences</h3>
      <p className="muted" style={{ marginBottom: 20 }}>Manage website theme and notification settings.</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontWeight: 700, flexWrap: 'wrap' }}>
          <span>Light and dark preference ({theme}):</span>
          <button type="button" className="button button-outline" onClick={toggleTheme}>Switch to {theme === 'dark' ? 'light' : 'dark'} mode</button>
        </div>
        <label className="inline-check"><input type="checkbox" checked={prefs.notifications} onChange={(e) => setPrefs({ notifications: e.target.checked })} /> Receive drop notifications &amp; deal emails</label>
      </div>
    </>
  );
}

export default function Account() {
  useDocumentTitle('My account');
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const { items: wishItems } = useWishlist();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [orders, setOrders] = useStoredState(userKey(user.id, 'orders'), [], asArray);

  const requestReturn = (id) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, returnRequested: true, returnReason: 'Defect or size change', status: 'Return Requested' } : o)));
    showToast(`Return request (demo) submitted for Order #${id}. Pickup scheduled.`);
  };
  const handleLogout = async () => { await logout(); showToast('Logged out.'); navigate('/'); };

  return (
    <div className="section-wrap account-page-wrap">
      <div className="section-heading"><div><p className="eyebrow"><span></span> Customer Portal</p><h2>My Account</h2></div></div>
      <div className="account-layout">
        <div className="account-nav" role="tablist" aria-label="Account sections">
          {TABS.map(([key, label]) => (
            <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
          ))}
          <button type="button" style={{ marginTop: 15, color: '#e63946' }} onClick={handleLogout}>Logout</button>
        </div>
        <div className="account-tab-content" role="tabpanel">
          {tab === 'profile' && <ProfileTab />}
          {tab === 'orders' && <OrdersTab orders={orders} />}
          {tab === 'returns' && <OrdersTab orders={orders} onReturn={requestReturn} returnsMode />}
          {tab === 'wishlist' && (
            <>
              <h3>Saved Wishlist</h3>
              <p className="muted" style={{ marginBottom: 20 }}>Saved items ready for purchase.</p>
              {wishItems.length === 0
                ? <EmptyState title="Your wishlist is currently empty"><Link to="/products" className="button button-lime">Explore products</Link></EmptyState>
                : <ProductGrid products={wishItems} />}
            </>
          )}
          {tab === 'rewards' && <RewardsTab userId={user.id} />}
          {tab === 'addresses' && <AddressesTab userId={user.id} />}
          {tab === 'preferences' && <PreferencesTab userId={user.id} />}
        </div>
      </div>
    </div>
  );
}
