const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
export const formatCurrency = (value) => inr.format(Number.isFinite(value) ? value : 0);
