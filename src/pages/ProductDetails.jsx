import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProduct, useProducts } from '../hooks/useProducts.js';
import { useCart } from '../hooks/useCart.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { useToast } from '../hooks/useToast.js';
import { useAuth } from '../hooks/useAuth.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { evaluateAchievements } from '../services/accountService.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { MAX_QTY } from '../context/CartContext.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import { HeartIcon, StarIcon } from '../components/Icons.jsx';
import { onImageError } from '../components/ProductCard.jsx';

function Specs({ p }) {
  const rows = [
    ['Brand', p.brand], ['Category', p.category], ['SKU', p.sku],
    ['Weight', p.weight != null ? `${p.weight} g` : ''],
    ['Dimensions', p.dimensions ? `${p.dimensions.width} × ${p.dimensions.height} × ${p.dimensions.depth} cm` : ''],
    ['Warranty', p.warranty], ['Shipping', p.shipping], ['Returns', p.returnPolicy],
    ['Availability', p.availability || (p.inStock ? 'In Stock' : 'Out of Stock')],
  ].filter(([, v]) => v);
  if (!rows.length) return null;
  return (
    <div style={{ borderTop: '1px solid var(--line)', paddingTop: 20, marginTop: 20 }}>
      <h3>Product Specifications</h3>
      <table className="spec-table"><tbody>{rows.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table>
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { product, loading, error, refetch } = useProduct(id);
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [qty, setQty] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);

  useDocumentTitle(product ? product.name : error?.kind === 'notfound' ? 'Product not found' : 'Product');
  useEffect(() => { setQty(1); setImgIndex(0); }, [id]);
  useEffect(() => { if (product && user) evaluateAchievements(user.id, { explored: true }); }, [product, user]);

  const related = useMemo(
    () => (product ? products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4) : []),
    [products, product]
  );

  if (loading) return <div className="section-wrap product-page-wrap"><LoadingSpinner label="Loading product…" /></div>;
  if (error?.kind === 'notfound') {
    return (
      <div className="section-wrap product-page-wrap">
        <EmptyState title="Product not found" message="The requested item could not be located in our catalog.">
          <Link to="/products" className="button button-lime">Back to catalog</Link>
        </EmptyState>
      </div>
    );
  }
  if (error) return <div className="section-wrap product-page-wrap"><ErrorMessage title="We couldn’t load this product" message={error.message} onRetry={refetch} /></div>;

  const saved = isInWishlist(product.id);
  const add = () => {
    const r = addToCart(product, qty);
    showToast(r.ok ? `${qty} × ${product.name} added to cart.` : 'Sorry, this item is out of stock.');
    return r.ok;
  };

  return (
    <div className="section-wrap product-page-wrap">
      <div className="product-detail-layout">
        <div className="product-gallery">
          <img src={product.images[imgIndex] || product.image || '/placeholder.svg'} alt={product.name} onError={onImageError} />
          {product.images.length > 1 && (
            <div className="gallery-thumbs">
              {product.images.slice(0, 5).map((src, i) => (
                <button key={src} type="button" className={i === imgIndex ? 'active' : ''} onClick={() => setImgIndex(i)} aria-label={`Show image ${i + 1}`} aria-pressed={i === imgIndex}>
                  <img src={src} alt="" loading="lazy" onError={onImageError} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <p className="eyebrow"><span></span> {product.category}{product.brand ? ` · ${product.brand}` : ''}</p>
          <h1>{product.name}</h1>
          {product.rating != null && (
            <div className="rating" style={{ marginBottom: 16 }}>
              <StarIcon /> <b>{product.rating.toFixed(1)}</b> <small>({product.reviews.length} customer reviews)</small>
            </div>
          )}
          <div className="price-line">
            <strong>{formatCurrency(product.price)}</strong>
            {product.oldPrice && <del>{formatCurrency(product.oldPrice)}</del>}
            {product.discount > 0 && <mark>{product.discount}% OFF</mark>}
          </div>
          <p className="muted" style={{ lineHeight: 1.7, fontSize: 14 }}>{product.description}</p>
          <p className={`stock-note ${product.inStock ? 'in' : 'out'}`}>{product.inStock ? (product.stock != null && product.stock <= 10 ? `Only ${product.stock} left in stock` : 'In stock') : 'Out of stock'}</p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0', flexWrap: 'wrap' }}>
            <div className="qty-control" style={{ height: 42 }}>
              <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity" style={{ width: 36, height: '100%', fontSize: 18 }}>−</button>
              <span style={{ width: 40, fontSize: 14 }} aria-live="polite">{qty}</span>
              <button type="button" onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} aria-label="Increase quantity" style={{ width: 36, height: '100%', fontSize: 18 }}>+</button>
            </div>
            <button type="button" className="button button-lime" disabled={!product.inStock} onClick={add} style={{ flex: 1, minWidth: 140 }}>Add to Cart <span>+</span></button>
            <button type="button" className="button button-dark" disabled={!product.inStock} onClick={() => { if (add()) navigate('/checkout'); }}>Buy Now</button>
            <button type="button" className={`circle-button wishlist-btn ${saved ? 'saved' : ''}`} aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} onClick={() => showToast(toggleWishlist(product) ? 'Saved to your wishlist.' : 'Removed from your wishlist.')}>
              <HeartIcon filled={saved} width="18" height="18" />
            </button>
          </div>

          <Specs p={product} />
        </div>
      </div>

      {product.reviews.length > 0 && (
        <section style={{ marginTop: 50 }} aria-labelledby="reviews-title">
          <div className="section-heading"><h2 id="reviews-title">Customer reviews</h2></div>
          <ul className="review-list">
            {product.reviews.map((r, i) => (
              <li key={i} className="review">
                <strong>{r.reviewerName || 'Verified buyer'}</strong> <span className="muted">· {r.rating}/5</span>
                <p>{r.comment}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section style={{ marginTop: 60 }}>
          <div className="section-heading"><h2>You might also like</h2></div>
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}
