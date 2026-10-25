import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../hooks/useToast.js';
import { validateContact } from '../utils/validation.js';
import FormInput from './FormInput.jsx';

const Social = ({ href, label, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
  </a>
);

export default function Footer() {
  const { showToast } = useToast();
  const [values, setValues] = useState({ email: '', message: '' });
  const [errors, setErrors] = useState({});

  const onSubmit = (e) => {
    e.preventDefault();
    const errs = validateContact(values);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    showToast('Message sent! Support will reach out. (Demo — nothing is actually transmitted.)');
    setValues({ email: '', message: '' });
  };
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  return (
    <footer className="site-footer" id="contact">
      <div className="section-wrap footer-main">
        <div className="footer-brand">
          <Link className="brand" to="/"><span className="brand-mark">N</span><span>NOVA<span>TECH</span></span></Link>
          <p>Thoughtfully selected electronics engineered for modern life.</p>
          <div className="socials">
            <Social href="https://instagram.com" label="Instagram"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></Social>
            <Social href="https://facebook.com" label="Facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></Social>
            <Social href="https://youtube.com" label="YouTube"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></Social>
          </div>
        </div>

        <div className="footer-links">
          <div>
            <h3>Shop Catalog</h3>
            <Link to="/products">All Products</Link>
            <Link to="/products?sort=discount">Deals of the Day</Link>
            <Link to="/wishlist">My Wishlist</Link>
          </div>
          <div>
            <h3>Customer Service</h3>
            <Link to="/orders">Track Order</Link>
            <Link to="/orders">Returns &amp; Exchange</Link>
            <Link to="/policies?policy=shipping">Shipping Policy</Link>
            <Link to="/policies?policy=faq">FAQ &amp; Support</Link>
          </div>
          <div>
            <h3>Account &amp; Seller</h3>
            <Link to="/account">My Account</Link>
            <Link to="/seller">Become a Seller</Link>
          </div>
        </div>

        <form className="contact-form form-stack" onSubmit={onSubmit} noValidate>
          <h3>Contact Us</h3>
          <p>Have a question? Send us a message.</p>
          <FormInput id="footer-email" type="email" label="Email address" placeholder="Email address" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} />
          <FormInput id="footer-message" as="textarea" rows={2} label="Message" placeholder="How can we help?" value={values.message} onChange={set('message')} error={errors.message} />
          <button className="text-link" type="submit">Send message <span></span></button>
        </form>
      </div>

      <div className="section-wrap footer-bottom">
        <span>© 2026 NovaTech. All rights reserved. Made for the curious.</span>
        <div>
          <Link to="/policies?policy=privacy">Privacy</Link>
          <Link to="/policies?policy=terms">Terms</Link>
          <Link to="/policies?policy=security">Security</Link>
        </div>
      </div>
    </footer>
  );
}
