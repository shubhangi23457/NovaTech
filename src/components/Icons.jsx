const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };

export const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} strokeWidth={2} {...p}><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.3 4.3" /></svg>
);
export const HeartIcon = ({ filled, ...p }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" {...base} fill={filled ? 'currentColor' : 'none'} {...p}>
    <path d="M20.8 4.9a5.4 5.4 0 0 0-7.6 0L12 6.1l-1.2-1.2a5.4 5.4 0 0 0-7.6 7.6L12 21l8.8-8.5a5.4 5.4 0 0 0 0-7.6Z" />
  </svg>
);
export const CartIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" {...base} {...p}>
    <path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.5L20 7H6.2" /><circle cx="9" cy="20" r="1.2" /><circle cx="17" cy="20" r="1.2" />
  </svg>
);
export const UserIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} {...p}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
);
export const PinIcon = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" {...base} strokeWidth={2} {...p}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
);
export const SunIcon = (p) => (
  <svg className="theme-icon" viewBox="0 0 24 24" width="22" height="22" {...base} strokeWidth={2} {...p}>
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);
export const MoonIcon = (p) => (
  <svg className="theme-icon" viewBox="0 0 24 24" width="22" height="22" {...base} strokeWidth={2} {...p}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
);
export const FilterIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" {...base} strokeWidth={2} {...p}><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" /></svg>
);
export const StarIcon = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true" {...p}><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></svg>
);
