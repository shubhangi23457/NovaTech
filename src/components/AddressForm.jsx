import FormInput from './FormInput.jsx';

export const EMPTY_ADDRESS = { name: '', phone: '', pin: '', address: '', city: '', state: '' };
export const formatAddress = (a) => `${a.address}, ${a.city}, ${a.state} - ${a.pin}${a.phone ? ` · ${a.phone}` : ''}`;

/** Controlled address fields with inline errors. Parent owns values + errors. */
export default function AddressForm({ idPrefix, values, errors, onChange, disabled }) {
  const f = (key, label, extra = {}) => (
    <FormInput id={`${idPrefix}-${key}`} label={label} value={values[key]} error={errors[key]} disabled={disabled}
      onChange={(e) => onChange({ [key]: e.target.value })} {...extra} />
  );
  return (
    <div className="form-stack">
      {f('name', 'Full name', { autoComplete: 'name' })}
      {f('phone', 'Phone number', { type: 'tel', autoComplete: 'tel', placeholder: '9876543210' })}
      {f('address', 'Address', { autoComplete: 'street-address' })}
      <div className="form-row">
        {f('city', 'City', { autoComplete: 'address-level2' })}
        {f('state', 'State', { autoComplete: 'address-level1' })}
        {f('pin', 'PIN code', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' })}
      </div>
    </div>
  );
}
