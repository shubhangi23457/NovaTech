import { useState } from 'react';

/**
 * Accessible labelled field: label <-> input association, error text linked with aria-describedby,
 * aria-invalid, and a show/hide button for passwords. Use `as="select"` / `as="textarea"` as needed.
 */
export default function FormInput({ id, label, error, hint, as: Tag = 'input', type = 'text', children, ...rest }) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`form-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <Tag
          id={id}
          name={rest.name || id}
          type={Tag === 'input' ? (isPassword && show ? 'text' : type) : undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          {...rest}
        >
          {children}
        </Tag>
        {isPassword && (
          <button type="button" className="input-toggle" onClick={() => setShow((s) => !s)} aria-pressed={show} aria-label={show ? 'Hide password' : 'Show password'}>
            {show ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {hint && <small id={`${id}-hint`} className="field-hint">{hint}</small>}
      {error && <small id={`${id}-error`} className="field-error" role="alert">{error}</small>}
    </div>
  );
}

export function CheckboxField({ id, label, error, ...rest }) {
  return (
    <div className={`form-field checkbox-field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>
        <input id={id} name={rest.name || id} type="checkbox" aria-invalid={error ? 'true' : 'false'} aria-describedby={error ? `${id}-error` : undefined} {...rest} />
        <span>{label}</span>
      </label>
      {error && <small id={`${id}-error`} className="field-error" role="alert">{error}</small>}
    </div>
  );
}
