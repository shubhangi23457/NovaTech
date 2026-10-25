import ProductCard from './ProductCard.jsx';

export default function ProductGrid({ products, className = 'product-grid' }) {
  return (
    <div className={className} aria-live="polite">
      {products.map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
