import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { validateRegister } from '../utils/validation.js';
import FormInput, { CheckboxField } from '../components/FormInput.jsx';

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [values, setValues] = useState({ name: '', email: '', password: '', confirmPassword: '', acceptTerms: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    const errs = validateRegister(values);
    setErrors(errs);
    setFormError('');
    if (Object.keys(errs).length) return;
    setSubmitting(true);
    try {
      const u = await register({ name: values.name, email: values.email, password: values.password });
      showToast(`Account created. Welcome, ${u.name.split(' ')[0]}!`);
    } catch (err) {
      if (err.field) setErrors({ [err.field]: err.message });
      else setFormError(err.message || 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <p className="eyebrow"><span></span> Join NovaTech</p>
      <h1>Create your account</h1>
      <form className="form-stack" onSubmit={onSubmit} noValidate>
        {formError && <div className="form-alert" role="alert">{formError}</div>}
        <FormInput id="reg-name" label="Full name" autoComplete="name" value={values.name} onChange={set('name')} error={errors.name} disabled={submitting} />
        <FormInput id="reg-email" type="email" label="Email" autoComplete="email" value={values.email} onChange={set('email')} error={errors.email} disabled={submitting} />
        <FormInput id="reg-password" type="password" label="Password" autoComplete="new-password" hint="At least 8 characters, with a letter and a number." value={values.password} onChange={set('password')} error={errors.password} disabled={submitting} />
        <FormInput id="reg-confirm" type="password" label="Confirm password" autoComplete="new-password" value={values.confirmPassword} onChange={set('confirmPassword')} error={errors.confirmPassword} disabled={submitting} />
        <CheckboxField id="reg-terms" checked={values.acceptTerms} onChange={set('acceptTerms')} disabled={submitting} error={errors.acceptTerms}
          label={<>I agree to the <Link to="/policies?policy=terms" target="_blank">Terms</Link> and <Link to="/policies?policy=privacy" target="_blank">Privacy Policy</Link>.</>} />
        <button className="button button-lime full" type="submit" disabled={submitting} aria-busy={submitting}>{submitting ? 'Creating account…' : 'Create account'}</button>
      </form>
      <p className="auth-switch">Already registered? <Link to="/login" state={location.state}>Sign in</Link></p>
      <p className="auth-disclaimer">Demo authentication: accounts are stored only in this browser (passwords are salted + hashed, never kept in plain text).</p>
    </div>
  );
}
