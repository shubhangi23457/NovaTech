export const formatCategory = (slug) =>
  String(slug || 'Other')
    .replace(/^(mens|womens)-watches$/, 'Watches')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
