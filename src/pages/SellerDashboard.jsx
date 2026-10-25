import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { useStoredState } from '../hooks/useStoredState.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { CATALOG_CATEGORIES } from '../services/productService.js';
import { formatCategory } from '../utils/categories.js';
import { userKey } from '../utils/storage.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { validateListing, validateSeller } from '../utils/validation.js';
import FormInput from '../components/FormInput.jsx';

const CATEGORIES = [...new Set(CATALOG_CATEGORIES.map(formatCategory))];

function ApplicationForm() {
  const { showToast } = useToast();
  const [values, setValues] = useState({ business: '', contact: '', email: '', phone: '', category: '' });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));
  const submit = (e) => {
    e.preventDefault();
    const errs = validateSeller(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    showToast(`Seller application submitted for “${values.business.trim()}”! (Demo — not sent anywhere.)`);
    setValues({ business: '', contact: '', email: '', phone: '', category: '' });
  };
  return (
    <div className="account-tab-content" style={{ background: 'var(--card-bg)' }}>
      <h3>Seller Registration</h3>
      <p className="muted" style={{ marginBottom: 20 }}>Submit your business details to join our seller ecosystem.</p>
      <form className="form-stack" onSubmit={submit} noValidate>
        <FormInput id="seller-biz" label="Business name" placeholder="e.g. Apex Electronics Ltd" value={values.business} onChange={set('business')} error={errors.business} />
        <FormInput id="seller-contact" label="Seller / contact name" value={values.contact} onChange={set('contact')} error={errors.contact} />
        <FormInput id="seller-email" type="email" label="Business email" placeholder="seller@business.com" value={values.email} onChange={set('email')} error={errors.email} />
        <FormInput id="seller-phone" type="tel" label="Phone number" placeholder="9876543210" value={values.phone} onChange={set('phone')} error={errors.phone} />
        <FormInput id="seller-cat" as="select" label="Primary product category" value={values.category} onChange={set('category')} error={errors.category}>
          <option value="">Select category</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </FormInput>
        <button className="button button-lime" type="submit" style={{ marginTop: 10 }}>Submit Application <span></span></button>
      </form>
    </div>
  );
}

function Listings({ userId }) {
  const { showToast } = useToast();
  const [listings, setListings] = useStoredState(userKey(userId, 'listings'), [], (v) => (Array.isArray(v) ? v : []));
  const [values, setValues] = useState({ name: '', category: '', price: '', stock: '' });
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const add = (e) => {
    e.preventDefault();
    const errs = validateListing(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setListings((prev) => [...prev, { id: `L${Date.now()}`, name: values.name.trim(), category: values.category, price: Number(values.price), stock: Number(values.stock) }]);
    setValues({ name: '', category: '', price: '', stock: '' });
    showToast('Listing saved locally.');
  };

  return (
    <section style={{ marginTop: 40 }} aria-labelledby="listings-title">
      <h3 id="listings-title">Your product listings (demo)</h3>
      <p className="muted" style={{ marginBottom: 16 }}>The public product API is read-only, so these listings are saved only in this browser and do not appear in the store catalog.</p>
      <div className="account-layout">
        <form className="form-stack box" onSubmit={add} noValidate>
          <FormInput id="lst-name" label="Product name" value={values.name} onChange={set('name')} error={errors.name} />
          <FormInput id="lst-cat" as="select" label="Category" value={values.category} onChange={set('category')} error={errors.category}>
            <option value="">Select category</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </FormInput>
          <FormInput id="lst-price" type="number" step="0.01" min="0" inputMode="decimal" label="Price (₹)" value={values.price} onChange={set('price')} error={errors.price} />
          <FormInput id="lst-stock" type="number" step="1" min="0" inputMode="numeric" label="Stock units" value={values.stock} onChange={set('stock')} error={errors.stock} />
          <button className="button button-lime" type="submit">Add listing</button>
        </form>
        <div>
          {listings.length === 0 ? <p className="empty-panel">No listings yet.</p> : (
            <ul className="cart-list">
              {listings.map((l) => (
                <li key={l.id} className="cart-row">
                  <div style={{ flex: 1 }}><strong>{l.name}</strong><div className="muted" style={{ fontSize: 12 }}>{l.category} · {l.stock} in stock</div></div>
                  <strong>{formatCurrency(l.price)}</strong>
                  <button type="button" className="button button-outline" onClick={() => setListings((p) => p.filter((x) => x.id !== l.id))}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default function SellerDashboard() {
  useDocumentTitle('Become a seller');
  const { isAuthenticated, user } = useAuth();
  return (
    <div className="section-wrap product-page-wrap">
      <div className="section-heading" style={{ marginBottom: 24 }}>
        <div><p className="eyebrow"><span></span> Partner With Us</p><h2>Become a NovaTech Seller</h2></div>
      </div>
      <div className="account-layout">
        <div style={{ lineHeight: 1.7 }}>
          <h3>Why sell with NovaTech?</h3>
          <p className="muted">Reach tech-savvy buyers across the country looking for verified, premium electronics.</p>
          <div style={{ display: 'grid', gap: 16, marginTop: 24 }}>
            {[['Fast Onboarding', 'Register your brand and list your electronics products in under 24 hours.'],
              ['Fulfillment & Logistics', 'Leverage our 48-hr express dispatch network and pickup services.'],
              ['Low Commission Rates', 'Keep more of your profits with transparent, seller-friendly fee structures.']].map(([t, d]) => (
              <div key={t} className="box"><strong style={{ color: 'var(--lime)', fontSize: 18 }}>{t}</strong><p className="muted" style={{ margin: '6px 0 0', fontSize: 12 }}>{d}</p></div>
            ))}
          </div>
        </div>
        <ApplicationForm />
      </div>
      {isAuthenticated ? <Listings userId={user.id} /> : (
        <p className="muted" style={{ marginTop: 30 }}><Link to="/login" state={{ from: { pathname: '/seller' } }}>Sign in</Link> to manage demo product listings.</p>
      )}
    </div>
  );
}
