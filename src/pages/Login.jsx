import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { validateLogin } from '../utils/validation.js';
import FormInput from '../components/FormInput.jsx';

export default function Login() {
  useDocumentTitle('Login');
  const { login } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // no duplicate submissions
    const errs = validateLogin(values);
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      const u = await login(values);
      showToast(`Welcome back, ${u.name.split(' ')[0]}!`);
      // PublicOnlyRoute now redirects to the page the visitor originally wanted.
    } catch (err) {
      setFormError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <p className="eyebrow"><span></span> Welcome back</p>
      <h1>Sign in to NovaTech</h1>
      {location.state?.from && <p className="auth-note">Please sign in to continue to <strong>{location.state.from.pathname}</strong>.</p>}
      <form className="form-stack" onSubmit={onSubmit} noValidate>
        {formError && <div className="form-alert" role="alert">{formError}</div>}
        <FormInput id="login-email" type="email" label="Email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} disabled={submitting} />
        <FormInput id="login-password" type="password" label="Password" autoComplete="current-password" value={values.password} onChange={set('password')} error={errors.password} disabled={submitting} />
        <button className="button button-lime full" type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="auth-switch">New to NovaTech? <Link to="/register" state={location.state}>Create an account</Link></p>
      <p className="auth-disclaimer">Demo authentication: accounts are stored only in this browser. Do not use a real password.</p>
    </div>
  );
}
