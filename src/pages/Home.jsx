import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.js';
import { useCart } from '../hooks/useCart.js';
import { useWishlist } from '../hooks/useWishlist.js';
import { useToast } from '../hooks/useToast.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { sortProducts } from '../utils/productUtils.js';
import { formatCurrency } from '../utils/formatCurrency.js';
import { validateNewsletter } from '../utils/validation.js';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductSkeleton from '../components/ProductSkeleton.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import FormInput from '../components/FormInput.jsx';
import { HeartIcon, StarIcon } from '../components/Icons.jsx';
import { onImageError } from '../components/ProductCard.jsx';

function useCountdownToMidnight() {
  const calc = () => {
    const now = new Date();
    const end = new Date(now); end.setHours(24, 0, 0, 0);
    const s = Math.max(0, Math.floor((end - now) / 1000));
    return { h: Math.floor(s / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id); // cleaned up on unmount
  }, []);
  return t;
}
const pad = (n) => String(n).padStart(2, '0');

function DealSpotlight({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const t = useCountdownToMidnight();
  const saved = isInWishlist(product.id);
  return (
    <section className="deal-section" id="deals" aria-labelledby="deal-title">
      <div className="section-wrap deal-inner">
        <div className="deal-visual">
          <div className="deal-sticker">DEAL<br />OF THE<br />DAY</div>
          <span className="floating-chip">{product.discount}% OFF</span>
          <img src={product.images[0] || product.image} alt={product.name} loading="lazy" decoding="async" onError={onImageError} />
        </div>
        <div className="deal-copy">
          <p className="eyebrow lime"><span></span> Today only · Limited stock</p>
          <div className="countdown" role="timer" aria-label="Time remaining">
            <div><b>{pad(t.h)}</b><span>hrs</span></div><i>:</i>
            <div><b>{pad(t.m)}</b><span>min</span></div><i>:</i>
            <div><b>{pad(t.s)}</b><span>sec</span></div>
          </div>
          <p className="product-kicker">{product.category.toUpperCase()}</p>
          <h2 id="deal-title">{product.name}</h2>
          {product.rating != null && <div className="rating"><StarIcon /> <b>{product.rating.toFixed(1)}</b> <small>({product.reviews.length || 'verified'} reviews)</small></div>}
          <p className="deal-description">{product.description}</p>
          <div className="price-line">
            <strong>{formatCurrency(product.price)}</strong>
            {product.oldPrice && <del>{formatCurrency(product.oldPrice)}</del>}
            <mark>{product.discount}% OFF</mark>
          </div>
          <div className="deal-actions">
            <button type="button" className="button button-lime add-to-cart" onClick={() => { const r = addToCart(product, 1); showToast(r.ok ? 'Added to cart.' : 'This item is unavailable.'); }}>Add to cart <span>+</span></button>
            <Link className="button button-outline" to={`/products/${product.id}`}>View specs</Link>
            <button type="button" className={`circle-button wishlist-btn ${saved ? 'saved' : ''}`} aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'} onClick={() => toggleWishlist(product)}>
              <HeartIcon filled={saved} width="18" height="18" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const submit = (e) => {
    e.preventDefault();
    const errs = validateNewsletter({ email });
    setErrors(errs);
    if (Object.keys(errs).length) return;
    showToast('Subscribed! (Demo — no email is actually stored.)');
    setEmail('');
  };
  return (
    <section className="newsletter section-wrap" aria-labelledby="newsletter-title">
      <div>
        <p className="eyebrow"><span></span> On the signal</p>
        <h2 id="newsletter-title">Good things are<br /><em>on their way.</em></h2>
      </div>
      <form className="newsletter-form" onSubmit={submit} noValidate>
        <FormInput id="newsletter-email" type="email" label="Email address" placeholder="Your email address" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <button className="button button-lime" type="submit">Subscribe <span></span></button>
        <p>New drops, private offers, zero noise. Unsubscribe anytime.</p>
      </form>
    </section>
  );
}

export default function Home() {
  useDocumentTitle('');
  const { products, loading, error, refetch } = useProducts();

  const { deals, spotlight, latest, categories } = useMemo(() => {
    const discounted = sortProducts(products.filter((p) => p.discount > 0), 'discount');
    const newest = sortProducts(products, products.some((p) => p.createdAt) ? 'newest' : 'featured');
    const cats = [...new Set(products.map((p) => p.category))].slice(0, 4)
      .map((c) => ({ name: c, count: products.filter((p) => p.category === c).length }));
    return { deals: discounted.slice(0, 4), spotlight: discounted[0], latest: newest.slice(0, 8), categories: cats };
  }, [products]);

  return (
    <>
      <section className="hero section-wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span></span> The future, delivered</p>
          <h1 id="hero-title">Technology that<br /><em>moves with you.</em></h1>
          <p className="hero-text">Discover handpicked premium electronics built for modern life — exceptional performance, refined design, and lasting quality.</p>
          <div className="hero-cta">
            <Link className="button button-lime" to="/products">Explore premium drops <span></span></Link>
            <Link className="text-link" to="/products?sort=discount">See limited offers <span></span></Link>
          </div>
          <div className="trust-row" aria-label="Store benefits">
            <div><strong>48hr</strong><span>express dispatch</span></div>
            <div><strong>2-year</strong><span>easy warranty</span></div>
            <div><strong>4.9/5</strong><span>from 12k+ reviews</span></div>
          </div>
          <div className="hero-highlights">
            <span>Concierge support, 24/7</span><span>Handpicked premium launches</span><span>Secure checkout and fast fulfillment</span>
          </div>
        </div>
        <div className="hero-art tilt-surface" aria-label="Featured product">
          <div className="orb orb-one"></div><div className="orb orb-two"></div><div className="hero-grid" aria-hidden="true"></div>
          <div className="hero-label top-label"><span>01</span> NEW ARRIVALS</div>
          <div className="hero-label bottom-label"><span>48H</span> DISPATCH</div>
          <div className="hero-status"><i></i> IN STOCK</div>
          <div className="hero-product-card">
            <div className="hero-model">NOVA<br />TECH</div>
            {latest[0] && <img src={latest[0].images[0] || latest[0].image} alt={latest[0].name} fetchpriority="high" decoding="async" onError={onImageError} />}
            {latest[0] && <div className="hero-price"><span>from</span><strong>{formatCurrency(latest[0].price)}</strong></div>}
          </div>
        </div>
      </section>

      <section className="announce-bar" aria-label="Current promotion">
        <div>END OF SEASON EVENT <b>·</b> UP TO 40% OFF <b>·</b> FREE EXPRESS DELIVERY <b>·</b> NO COST EMI AVAILABLE <b>·</b> END OF SEASON EVENT <b>·</b> UP TO 40% OFF <b>·</b></div>
      </section>

      <section className="section-wrap premium-showcase" aria-labelledby="premium-title">
        <div className="section-heading"><div>
          <p className="eyebrow"><span></span> Know more about our products</p>
          <h2 id="premium-title">The advantage of choosing NovaTech.</h2>
        </div></div>
        <div className="premium-grid">
          <article className="premium-card"><strong>Curated luxury</strong><p>Only products that blend performance, design, and reliability make it into our collection.</p></article>
          <article className="premium-card"><strong>Priority delivery</strong><p>Express shipping and premium support ensure your gear arrives faster and ready to go.</p></article>
          <article className="premium-card"><strong>Exclusive access</strong><p>Early-release offers, limited drops, and private previews for our most dedicated customers.</p></article>
        </div>
      </section>

      {error ? (
        <section className="section-wrap"><ErrorMessage title="We couldn’t load the catalog" message={error.message} onRetry={refetch} /></section>
      ) : (
        <>
          <section className="section-wrap offers-showcase" id="offers" aria-labelledby="offers-title">
            <div className="section-heading">
              <div><p className="eyebrow"><span></span> Prices worth moving for</p><h2 id="offers-title">Hot Deals &amp; Limited Drops</h2></div>
              <Link className="text-link" to="/products?sort=discount">View all deals <span></span></Link>
            </div>
            {loading ? <ProductSkeleton count={4} /> : <ProductGrid products={deals} />}
          </section>

          {!loading && categories.length > 0 && (
            <section className="section-wrap collections" id="categories" aria-labelledby="categories-title">
              <div className="section-heading">
                <div><p className="eyebrow"><span></span> Shop by collection</p><h2 id="categories-title">Find your frequency.</h2></div>
                <Link className="text-link" to="/products">View all products <span></span></Link>
              </div>
              <div className="category-grid">
                {categories.map((c, i) => (
                  <Link key={c.name} className={`category-card cat-${'abcd'[i]}`} to={`/products?category=${encodeURIComponent(c.name)}`}>
                    <span>{c.name}</span><small>{c.count} items <i></i></small>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {!loading && spotlight && <DealSpotlight product={spotlight} />}

          <section className="section-wrap products-section" id="shop" aria-labelledby="products-title">
            <div className="section-heading product-heading">
              <div><p className="eyebrow"><span></span> Curated essentials</p><h2 id="products-title">Just landed.</h2></div>
              <Link className="text-link" to="/products">Browse &amp; filter all <span></span></Link>
            </div>
            {loading ? <ProductSkeleton count={8} /> : <ProductGrid products={latest} />}
            <div className="center"><Link className="button button-outline" to="/products">Load more gear <span></span></Link></div>
          </section>
        </>
      )}

      <section className="section-wrap service-strip" aria-label="Shopping benefits">
        <article><span className="service-icon"></span><div><h3>Free express delivery</h3><p>On all orders above ₹999</p></div></article>
        <article><span className="service-icon"></span><div><h3>14-day easy returns</h3><p>Risk-free replacement guarantee</p></div></article>
        <article><span className="service-icon"></span><div><h3>Pay your way</h3><p>UPI, Credit/Debit, EMI &amp; COD</p></div></article>
        <article><span className="service-icon"></span><div><h3>Genuine warranty</h3><p>100% verified authentic tech</p></div></article>
      </section>

      <Newsletter />
    </>
  );
}
