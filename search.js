/**
 * NovaTech Amazon-Style Search results rendering & filtering engine
 */

// Search State
const searchState = {
  query: '',
  category: 'All',
  brands: [], // Selected brands
  priceMin: 0,
  priceMax: 100000,
  rating: 'all',
  discount: 'all',
  dealsOnly: false,
  newOnly: false,
  noiseControl: [], // Selected noise control filters
  sortBy: 'relevance',
  viewMode: 'list', // 'list' or 'grid'
  currentPage: 1,
  itemsPerPage: 6
};

// DOM Helpers
const getEl = selector => document.querySelector(selector);
const getEls = selector => [...document.querySelectorAll(selector)];

// Initialize Search Page
function initSearchPage() {
  // 1. Parse URL Parameters
  const params = new URLSearchParams(window.location.search);
  searchState.query = params.get('q') || '';
  searchState.category = params.get('cat') || 'All';

  // Set search input value in navbar to query
  const navInput = getEl('#nav-search-input');
  if (navInput) navInput.value = searchState.query;
  const navCat = getEl('#nav-search-cat');
  if (navCat) navCat.value = searchState.category;

  // 2. Set Breadcrumbs and Page Title
  const breadcrumbQuery = getEl('#search-breadcrumb-query');
  if (breadcrumbQuery) {
    breadcrumbQuery.textContent = searchState.query ? `Results for "${searchState.query}"` : 'All Products';
  }
  const pageTitle = getEl('#search-page-title');
  if (pageTitle) {
    pageTitle.textContent = searchState.query ? `Results for "${searchState.query}"` : 'Results';
  }

  // 3. Render Dynamic Sidebar Filter Options (Brands, Category List, etc.)
  renderDynamicFilters();

  // 4. Setup Filters UI Event Listeners
  setupSidebarEventListeners();

  // 5. Initialize Price Dual Slider
  initPriceSlider();

  // 6. Perform Search and Render Products
  performSearchAndRender();
}

// Extract dynamic filter options from NOVATECH_PRODUCTS based on current search results
function renderDynamicFilters() {
  const currentCategoryProducts = NOVATECH_PRODUCTS.filter(p => {
    if (searchState.category !== 'All' && p.category !== searchState.category) return false;
    return true;
  });

  // Unique Brands
  const uniqueBrands = [...new Set(currentCategoryProducts.map(p => p.brand).filter(Boolean))];
  const brandsContainer = getEl('#filter-brands');
  if (brandsContainer) {
    if (uniqueBrands.length > 0) {
      brandsContainer.innerHTML = uniqueBrands.map(brand => `
        <label class="filter-check">
          <input type="checkbox" name="brand" value="${escapeHTML(brand)}" />
          ${escapeHTML(brand)}
        </label>
      `).join('');
    } else {
      brandsContainer.innerHTML = '<p class="muted" style="font-size: 12px; margin: 0;">No brands available</p>';
    }
  }

  // Categories list
  const categoriesContainer = getEl('#filter-categories');
  if (categoriesContainer) {
    const categories = ['All', ...new Set(NOVATECH_PRODUCTS.map(p => p.category).filter(Boolean))];
    categoriesContainer.innerHTML = categories.map(cat => `
      <label class="filter-radio">
        <input type="radio" name="sidebar-category" value="${escapeHTML(cat)}" ${searchState.category === cat ? 'checked' : ''} />
        ${escapeHTML(cat)}
      </label>
    `).join('');
  }

  // Noise Control Filter Group (Mock Noise Control values)
  const noiseControlContainer = getEl('#filter-noise-control');
  if (noiseControlContainer) {
    const noiseOptions = [
      { id: 'sound-isolation', label: 'Sound Isolation' },
      { id: 'anc', label: 'Active Noise Cancellation' },
      { id: 'passive-noise', label: 'Passive Noise Cancellation' },
      { id: 'enc', label: 'Environmental Noise Cancellation' }
    ];
    noiseControlContainer.innerHTML = noiseOptions.map(option => `
      <label class="filter-check">
        <input type="checkbox" name="noise-control" value="${option.id}" />
        ${option.label}
      </label>
    `).join('');
  }
}

// Setup Event Listeners for Filters
function setupSidebarEventListeners() {
  // Mobile filter toggle panel slide-out
  const filterToggleBtn = getEl('#filter-toggle');
  const filtersPanel = getEl('#search-filters');
  const overlay = getEl('#overlay');
  
  if (filterToggleBtn && filtersPanel) {
    filterToggleBtn.addEventListener('click', () => {
      filtersPanel.classList.toggle('active');
      if (overlay) overlay.classList.add('active');
    });
  }

  // Category change listener
  const catRadios = getEls('input[name="sidebar-category"]');
  catRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      searchState.category = e.target.value;
      searchState.currentPage = 1;
      
      // Update top search category select just in case
      const topCatSelect = getEl('#nav-search-cat');
      if (topCatSelect) topCatSelect.value = e.target.value;

      performSearchAndRender();
    });
  });

  // Brands change listener
  const brandsContainer = getEl('#filter-brands');
  if (brandsContainer) {
    brandsContainer.addEventListener('change', () => {
      const selectedChecked = getEls('input[name="brand"]:checked');
      searchState.brands = selectedChecked.map(cb => cb.value);
      searchState.currentPage = 1;
      performSearchAndRender();
    });
  }

  // Noise Control change listener
  const noiseContainer = getEl('#filter-noise-control');
  if (noiseContainer) {
    noiseContainer.addEventListener('change', () => {
      const selectedChecked = getEls('input[name="noise-control"]:checked');
      searchState.noiseControl = selectedChecked.map(cb => cb.value);
      searchState.currentPage = 1;
      performSearchAndRender();
    });
  }

  // Price range radio listener
  const priceRadios = getEls('input[name="price"]');
  priceRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      const val = e.target.value;
      if (val === 'all') {
        searchState.priceMin = 0;
        searchState.priceMax = 100000;
      } else {
        const [min, max] = val.split('-').map(Number);
        searchState.priceMin = min;
        searchState.priceMax = max || 100000;
      }
      
      // Sync manual inputs & slider values
      const minInput = getEl('#price-min');
      const maxInput = getEl('#price-max');
      if (minInput) minInput.value = searchState.priceMin;
      if (maxInput) maxInput.value = val.includes('-') && !val.endsWith('999999') ? searchState.priceMax : '';
      
      syncPriceSliders();
      searchState.currentPage = 1;
      performSearchAndRender();
    });
  });

  // Custom price range Go button listener
  const priceGoBtn = getEl('#price-go-btn');
  if (priceGoBtn) {
    priceGoBtn.addEventListener('click', () => {
      const minInput = getEl('#price-min');
      const maxInput = getEl('#price-max');
      const minVal = parseInt(minInput ? minInput.value : 0) || 0;
      const maxVal = parseInt(maxInput ? maxInput.value : 100000) || 100000;

      searchState.priceMin = minVal;
      searchState.priceMax = maxVal;

      // Uncheck price radios
      const checkedPriceRadio = getEl('input[name="price"]:checked');
      if (checkedPriceRadio) checkedPriceRadio.checked = false;

      syncPriceSliders();
      searchState.currentPage = 1;
      performSearchAndRender();
    });
  }

  // Rating change listener
  const ratingRadios = getEls('input[name="rating"]');
  ratingRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      searchState.rating = e.target.value;
      searchState.currentPage = 1;
      performSearchAndRender();
    });
  });

  // Discount change listener
  const discountRadios = getEls('input[name="discount"]');
  discountRadios.forEach(radio => {
    radio.addEventListener('change', e => {
      searchState.discount = e.target.value;
      searchState.currentPage = 1;
      performSearchAndRender();
    });
  });

  // Availability checkbox listeners
  const dealsOnlyCb = getEl('#filter-deals-only');
  if (dealsOnlyCb) {
    dealsOnlyCb.addEventListener('change', e => {
      searchState.dealsOnly = e.target.checked;
      searchState.currentPage = 1;
      performSearchAndRender();
    });
  }

  const newOnlyCb = getEl('#filter-new-only');
  if (newOnlyCb) {
    newOnlyCb.addEventListener('change', e => {
      searchState.newOnly = e.target.checked;
      searchState.currentPage = 1;
      performSearchAndRender();
    });
  }

  // Clear filters button
  const clearBtn = getEl('#filter-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      resetAllFilters();
    });
  }

  // View toggle listeners (List vs Grid)
  const viewListBtn = getEl('#view-list');
  const viewGridBtn = getEl('#view-grid');
  
  if (viewListBtn && viewGridBtn) {
    viewListBtn.addEventListener('click', () => {
      searchState.viewMode = 'list';
      viewListBtn.classList.add('active');
      viewGridBtn.classList.remove('active');
      performSearchAndRender();
    });

    viewGridBtn.addEventListener('click', () => {
      searchState.viewMode = 'grid';
      viewGridBtn.classList.add('active');
      viewListBtn.classList.remove('active');
      performSearchAndRender();
    });
  }

  // Sorting change listener
  const sortSelect = getEl('#search-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      searchState.sortBy = e.target.value;
      searchState.currentPage = 1;
      performSearchAndRender();
    });
  }
}

// Reset filters state
function resetAllFilters() {
  searchState.brands = [];
  searchState.priceMin = 0;
  searchState.priceMax = 100000;
  searchState.rating = 'all';
  searchState.discount = 'all';
  searchState.dealsOnly = false;
  searchState.newOnly = false;
  searchState.noiseControl = [];
  searchState.currentPage = 1;

  // Uncheck inputs in UI
  getEls('input[name="brand"]').forEach(cb => cb.checked = false);
  getEls('input[name="noise-control"]').forEach(cb => cb.checked = false);
  
  const allPriceRadio = getEl('input[name="price"][value="all"]');
  if (allPriceRadio) allPriceRadio.checked = true;

  const allRatingRadio = getEl('input[name="rating"][value="all"]');
  if (allRatingRadio) allRatingRadio.checked = true;

  const allDiscountRadio = getEl('input[name="discount"][value="all"]');
  if (allDiscountRadio) allDiscountRadio.checked = true;

  const dealsOnlyCb = getEl('#filter-deals-only');
  if (dealsOnlyCb) dealsOnlyCb.checked = false;

  const newOnlyCb = getEl('#filter-new-only');
  if (newOnlyCb) newOnlyCb.checked = false;

  const minInput = getEl('#price-min');
  const maxInput = getEl('#price-max');
  if (minInput) minInput.value = '';
  if (maxInput) maxInput.value = '';

  syncPriceSliders(0, 100000);
  performSearchAndRender();
  showToast('Filters cleared.');
}

// Initialize Custom Price Dual Slider
function initPriceSlider() {
  const slider1 = getEl('#slider-1');
  const slider2 = getEl('#slider-2');
  const track = getEl('.slider-track');
  const minValSpan = getEl('#range-min-val');
  const maxValSpan = getEl('#range-max-val');

  if (!slider1 || !slider2 || !track) return;

  function updateSlider() {
    let val1 = parseInt(slider1.value);
    let val2 = parseInt(slider2.value);

    // Prevent thumbs from crossing
    if (val2 - val1 < 5000) {
      if (this === slider1) {
        slider1.value = val2 - 5000;
        val1 = val2 - 5000;
      } else {
        slider2.value = val1 + 5000;
        val2 = val1 + 5000;
      }
    }

    // Set span labels
    if (minValSpan) minValSpan.textContent = `₹${val1.toLocaleString('en-IN')}`;
    if (maxValSpan) maxValSpan.textContent = val2 >= 100000 ? '₹100,000+' : `₹${val2.toLocaleString('en-IN')}`;

    // Fill track color range
    const pct1 = (val1 / slider1.max) * 100;
    const pct2 = (val2 / slider2.max) * 100;
    track.style.background = `linear-gradient(to right, var(--line) ${pct1}%, #007185 ${pct1}%, #007185 ${pct2}%, var(--line) ${pct2}%)`;

    searchState.priceMin = val1;
    searchState.priceMax = val2 >= 100000 ? 999999 : val2;
  }

  slider1.addEventListener('input', updateSlider);
  slider2.addEventListener('input', updateSlider);
  
  // Triggers search when sliding finishes to prevent excessive rendering during drag
  slider1.addEventListener('change', () => {
    searchState.currentPage = 1;
    performSearchAndRender();
  });
  slider2.addEventListener('change', () => {
    searchState.currentPage = 1;
    performSearchAndRender();
  });

  // Initial fill
  updateSlider.call(slider1);
}

// Synchronize Sliders with Input Values
function syncPriceSliders(minVal, maxVal) {
  const slider1 = getEl('#slider-1');
  const slider2 = getEl('#slider-2');
  const minValSpan = getEl('#range-min-val');
  const maxValSpan = getEl('#range-max-val');
  const track = getEl('.slider-track');

  const min = minVal !== undefined ? minVal : searchState.priceMin;
  let max = maxVal !== undefined ? maxVal : searchState.priceMax;
  if (max > 100000) max = 100000;

  if (slider1 && slider2) {
    slider1.value = min;
    slider2.value = max;
    
    if (minValSpan) minValSpan.textContent = `₹${min.toLocaleString('en-IN')}`;
    if (maxValSpan) maxValSpan.textContent = max >= 100000 ? '₹100,000+' : `₹${max.toLocaleString('en-IN')}`;

    const pct1 = (min / slider1.max) * 100;
    const pct2 = (max / slider2.max) * 100;
    if (track) {
      track.style.background = `linear-gradient(to right, var(--line) ${pct1}%, #007185 ${pct1}%, #007185 ${pct2}%, var(--line) ${pct2}%)`;
    }
  }
}

// Perform Search, Filter, Sort and Pagination Render
function performSearchAndRender() {
  const queryWords = searchState.query.trim().toLowerCase().split(/\s+/).filter(Boolean);

  // 1. FILTERING
  const filtered = NOVATECH_PRODUCTS.filter(product => {
    // A. Query Matching (matches all terms in title, category, brand, tags, or specs)
    if (queryWords.length > 0) {
      const matchText = [
        product.name,
        product.category,
        product.brand,
        (product.tags || []).join(' '),
        product.description,
        JSON.stringify(product.specifications || {})
      ].join(' ').toLowerCase();

      const matchesAllWords = queryWords.every(word => matchText.includes(word));
      if (!matchesAllWords) return false;
    }

    // B. Category Filter
    if (searchState.category !== 'All' && product.category !== searchState.category) return false;

    // C. Brand Filter
    if (searchState.brands.length > 0 && !searchState.brands.includes(product.brand)) return false;

    // D. Noise Control Filter (checking if tag contains option or spec includes)
    if (searchState.noiseControl.length > 0) {
      const specs = JSON.stringify(product.specifications || {}).toLowerCase();
      const tags = (product.tags || []).join(' ').toLowerCase();
      
      const matchNoise = searchState.noiseControl.some(noise => {
        if (noise === 'anc') {
          return tags.includes('anc') || specs.includes('anc') || specs.includes('noise cancelling');
        }
        if (noise === 'sound-isolation') {
          return specs.includes('isolation') || specs.includes('passive noise') || tags.includes('isolation');
        }
        if (noise === 'passive-noise') {
          return specs.includes('passive noise') || tags.includes('passive');
        }
        if (noise === 'enc') {
          return specs.includes('environmental') || specs.includes('enc') || tags.includes('enc');
        }
        return false;
      });
      
      if (!matchNoise) return false;
    }

    // E. Price Range
    if (product.price < searchState.priceMin || product.price > searchState.priceMax) return false;

    // F. Ratings Filter
    if (searchState.rating !== 'all') {
      const minRating = parseFloat(searchState.rating);
      if (product.rating < minRating) return false;
    }

    // G. Discount Filter
    if (searchState.discount !== 'all') {
      const minDiscount = parseInt(searchState.discount);
      const discountPct = product.discount || Math.round((1 - product.price / product.oldPrice) * 100) || 0;
      if (discountPct < minDiscount) return false;
    }

    // H. Deals Only
    if (searchState.dealsOnly && !product.deal) return false;

    // I. New Arrivals Only
    if (searchState.newOnly && product.badge !== 'NEW' && (!product.createdAt || new Date(product.createdAt) < new Date('2026-02-01'))) return false;

    return true;
  });

  // 2. SORTING
  filtered.sort((a, b) => {
    if (searchState.sortBy === 'price-low') return a.price - b.price;
    if (searchState.sortBy === 'price-high') return b.price - a.price;
    if (searchState.sortBy === 'rating') return b.rating - a.rating;
    if (searchState.sortBy === 'discount') {
      const discA = a.discount || (a.oldPrice ? Math.round((1 - a.price / a.oldPrice) * 100) : 0);
      const discB = b.discount || (b.oldPrice ? Math.round((1 - b.price / b.oldPrice) * 100) : 0);
      return discB - discA;
    }
    if (searchState.sortBy === 'newest') {
      return new Date(b.createdAt || '2026-01-01') - new Date(a.createdAt || '2026-01-01');
    }
    // Default relevance: Featured first, then rating
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }
    return b.rating - a.rating;
  });

  // Update results counts
  const resultCountText = getEl('#search-result-count');
  if (resultCountText) {
    if (filtered.length === 0) {
      resultCountText.textContent = '';
    } else {
      resultCountText.textContent = `Showing 1–${Math.min(filtered.length, searchState.itemsPerPage * searchState.currentPage)} of ${filtered.length} results for "${searchState.query || searchState.category}"`;
    }
  }

  // 3. PAGINATION MATH
  const totalPages = Math.ceil(filtered.length / searchState.itemsPerPage);
  if (searchState.currentPage > totalPages) searchState.currentPage = Math.max(1, totalPages);
  
  const startIndex = (searchState.currentPage - 1) * searchState.itemsPerPage;
  const paginatedProducts = filtered.slice(startIndex, startIndex + searchState.itemsPerPage);

  // 4. RENDERING GRID OR LIST
  const gridContainer = getEl('#search-product-grid');
  const noResultsPanel = getEl('#search-no-results');
  const topBar = getEl('#search-results-topbar');
  const paginationContainer = getEl('#search-pagination');

  if (!gridContainer) return;

  if (filtered.length === 0) {
    gridContainer.innerHTML = '';
    if (noResultsPanel) noResultsPanel.style.display = 'block';
    if (topBar) topBar.style.display = 'none';
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }

  if (noResultsPanel) noResultsPanel.style.display = 'none';
  if (topBar) topBar.style.display = 'flex';

  if (searchState.viewMode === 'list') {
    gridContainer.className = 'search-product-grid list-view';
    gridContainer.innerHTML = paginatedProducts.map(renderProductRowHTML).join('');
  } else {
    gridContainer.className = 'search-product-grid';
    gridContainer.innerHTML = paginatedProducts.map(renderProductCardHTML).join('');
  }

  // Render pagination buttons
  renderPaginationButtons(totalPages);
}

// Generate stars display string
function generateStarsString(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(emptyStars);
}

// Generate mock items bought last month based on rating & price
function getMockBoughtCount(product) {
  const seed = (product.price * 3 + (product.reviewsCount || 42)) % 4;
  if (seed === 0) return '10K+ bought in past month';
  if (seed === 1) return '5K+ bought in past month';
  if (seed === 2) return '1K+ bought in past month';
  return '500+ bought in past month';
}

// Calculate dynamic delivery date
function getDynamicDeliveryDate() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const today = new Date();
  
  // Standard Delivery: today + 2 or 3 days
  const stdDelivery = new Date(today);
  stdDelivery.setDate(today.getDate() + 2);
  const stdDay = days[stdDelivery.getDay()];
  const stdDateNum = stdDelivery.getDate();
  const stdMonth = months[stdDelivery.getMonth()];
  
  // Fast Delivery: Tomorrow
  const fastDelivery = new Date(today);
  fastDelivery.setDate(today.getDate() + 1);
  const fastDay = days[fastDelivery.getDay()];
  
  return {
    std: `${stdDay}, ${stdDateNum} ${stdMonth}`,
    fast: `Tomorrow 8 am - 12 pm`
  };
}

// Render Amazon-style Product Row HTML (List View)
function renderProductRowHTML(product) {
  const wishlist = getWishlist();
  const isSaved = wishlist.includes(product.id);
  const boughtText = getMockBoughtCount(product);
  const delivery = getDynamicDeliveryDate();
  
  // Calc discount
  const discountPct = product.discount || (product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0);
  
  // Badges
  const choiceBadge = product.rating >= 4.8 ? `<div class="amazon-choice-badge">NovaTech's <span>Choice</span></div>` : '';
  
  const dealBadgeText = product.deal ? (product.badge || 'Freedom Sale Mega Deal') : (discountPct >= 20 ? 'Limited Time Deal' : '');
  const dealBadge = dealBadgeText ? `<span class="amazon-deal-badge">${escapeHTML(dealBadgeText)}</span>` : '';
  
  // Bank Offer Text
  const bankOffers = [
    'Flat INR 100 Off on ALL BankCards',
    'Get 5% Cashback with NovaTech Pay UPI',
    'Save extra ₹250 with Bank Offers',
    'No Cost EMI available on select cards'
  ];
  const bankOffer = bankOffers[(product.price + (product.reviewsCount || 0)) % bankOffers.length];

  return `
    <article class="product-card" data-card="${product.id}">
      ${choiceBadge}
      <button class="wishlist-toggle-btn wishlist-btn ${isSaved ? 'saved' : ''}" data-product="${product.id}" aria-label="Save ${escapeHTML(product.name)}">
        ${isSaved ? '♥' : '♡'}
      </button>
      
      <a href="product.html?id=${product.id}" class="product-image-wrapper" aria-label="View details for ${escapeHTML(product.name)}">
        <img src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'" />
      </a>
      
      <div class="product-details-wrapper">
        ${product.featured ? '<span class="sponsored-label">Sponsored</span>' : ''}
        <h2 class="product-title-text">
          <a href="product.html?id=${product.id}">${escapeHTML(product.name)}</a>
        </h2>
        
        <div class="product-rating-block">
          <span class="rating-num">${product.rating}</span>
          <span class="stars-display">${generateStarsString(product.rating)}</span>
          <span class="reviews-count">(${product.reviewsCount || 108})</span>
        </div>
        
        <div class="bought-count">${boughtText}</div>
        
        ${dealBadge}
        
        <div class="price-block">
          <div class="price-row">
            <span class="price-main"><span class="price-symbol">₹</span>${product.price.toLocaleString('en-IN')}</span>
            ${product.oldPrice ? `
              <span class="original-price-mrp">M.R.P: <del>₹${product.oldPrice.toLocaleString('en-IN')}</del></span>
              <span class="discount-percentage">(${discountPct}% off)</span>
            ` : ''}
          </div>
          <div class="bank-offer-text">${bankOffer}</div>
        </div>
        
        <div class="delivery-block">
          FREE delivery <span class="delivery-date-bold">${delivery.std}</span><br/>
          Or fastest delivery <span class="delivery-date-bold">${delivery.fast}</span>
        </div>
        
        <button class="amazon-btn-add-to-cart add-to-cart" data-product="${product.id}" aria-label="Add ${escapeHTML(product.name)} to cart">
          Add to cart
        </button>
        
        <div class="colors-variants">+4 other colors/patterns</div>
      </div>
    </article>
  `;
}

// Render Standard Product Card HTML (Grid View)
function renderProductCardHTML(product) {
  const wishlist = getWishlist();
  const isSaved = wishlist.includes(product.id);
  const discountPct = product.discount || (product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0);

  return `
    <article class="product-card" data-card="${product.id}">
      <button class="product-wish wishlist-btn ${isSaved ? 'saved' : ''}" data-product="${product.id}" aria-label="Save ${escapeHTML(product.name)}">
        ${isSaved ? '♥' : '♡'}
      </button>
      
      <a href="product.html?id=${product.id}" class="product-image" aria-label="View details for ${escapeHTML(product.name)}">
        <img src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'" />
        ${product.badge ? `<span class="product-label">${escapeHTML(product.badge)}</span>` : ''}
        ${discountPct >= 20 ? `<span class="product-label" style="background:#cc0c39;">${discountPct}% OFF</span>` : ''}
        <span class="quick-view">View Details ↗</span>
      </a>
      
      <div class="product-info">
        <div class="product-meta">
          <small>${escapeHTML(product.category)}</small>
          <span class="product-stars"><span class="stars-display" style="font-size:12px;">★</span> <b>${product.rating}</b></span>
        </div>
        <h3><a href="product.html?id=${product.id}">${escapeHTML(product.name)}</a></h3>
        <div class="price-row">
          <strong>₹${product.price.toLocaleString('en-IN')}</strong>
          ${product.oldPrice ? `<del>₹${product.oldPrice.toLocaleString('en-IN')}</del>` : ''}
          <button class="card-cart add-to-cart" data-product="${product.id}" aria-label="Add to cart">+</button>
        </div>
      </div>
    </article>
  `;
}

// Render Pagination buttons
function renderPaginationButtons(totalPages) {
  const paginationContainer = getEl('#search-pagination');
  if (!paginationContainer) return;

  if (totalPages <= 1) {
    paginationContainer.innerHTML = '';
    return;
  }

  let html = '';
  
  // Previous button
  html += `
    <button class="pagination-btn" ${searchState.currentPage === 1 ? 'disabled' : ''} data-page="${searchState.currentPage - 1}">
      ← Prev
    </button>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="pagination-btn ${searchState.currentPage === i ? 'active' : ''}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  // Next button
  html += `
    <button class="pagination-btn" ${searchState.currentPage === totalPages ? 'disabled' : ''} data-page="${searchState.currentPage + 1}">
      Next →
    </button>
  `;

  paginationContainer.innerHTML = html;

  // Pagination event click listener
  getEls('#search-pagination .pagination-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const page = parseInt(e.target.dataset.page);
      if (page && page !== searchState.currentPage) {
        searchState.currentPage = page;
        performSearchAndRender();
        
        // Scroll to results top
        const header = getEl('#search-page-header');
        if (header) header.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // If search.html specific elements exist, run search page initialization
  if (getEl('#search-product-grid')) {
    initSearchPage();
  }
});
