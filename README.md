# NovaTech — React e-commerce front end

Electronics store built with **React 18, React Router 6, Context API and Vite**. Every page of the original HTML/JS site now lives in one React single-page app (`index.html` is the only entry point). The original NovaTech look is preserved (`src/styles/style.css` is the original stylesheet; `src/styles/app.css` adds the new bits).

## Run it
```bash
npm install
cp .env.example .env     # optional – defaults work
npm run dev              # http://localhost:5173
npm test                 # 63 automated tests (Vitest + Testing Library)
npm run build            # production build in dist/
npm run preview          # serve the build locally
```
Needs internet access when running: products come from the public DummyJSON API.

## Routes
| Route | Page | Access |
|---|---|---|
| `/` | Home (hero, deals, categories, deal of the day, newest) | public |
| `/products` | Catalog with search, filters, sort, pagination | public |
| `/products/:id` | Product details (gallery, specs, reviews, related) | public |
| `/search?q=` | Same catalog view, search-first | public |
| `/wishlist` | Wishlist (qty, move to cart) | public |
| `/login`, `/register` | Auth forms | public only (signed-in users are redirected) |
| `/cart`, `/checkout`, `/account`, `/orders` | Cart, demo checkout, profile/addresses/rewards, orders & returns | **protected** → `/login`, then back to the original page |
| `/seller` | Seller application + demo listings form | public (listings need login) |
| `/policies?policy=` | Store policies | public |
| `/404`, `*` | Not found | public |

## Architecture
```
src/
  components/  Navbar, Footer, ProductCard/Grid/Skeleton, SearchBar, FilterSidebar, SortDropdown,
               Pagination, CatalogView, FormInput, Modal, SidePanel, CartDrawer, MenuDrawer,
               ProtectedRoute, PublicOnlyRoute, ThemeIcon, …
  pages/       Home, Products, ProductDetails, SearchResults, Cart, Wishlist, Checkout, Login,
               Register, Account, Orders, SellerDashboard, Policies, NotFound
  context/     Auth, Cart, Wishlist, Theme, Toast  (+ hooks/useAuth, useCart, useWishlist, …)
  hooks/       useProducts, useProduct, useCatalogFilters (URL state), useDebounce, useStoredState …
  services/    productService (API), authService (mock), accountService (orders/rewards)
  utils/       validation, productUtils (search/filter/sort), storage, formatCurrency
  layouts/     MainLayout (nav + footer + drawers), AuthLayout
```
Data flow: **one source of truth per concern** – `CartContext` / `WishlistContext` feed the navbar badge, product cards, product page, cart drawer, cart page and checkout. State is saved to `localStorage` **per user** (`novatech:<userId|guest>:cart`), corrupted data is ignored, and signing in merges the guest cart/wishlist into the user's.

## Product API
* Default: **DummyJSON** (`https://dummyjson.com`), configurable with `VITE_API_BASE_URL`. No API key.
* The catalog = categories `smartphones, laptops, tablets, mobile-accessories, mens-watches, womens-watches` (`GET /products/category/:slug`), fetched once in parallel and cached; single products use `GET /products/:id`.
* Responses are validated/normalised in `normalizeProduct` (bad records are dropped). USD prices are converted to INR with `VITE_USD_TO_INR` (default 83) – a display convenience, not a real FX feed.
* Loading skeletons, error + **Try again**, empty states, invalid-id and network-error handling are implemented.
* Search/filter/sort run client-side on the cached catalog (the filters need the whole set, and this avoids a request per keystroke; typing is also debounced 300 ms). DummyJSON's `/products/search` endpoint is therefore intentionally not used.
* **Limitation:** DummyJSON is read-only; sellers' "listings" are stored only in the browser and never appear in the catalog. It is a demo API, not a production database.

## Search, filters, sort
All state lives in the URL (`/products?q=phone&category=Smartphones&brand=Apple&min=5000&max=90000&rating=4&stock=1&discount=10&sort=price-asc&page=2`) so links are shareable and refresh-safe. Filter groups are only shown if the data has that attribute; "Newest first" is only offered when products have a creation date. Logic is pure and unit-tested in `utils/productUtils.js`.

## Authentication — read this
There is **no backend**, so `services/authService.js` is a clearly labelled **mock**: users and the session live in `localStorage`. Passwords are never stored in plain text (PBKDF2-SHA-256 with a random salt via Web Crypto), but this is **not secure production authentication**: anyone with browser access can read or alter the data, and nobody verifies the session token. `ProtectedRoute` only hides pages in the UI; a real server must enforce access control and re-validate all input. To go live, keep the function signatures (`register, login, logout, getCurrentUser, updateProfile`) and swap the bodies for `fetch` calls to your API. No secrets are used anywhere (`VITE_*` variables are public).

## Forms
`utils/validation.js` (pure, tested) + `components/FormInput.jsx` (label ↔ input, `aria-invalid`, `aria-describedby` error text, show/hide password). Used by login, register, profile, address (checkout + account), seller application, seller listing (price > 0, stock ≥ 0), newsletter, contact. Submit buttons are disabled while a request is running; entered values are kept when validation fails.

## Checkout & orders (demo)
Checkout reads the global cart, validates the address, and creates a **demo order** (no payment, no card data collected). Orders, addresses, rewards and return requests are saved per user in `localStorage`; there is no fulfilment backend.

## Deployment
* **Vercel:** `vercel.json` rewrites every path to `index.html`. Build command `npm run build`, output `dist`.
* **Netlify:** `public/_redirects` (`/* /index.html 200`) is copied into `dist`.
* Set `VITE_API_BASE_URL` / `VITE_USD_TO_INR` in the host's environment settings if you change them (see `.env.example`).

## Tests (63)
`productUtils` (search/filter/sort/URL), `productService` (normalising, caching, errors), `validation`, cart & wishlist (add/merge/qty/persistence/corrupt storage/ProductCard), auth service + protected routes + login/register forms, catalog pages (loading, URL query, debounce, filters, sort, empty, error + retry, product-not-found), checkout flow (validation, order creation, per-user carts), orders/returns, profile.

## Syllabus mapping (Front End Engineering-II)
| Topic | Where |
|---|---|
| Components, props, JSX, lists & keys | `components/`, `pages/` |
| Hooks (`useState/useEffect/useMemo/useCallback/useRef`, custom hooks) | `hooks/`, `CatalogView`, `Home` countdown |
| Context API / global state | `context/` |
| React Router (nested routes, params, search params, protected routes, 404, lazy routes) | `App.jsx`, `ProtectedRoute`, `useCatalogFilters` |
| Forms & validation, controlled inputs | `FormInput`, `utils/validation.js`, `pages/Login|Register|Checkout` |
| API integration, async, loading/error states | `services/productService.js`, `hooks/useProducts.js` |
| Debouncing, memoisation, code splitting | `useDebounce`, `useMemo` in `CatalogView`, `React.lazy` in `App.jsx` |
| Testing | `src/test/` |
| Build & deploy (Vite, env vars, SPA rewrites) | `vite.config.js`, `.env.example`, `vercel.json` |
