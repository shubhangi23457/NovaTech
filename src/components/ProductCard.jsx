import { Link } from 'react-router-dom';
import { useCart } from '../hooks/useCart.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { useToast } from '../hooks/useToast.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { HeartIcon, StarIcon } from './Icons.jsx';

export const onImageError = (e) => {
  if (!e.currentTarget.src.endsWith('/placeholder.svg')) e.currentTarget.src = '/placeholder.svg';
};

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const saved = isInWishlist(product.id);

  const handleAdd = () => {
    const res = addToCart(product, 1);
    showToast(res.ok ? `${product.name} added to cart.` : res.reason === 'out-of-stock' ? 'Sorry, this item is out of stock.' : 'This product is unavailable.');
  };
  const handleWish = () => {
    const added = toggleWishlist(product);
    showToast(added ? 'Saved to your wishlist.' : 'Removed from your wishlist.');
  };

  return (
    <article className="product-card" data-testid="product-card">
      <button
        type="button"
        className={`product-wish wishlist-btn ${saved ? 'saved' : ''}`}
        onClick={handleWish}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      >
        <HeartIcon filled={saved} width="18" height="18" />
      </button>
      <Link to={`/products/${product.id}`} className="product-image" aria-label={`View details for ${product.name}`}>
        <img src={product.image || '/placeholder.svg'} alt={product.name} loading="lazy" decoding="async" onError={onImageError} />
        {product.discount >= 10 && <span className="product-label">{product.discount}% OFF</span>}
        <span className="quick-view">View Details ↗</span>
      </Link>
      <div className="product-info">
        <div className="product-meta">
          <small>{product.category}</small>
          {product.rating != null && (
            <span className="product-stars"><StarIcon /> <b>{product.rating.toFixed(1)}</b></span>
          )}
        </div>
        <h3><Link to={`/products/${product.id}`}>{product.name}</Link></h3>
        <div className="price-row">
          <strong>{formatCurrency(product.price)}</strong>
          {product.oldPrice && <del>{formatCurrency(product.oldPrice)}</del>}
          <button
            type="button"
            className="card-cart add-to-cart"
            onClick={handleAdd}
            disabled={!product.inStock}
            aria-label={product.inStock ? `Add ${product.name} to cart` : `${product.name} is out of stock`}
          >
            +
          </button>
        </div>
      </div>
    </article>
  );
}
