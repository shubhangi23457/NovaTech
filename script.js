/**
 * NovaTech Core Interactivity, UI Engine & Event Handler
 */

const products = NOVATECH_PRODUCTS;
const currency = val => formatCurrency(val);

let activeCategory = 'All';
let activePrice = 'all';
let activeRating = 'all';
let activeStock = 'all';
let dealOnly = false;
let activeSort = 'featured';
let renderedCount = 8;

let cart = getCart();
let wishlist = getWishlist();
let wishlistQuantities = getWishlistQuantities();

const byId = id => products.find(p => p.id === id);
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

/* ----------------------------------------------------
 * 1. THEME ENGINE ("Light and dark")
 * ---------------------------------------------------- */
function initTheme() {
  const currentTheme = getTheme();
  document.documentElement.dataset.theme = currentTheme;
  updateThemeToggleButtons(currentTheme);
}

function toggleTheme(event) {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';

  // Fallback for browsers that don't support View Transitions API
  if (!document.startViewTransition || !event) {
    setTheme(next);
    updateThemeToggleButtons(next);
    showToast(`Switched to ${next} mode.`);
    return;
  }

  const x = event.clientX;
  const y = event.clientY;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = document.startViewTransition(() => {
    setTheme(next);
    updateThemeToggleButtons(next);
    showToast(`Switched to ${next} mode.`);
  });

  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`
        ]
      },
      {
        duration: 500,
        easing: 'ease-in-out',
        pseudoElement: '::view-transition-new(root)'
      }
    );
  });
}

function updateThemeToggleButtons(theme) {
  $$('.theme-toggle-btn').forEach(btn => {
    btn.innerHTML = theme === 'dark' ? ' Light mode' : ' Dark mode';
  });
  // New navbar's theme toggle (icon-only button, doesn't use .theme-toggle-btn)
  const navThemeIcon = $('#theme-toggle-icon');
  if (navThemeIcon) navThemeIcon.textContent = theme === 'dark' ? '' : '';
}

/* ----------------------------------------------------
 * 2. PRODUCT CARDS & DEALS RENDERING
 * ---------------------------------------------------- */
function productCardHTML(product) {
  const isSaved = wishlist.includes(product.id);

  return `<article class="product-card" data-card="${product.id}" data-reveal>
    <button class="product-wish wishlist-btn ${isSaved ? 'saved' : ''}" data-product="${product.id}" aria-label="Save ${escapeHTML(product.name)}">
      ${isSaved ? '' : ''}
    </button>
    <a href="product.html?id=${product.id}" class="product-image" aria-label="View details for ${escapeHTML(product.name)}">
      <img src="${product.image}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'" />
      ${product.badge ? `<span class="product-label">${escapeHTML(product.badge)}</span>` : ''}
      <span class="quick-view">View Details ↗</span>
    </a>
    <div class="product-info">
      <div class="product-meta">
        <small>${escapeHTML(product.category)}</small>
        <span class="product-stars"> <b>${product.rating}</b></span>
      </div>
      <h3><a href="product.html?id=${product.id}">${escapeHTML(product.name)}</a></h3>
      <div class="price-row">
        <strong>${currency(product.price)}</strong>
        ${product.oldPrice ? `<del>${currency(product.oldPrice)}</del>` : ''}
        <button class="card-cart add-to-cart" data-product="${product.id}" aria-label="Add ${escapeHTML(product.name)} to cart">+</button>
      </div>
    </div>
  </article>`;
}

function dealCardHTML(product) {
  const isSaved = wishlist.includes(product.id);
  const discountPct = Math.round((1 - product.price / product.oldPrice) * 100);

  return `<article class="deal-card" data-reveal>
    <span class="deal-badge-tag">${escapeHTML(product.badge || 'DEAL')}</span>
    <span class="deal-discount-badge">${discountPct}% OFF</span>
    <img class="deal-card-image" src="${product.image}" alt="${escapeHTML(product.name)}" onerror="this.src='https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'" />
    <div class="deal-card-category">${escapeHTML(product.category)}</div>
    <div class="deal-card-title">${escapeHTML(product.name)}</div>
    <div class="deal-card-rating"> <span>(${product.rating})</span></div>
    <div class="deal-card-prices">
      <strong>${currency(product.price)}</strong>
      <del>${currency(product.oldPrice)}</del>
    </div>
    <div class="deal-card-actions">
      <button class="button button-lime add-to-cart" data-product="${product.id}">Add to Cart</button>
      <button class="circle-button wishlist-btn ${isSaved ? 'saved' : ''}" data-product="${product.id}" aria-label="Wishlist">${isSaved ? '' : ''}</button>
      <a class="button button-outline" href="product.html?id=${product.id}">View</a>
    </div>
  </article>`;
}

function renderDeals() {
  const dealGrid = $('#deal-grid');
  if (!dealGrid) return;
  const dealProducts = products.filter(p => p.deal || p.discount >= 20).slice(0, 4);
  dealGrid.innerHTML = dealProducts.map(dealCardHTML).join('');
}

/* ----------------------------------------------------
 * 3. MULTI-FIELD FILTER & DETERMINISTIC SORTING
 * ---------------------------------------------------- */
function filterProductsList() {
  return products.filter(p => {
    if (activeCategory !== 'All' && p.category !== activeCategory) return false;
    
    if (activePrice === 'under-5000' && p.price >= 5000) return false;
    if (activePrice === '5000-10000' && (p.price < 5000 || p.price >= 10000)) return false;
    if (activePrice === '10000-25000' && (p.price < 10000 || p.price >= 25000)) return false;
    if (activePrice === '25000-50000' && (p.price < 25000 || p.price >= 50000)) return false;
    if (activePrice === 'above-50000' && p.price < 50000) return false;

    if (activeRating === '4' && p.rating < 4.0) return false;
    if (activeRating === '4.5' && p.rating < 4.5) return false;

    if (activeStock === 'in-stock' && !p.stock) return false;
    if (dealOnly && !p.deal) return false;

    return true;
  }).sort((a, b) => {
    if (activeSort === 'low-high') return a.price - b.price;
    if (activeSort === 'high-low') return b.price - a.price;
    if (activeSort === 'rating') return b.rating - a.rating;
    if (activeSort === 'discount') return (b.discount || 0) - (a.discount || 0);
    if (activeSort === 'newest') {
      return new Date(b.createdAt || '2026-01-01') - new Date(a.createdAt || '2026-01-01');
    }
    return 0; // Featured default order
  });
}

function renderProducts() {
  const grid = $('#product-grid');
  if (!grid) return;

  const filtered = filterProductsList();

  if (!filtered.length) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px 20px;">
        <h3>No products match these filters</h3>
        <p class="muted" style="margin: 10px 0 20px;">Try adjusting your category, price range, or clearing active filters.</p>
        <button class="button button-lime" onclick="resetFilters()">Clear All Filters ↺</button>
      </div>
    `;
    if ($('#catalog-result')) $('#catalog-result').textContent = '0 products found';
    if ($('#load-more')) $('#load-more').style.display = 'none';
    return;
  }

  grid.innerHTML = filtered.slice(0, renderedCount).map(productCardHTML).join('');

  const resultCount = $('#catalog-result');
  if (resultCount) {
    resultCount.textContent = `Showing ${Math.min(renderedCount, filtered.length)} of ${filtered.length} products`;
  }

  const loadMoreBtn = $('#load-more');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = renderedCount >= filtered.length ? 'none' : 'inline-flex';
  }

  observeReveals(grid);
}

function resetFilters() {
  activeCategory = 'All';
  activePrice = 'all';
  activeRating = 'all';
  activeStock = 'all';
  dealOnly = false;
  activeSort = 'featured';
  renderedCount = 8;

  if ($('#category-filter')) $('#category-filter').value = 'All';
  if ($('#price-filter')) $('#price-filter').value = 'all';
  if ($('#rating-filter')) $('#rating-filter').value = 'all';
  if ($('#stock-filter')) $('#stock-filter').value = 'all';
  if ($('#deal-filter')) $('#deal-filter').checked = false;
  if ($('#sort-filter')) $('#sort-filter').value = 'featured';

  renderProducts();
  populateCategoryDrawer();
  showToast('Filters cleared.');
}

/* ----------------------------------------------------
 * 4. CATEGORY DRAWER SIDEBAR
 * ---------------------------------------------------- */
function populateCategoryDrawer() {
  const drawerList = $('#category-drawer-list');
  if (!drawerList) return;

  drawerList.innerHTML = NOVATECH_CATEGORIES.map(cat => {
    const catName = cat === 'All Categories' ? 'All' : cat;
    const count = cat === 'All Categories' ? products.length : products.filter(p => p.category === cat).length;
    return `<button class="category-drawer-item ${activeCategory === catName ? 'active' : ''}" data-select-category="${catName}">
      <span>${escapeHTML(cat)}</span>
      <small>${count} items</small>
    </button>`;
  }).join('');
}

function selectCategoryFromSidebar(cat) {
  activeCategory = cat;
  renderedCount = 8;

  if ($('#category-filter')) $('#category-filter').value = cat;

  closeEverything();
  renderProducts();
  populateCategoryDrawer();

  const shopSection = $('#shop');
  if (shopSection) {
    shopSection.scrollIntoView({ behavior: 'smooth' });
  }
  showToast(`Category set to: ${cat}`);
}

/* ----------------------------------------------------
 * 5. CART & WISHLIST MANAGERS WITH PERSISTED QUANTITIES
 * ---------------------------------------------------- */
function updateCounts() {
  cart = getCart();
  wishlist = getWishlist();

  const cartTotal = cart.reduce((sum, item) => sum + item.quantity, 0);
  $$('.cart-count').forEach(el => {
    el.textContent = cartTotal;
    el.classList.toggle('visible', cartTotal > 0);
  });
  $$('.wishlist-count').forEach(el => {
    el.textContent = wishlist.length;
    el.classList.toggle('visible', wishlist.length > 0);
  });
}

function addToCart(id, qty = 1) {
  cart = getCart();
  const item = cart.find(i => i.id === id);
  if (item) {
    item.quantity += qty;
  } else {
    cart.push({ id, quantity: qty });
  }
  setCart(cart);
  updateCounts();
  renderCart();
  showToast(`${byId(id).name} added to cart.`);
}

function updateCartQuantity(id, change) {
  cart = getCart();
  const item = cart.find(i => i.id === id);
  if (!item) return;

  item.quantity += change;
  if (item.quantity < 1) item.quantity = 1;

  setCart(cart);
  updateCounts();
  renderCart();
}

function removeFromCart(id) {
  cart = getCart();
  cart = cart.filter(i => i.id !== id);
  setCart(cart);
  updateCounts();
  renderCart();
  showToast('Item removed from cart.');
}

function toggleWishlist(id) {
  wishlist = getWishlist();
  const isSaved = wishlist.includes(id);

  if (isSaved) {
    wishlist = wishlist.filter(item => item !== id);
    showToast('Removed from wishlist.');
  } else {
    wishlist.push(id);
    // Initialize default quantity 1 for new wishlist item
    wishlistQuantities = getWishlistQuantities();
    wishlistQuantities[id] = wishlistQuantities[id] || 1;
    setWishlistQuantities(wishlistQuantities);
    
    checkAndUnlockAchievements();
    showToast('Saved to wishlist.');
  }
  setWishlist(wishlist);
  updateCounts();
  renderProducts();
  renderDeals();
}

function moveWishlistToCart(id) {
  wishlistQuantities = getWishlistQuantities();
  const qty = wishlistQuantities[id] || 1;
  
  // Add to cart with full wishlist quantity
  addToCart(id, qty);

  // Remove from wishlist
  wishlist = getWishlist().filter(item => item !== id);
  setWishlist(wishlist);

  delete wishlistQuantities[id];
  setWishlistQuantities(wishlistQuantities);

  updateCounts();
  renderProducts();
  showToast('Moved item from wishlist to cart!');
}

function renderCart() {
  const container = $('#cart-items');
  if (!container) return;

  cart = getCart();
  const items = cart.map(item => ({ ...byId(item.id), quantity: item.quantity })).filter(Boolean);
  if (!items.length) {
    container.innerHTML = '<p class="empty-panel">Your shopping bag is empty.</p>';
    if ($('#cart-subtotal')) $('#cart-subtotal').textContent = currency(0);
    return;
  }

  container.innerHTML = items.map(item => `
    <div class="panel-item">
      <img src="${item.image}" alt="${escapeHTML(item.name)}" />
      <div class="panel-item-info">
        <strong>${escapeHTML(item.name)}</strong>
        <small>${escapeHTML(item.category)}</small>
        <b>${currency(item.price * item.quantity)}</b>
        <div class="qty-control">
          <button data-cart-qty="${item.id}" data-change="-1">−</button>
          <span>${item.quantity}</span>
          <button data-cart-qty="${item.id}" data-change="1">+</button>
        </div>
      </div>
      <button class="panel-remove" data-remove-cart="${item.id}" aria-label="Remove item">×</button>
    </div>
  `).join('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  if ($('#cart-subtotal')) $('#cart-subtotal').textContent = currency(subtotal);
}

/* ----------------------------------------------------
 * 6. LOCATION MANAGER
 * ---------------------------------------------------- */
function initLocation() {
  const loc = getSelectedLocation();
  const label = $('#location-label');
  if (label) {
    label.textContent = `${loc.pin || '400001'} (${loc.name || 'Home'})`;
  }
  const navDeliverTo = $('#nav-deliver-to');
  if (navDeliverTo) {
    // Show the area name or pin if area is not found
    const shortName = loc.area || (loc.pin && loc.pin !== '400001' ? loc.pin : 'India');
    navDeliverTo.textContent = shortName;
  }
}

async function saveLocation(e) {
  e.preventDefault();
  const pin = $('#location-pin').value;
  const name = $('#location-name').value;
  const address = $('#location-address').value;

  // Set default button text to loading state
  const submitBtn = $('#location-form button[type="submit"]');
  const originalText = submitBtn ? submitBtn.textContent : 'Save Location';
  if (submitBtn) submitBtn.textContent = 'Saving...';

  let area = '';
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
    const data = await res.json();
    if (data && data[0] && data[0].Status === 'Success') {
      area = data[0].PostOffice[0].Name;
    }
  } catch (err) {
    console.error('Failed to fetch area for PIN', err);
  }

  if (submitBtn) submitBtn.textContent = originalText;

  const loc = { pin, name, address, area };
  setSelectedLocation(loc);

  if ($('#location-default') && $('#location-default').checked) {
    const addresses = getAddresses();
    addresses.forEach(a => a.isDefault = false);
    addresses.push({ id: `addr-${Date.now()}`, name, pin, address, area, isDefault: true });
    setAddresses(addresses);
  }

  initLocation();
  closeEverything();
  showToast(`Delivery location updated to ${area || pin}`);
}

function bindLocationDetection() {
  const locationPin = $('#location-pin');
  if (!locationPin) return;
  
  locationPin.addEventListener('input', async (e) => {
    const pin = e.target.value.trim();
    if (pin.length === 6 && /^\\d+$/.test(pin)) {
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
        const data = await res.json();
        if (data && data[0] && data[0].Status === 'Success') {
          const area = data[0].PostOffice[0].Name;
          const state = data[0].PostOffice[0].State;
          const currentName = $('#location-name').value;
          if (!currentName || currentName === 'Home, Work, or Office' || currentName.includes(',')) {
             $('#location-name').value = `${area}, ${state}`;
          }
          showToast(`Detected area: ${area}`);
        }
      } catch (err) {
        console.error('Failed to fetch area for PIN', err);
      }
    }
  });
}

/* ----------------------------------------------------
 * 7. ENHANCED LOCAL CHATBOT ASSISTANT
 * ---------------------------------------------------- */
function injectChatbotIfNeeded() {
  if (document.querySelector('.chatbot')) return;

  const chatbotHtml = `
  <div class="chatbot" aria-live="polite">
    <button class="chat-launcher" id="chat-launcher" aria-expanded="false" aria-controls="chat-panel">
      <span></span><b>Assistant</b>
    </button>
    <section class="chat-panel" id="chat-panel" aria-hidden="true" aria-label="NovaTech Assistant">
      <header>
        <div>
          <h2>Nova Assistant</h2>
          <span class="chat-status" id="chat-status"> Local Assistant Active</span>
          <p>Instant answers & product suggestions</p>
        </div>
        <div>
          <button class="chat-icon" id="chat-settings-toggle" aria-label="Chat Settings" title="Configure Gemini API Key"></button>
          <button class="chat-icon" data-clear-chat aria-label="Clear chat" title="Clear chat history"></button>
          <button class="chat-icon" data-close-chat aria-label="Close chat">×</button>
        </div>
      </header>
      <div class="chat-settings" id="chat-settings" style="display: none; padding: 12px; background: var(--surface); border-bottom: 1px solid var(--line); font-size: 11px; flex-direction: column; gap: 6px;">
        <label for="gemini-api-key" style="display: block; font-weight: 600; color: var(--ink);">Google Gemini API Key:</label>
        <div style="display: flex; gap: 8px;">
          <input type="password" id="gemini-api-key" placeholder="AIzaSy..." style="flex: 1; padding: 6px 10px; border: 1px solid var(--line); border-radius: 6px; font-size: 11px; background: var(--white); color: var(--ink); outline: none;" />
          <button id="save-api-key-btn" style="padding: 6px 12px; background: var(--lime); color: #000; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; transition: background-color 0.2s;">Save</button>
        </div>
        <p style="margin: 0; color: var(--soft-ink); font-size: 9px; line-height: 1.3;">API keys are stored locally in your browser. Get a free key from <a href="https://aistudio.google.com/" target="_blank" rel="noopener" style="text-decoration: underline; color: var(--ink); font-weight: 600;">Google AI Studio</a>.</p>
      </div>
      <div class="chat-messages" id="chat-messages"></div>
      <div class="chat-suggestions" id="chat-suggestions">
        <button>Show me deals</button>
        <button>Show me audio products</button>
        <button>What is the cheapest product?</button>
        <button>How does rewards work?</button>
        <button>What is your return policy?</button>
      </div>
      <form class="chat-form" id="chat-form">
        <label class="sr-only" for="chat-input">Ask Nova assistant</label>
        <input id="chat-input" autocomplete="off" placeholder="Ask about products, orders or rewards..." required />
        <button type="submit" aria-label="Send message"></button>
      </form>
    </section>
  </div>
  `;
  document.body.insertAdjacentHTML('beforeend', chatbotHtml);
}

let chatHistory = Storage.get('novatech-chat', [
  { sender: 'bot', text: 'Hello! I am your NovaTech Assistant. Ask me about products, deals, prices, shipping, or rewards!' }
]);

function formatChatResponse(text) {
  let html = escapeHTML(text);
  // Replace bold markdown **text** with <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Replace list items (*, -, •) with a clean bullet point, keeping indentation in mind
  html = html.replace(/^\s*[\*\-\u2022]\s+(.*)$/gm, '• $1');
  // Convert markdown links [Link Text](URL) into active hyperlinks
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: var(--lime); text-decoration: underline;">$1</a>');
  // Replace newlines with <br/>
  html = html.replace(/\n/g, '<br/>');
  return html;
}

async function callGeminiAPI(userMessage, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  
  const formattedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    price: `₹${p.price.toLocaleString('en-IN')}`,
    category: p.category,
    rating: p.rating,
    inStock: p.inStock
  }));

  const userCart = typeof getCart === 'function' ? getCart() : [];
  const userLocation = typeof getSelectedLocation === 'function' ? getSelectedLocation() : { pin: '', name: '', address: '' };
  const userProfile = typeof getProfile === 'function' ? getProfile() : { name: '', email: '' };
  const userOrders = typeof getOrders === 'function' ? getOrders() : [];
  const userRewards = typeof getRewards === 'function' ? getRewards() : { points: 0, unlockedAchievements: [] };

  const formattedCart = userCart.map(item => `${item.name} (Qty: ${item.quantity}, Price: ₹${item.price.toLocaleString('en-IN')})`).join(', ') || 'Empty';
  const formattedLocation = `${userLocation.name || 'Default'} - ${userLocation.address || ''} (PIN: ${userLocation.pin || ''})`;
  const formattedRewards = `${userRewards.points} points. Unlocked achievements: ${(userRewards.unlockedAchievements || []).join(', ')}`;
  const formattedOrders = userOrders.map(o => `Order #${o.id} on ${o.date} - Total: ₹${o.total.toLocaleString('en-IN')}, Status: ${o.status}`).join('; ') || 'No orders yet';

  const systemInstruction = `You are the NovaTech Assistant, an expert AI chatbot for NovaTech (a premium electronics store).
You must help the user answer their questions.

Current Session Info:
- User Profile: Name: "${userProfile.name || 'Guest'}", Email: "${userProfile.email || 'N/A'}"
- Delivery Address: ${formattedLocation}
- Reward Points: ${formattedRewards}
- Current Shopping Cart: ${formattedCart}
- Order History: ${formattedOrders}

Available store products:
${JSON.stringify(formattedProducts, null, 2)}

Store Policies:
- 14-day easy return policy on verified hardware.
- 2-year warranty on all products.
- Express shipping dispatched in 48 hours.

Answer rules:
- Be polite, concise, and helpful.
- Suggest 1 to 3 relevant products from the list if the user asks for suggestions or items.
- Mention product details exactly as listed. Always use the exact product Name or ID (e.g. "nova-x1") in your response when recommending or discussing products so they can be parsed and linked.
- Respond in the language of the user's query if they ask in Hindi/Punjabi/etc.`;

  // Build the content history array
  const contents = [];
  chatHistory.forEach(msg => {
    if (msg.sender === 'user') {
      contents.push({ role: 'user', parts: [{ text: msg.text }] });
    } else if (msg.sender === 'bot') {
      contents.push({ role: 'model', parts: [{ text: msg.text }] });
    }
  });

  // Ensure Gemini API history starts with 'user'
  while (contents.length > 0 && contents[0].role === 'model') {
    contents.shift();
  }

  // If chatHistory mapping is empty, push the current user message
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: userMessage }] });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      }
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `HTTP status ${response.status}`);
  }

  const data = await response.json();
  const botText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!botText) throw new Error('Empty response from Gemini.');
  
  const suggestedProducts = [];
  const lowercaseText = botText.toLowerCase();
  products.forEach(p => {
    if (lowercaseText.includes(p.id.toLowerCase()) || lowercaseText.includes(p.name.toLowerCase())) {
      if (!suggestedProducts.some(sp => sp.id === p.id)) {
        suggestedProducts.push(p);
      }
    }
  });

  return { text: botText, products: suggestedProducts.slice(0, 3) };
}

function renderChat() {
  const messagesEl = $('#chat-messages');
  if (!messagesEl) return;

  messagesEl.innerHTML = chatHistory.map(msg => {
    const formattedText = msg.sender === 'bot' ? formatChatResponse(msg.text) : escapeHTML(msg.text);
    return `
      <div class="chat-msg ${msg.sender}">
        <p>${formattedText}</p>
        ${msg.products ? `
          <div class="chat-msg-cards">
            ${msg.products.map(p => `
              <a href="product.html?id=${p.id}" class="chat-product-chip">
                <img src="${p.image}" alt="${escapeHTML(p.name)}" />
                <div>
                  <strong>${escapeHTML(p.name)}</strong>
                  <span>${currency(p.price)} ·  ${p.rating}</span>
                </div>
              </a>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function handleChatMessage(query) {
  const text = query.trim();
  if (!text) return;

  chatHistory.push({ sender: 'user', text });
  renderChat();
  Storage.set('novatech-chat', chatHistory);

  const messagesEl = $('#chat-messages');
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-msg bot';
  typingEl.innerHTML = '<em>Consulting Nova Assistant...</em>';
  messagesEl.appendChild(typingEl);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  const apiKey = localStorage.getItem('gemini-api-key');

  if (apiKey) {
    callGeminiAPI(text, apiKey)
      .then(result => {
        typingEl.remove();
        chatHistory.push({ sender: 'bot', text: result.text, products: result.products });
        Storage.set('novatech-chat', chatHistory);
        renderChat();
      })
      .catch(err => {
        typingEl.remove();
        console.error(err);
        chatHistory.push({ 
          sender: 'bot', 
          text: `Gemini API Error: ${err.message}. Please check your API key in settings () or try again.` 
        });
        Storage.set('novatech-chat', chatHistory);
        renderChat();
      });
  } else {
    setTimeout(() => {
      typingEl.remove();
      const botResponse = generateBotResponse(text);
      chatHistory.push({ 
        sender: 'bot', 
        text: botResponse.text + "\n\n*(Note: Using local assistant fallback. Configure a Gemini API key in settings for live AI answers)*", 
        products: botResponse.products 
      });
      Storage.set('novatech-chat', chatHistory);
      renderChat();
    }, 600);
  }
}

function initChatSettings() {
  const settingsToggle = $('#chat-settings-toggle');
  const settingsPanel = $('#chat-settings');
  const saveBtn = $('#save-api-key-btn');
  const apiKeyInput = $('#gemini-api-key');
  const statusLabel = $('#chat-status');

  if (!settingsToggle || !settingsPanel || !saveBtn || !apiKeyInput) return;

  const savedKey = localStorage.getItem('gemini-api-key');
  if (savedKey) {
    apiKeyInput.value = savedKey;
    if (statusLabel) {
      statusLabel.textContent = ' Gemini AI Active';
      statusLabel.style.color = '#d9ff3e';
    }
  }

  settingsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = settingsPanel.style.display === 'none';
    settingsPanel.style.display = isHidden ? 'flex' : 'none';
  });

  saveBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const key = apiKeyInput.value.trim();
    if (key) {
      localStorage.setItem('gemini-api-key', key);
      showToast('Gemini API key saved successfully.');
      if (statusLabel) {
        statusLabel.textContent = ' Gemini AI Active';
        statusLabel.style.color = '#d9ff3e';
      }
    } else {
      localStorage.removeItem('gemini-api-key');
      showToast('Gemini API key removed. Using local fallback.');
      if (statusLabel) {
        statusLabel.textContent = ' Local Assistant Active';
        statusLabel.style.color = '';
      }
    }
    settingsPanel.style.display = 'none';
  });
}


function generateBotResponse(q) {
  const query = q.toLowerCase();

  // Price match query e.g. "under 10000" or "under ₹5000"
  const priceMatch = query.match(/under\s*(?:₹|rs\.?|inr)?\s*(\d+)/i);
  const maxPrice = priceMatch ? parseInt(priceMatch[1], 10) : null;

  if (query.includes('audio') || query.includes('headphone') || query.includes('speaker') || query.includes('earbud')) {
    let matches = products.filter(p => p.category === 'Audio');
    if (maxPrice) matches = matches.filter(p => p.price <= maxPrice);
    return { text: `Here are our recommended Audio products${maxPrice ? ' under ' + currency(maxPrice) : ''}:`, products: matches.slice(0, 3) };
  }

  if (query.includes('phone') || query.includes('mobile') || query.includes('smartwatch')) {
    let matches = products.filter(p => p.category === 'Mobile');
    if (maxPrice) matches = matches.filter(p => p.price <= maxPrice);
    return { text: `Here are our Mobile products${maxPrice ? ' under ' + currency(maxPrice) : ''}:`, products: matches.slice(0, 3) };
  }

  if (query.includes('deal') || query.includes('offer') || query.includes('discount')) {
    const matches = products.filter(p => p.deal || (p.discount && p.discount >= 20)).slice(0, 3);
    return { text: 'Check out these featured deals on sale right now:', products: matches };
  }

  if (query.includes('cheapest') || query.includes('lowest price')) {
    const sorted = [...products].sort((a, b) => a.price - b.price).slice(0, 3);
    return { text: 'Our most affordable tech items are:', products: sorted };
  }

  if (query.includes('most expensive') || query.includes('flagship') || query.includes('premium')) {
    const sorted = [...products].sort((a, b) => b.price - a.price).slice(0, 3);
    return { text: 'Here are our top-tier flagship electronics:', products: sorted };
  }

  if (query.includes('return') || query.includes('refund') || query.includes('exchange')) {
    return { text: 'NovaTech offers a 14-day easy return policy on all verified hardware. You can initiate returns from My Account  Returns & Orders.' };
  }

  if (query.includes('payment') || query.includes('pay') || query.includes('upi') || query.includes('card') || query.includes('cod')) {
    return { text: 'We support UPI (GPay, PhonePe, Paytm), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, EMI, and Cash on Delivery (COD).' };
  }

  if (query.includes('reward') || query.includes('point') || query.includes('achievement')) {
    return { text: 'You earn NovaTech reward points on account setup (+100 pts), adding items to wishlist (+20 pts), and 10% cashback points on all completed orders!' };
  }

  if (query.includes('wishlist')) {
    return { text: 'You can view and manage your saved products anytime on our dedicated Wishlist page or side drawer panel.' };
  }

  if (query.includes('address') || query.includes('location')) {
    return { text: 'You can update your delivery PIN and address from the "Deliver to" selector in the header or under My Account  Addresses.' };
  }

  if (query.includes('order') || query.includes('track')) {
    return { text: 'You can track active order status and shipment progress under Returns & Orders in your Account menu.' };
  }

  if (query.includes('contact') || query.includes('support')) {
    return { text: 'Reach customer support at support@novatech.demo or via the contact form in the site footer.' };
  }

  // General term matching
  let keywordMatches = products.filter(p => 
    p.name.toLowerCase().includes(query) || 
    p.category.toLowerCase().includes(query) ||
    (p.tags && p.tags.some(t => t.toLowerCase().includes(query)))
  );
  if (maxPrice) keywordMatches = keywordMatches.filter(p => p.price <= maxPrice);

  if (keywordMatches.length) {
    return { text: `Found ${keywordMatches.length} products matching "${q}":`, products: keywordMatches.slice(0, 3) };
  }

  return { text: 'I am here to help! Try asking for "audio products", "deals", "headphones under ₹10000", or "what is your return policy?".' };
}

/* ----------------------------------------------------
 * 8. SEARCH & MODAL ENGINE
 * ---------------------------------------------------- */
function handleSearchInput(query) {
  const q = query.trim().toLowerCase();
  const resultsContainer = $('#search-results');
  if (!resultsContainer) return;

  if (!q) {
    resultsContainer.innerHTML = '<p class="muted">Popular: headphones, monitors, watches, powerbank</p>';
    return;
  }

  const results = products.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    p.brand.toLowerCase().includes(q) ||
    p.description.toLowerCase().includes(q) ||
    (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
  );

  if (!results.length) {
    resultsContainer.innerHTML = '<p class="muted">No matching products found. Try searching for “OLED” or “wireless”.</p>';
    return;
  }

  resultsContainer.innerHTML = results.slice(0, 6).map(p => `
    <a class="search-result" href="product.html?id=${p.id}">
      <img src="${p.image}" alt="${escapeHTML(p.name)}" />
      <div>
        <strong>${escapeHTML(p.name)}</strong>
        <small>${escapeHTML(p.category)} ·  ${p.rating}</small>
      </div>
      <b>${currency(p.price)}</b>
    </a>
  `).join('');
}

function openModal(id) {
  closeEverything();
  const modal = $(`#${id}`);
  if (modal) {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    if ($('#overlay')) $('#overlay').classList.add('active');
    document.body.classList.add('locked');
  }
}

function openPanel(id) {
  closeEverything();
  const panel = $(`#${id}`);
  if (panel) {
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
    if ($('#overlay')) $('#overlay').classList.add('active');
    document.body.classList.add('locked');
  }
}

function closeEverything() {
  $$('.modal.active, .side-panel.active').forEach(el => {
    el.classList.remove('active');
    el.setAttribute('aria-hidden', 'true');
  });
  $$('[data-open-all-menu]').forEach(el => el.classList.remove('active'));
  if ($('#overlay')) $('#overlay').classList.remove('active');
  document.body.classList.remove('locked');

  const nav = $('#secondary-nav-links') || $('#nav-links');
  if (nav && nav.classList.contains('open')) {
    nav.classList.remove('open');
    if ($('.mobile-toggle')) $('.mobile-toggle').setAttribute('aria-expanded', 'false');
  }
}

function generateSecurePassword(length = 16) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_-+=';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function showToast(msg) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function observeReveals(scope = document) {
  if (!window.IntersectionObserver) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  const elements = scope.matches?.('[data-reveal]') ? [scope] : [...scope.querySelectorAll('[data-reveal]')];
  elements.forEach(el => observer.observe(el));
}

function initDealCountdown() {
  const hrsEl = $('#countdown-hrs');
  const minEl = $('#countdown-min');
  const secEl = $('#countdown-sec');
  if (!hrsEl || !minEl || !secEl) return;

  // Deal expires at the end of the current calendar day, and rolls over
  // automatically to the next day once it hits zero — always live.
  function getDealEnd() {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return end;
  }

  let dealEnd = getDealEnd();

  function tick() {
    let remaining = dealEnd.getTime() - Date.now();

    if (remaining <= 0) {
      dealEnd = getDealEnd();
      dealEnd.setDate(dealEnd.getDate() + 1);
      remaining = dealEnd.getTime() - Date.now();
    }

    const hrs = Math.floor(remaining / 3600000);
    const min = Math.floor((remaining % 3600000) / 60000);
    const sec = Math.floor((remaining % 60000) / 1000);

    hrsEl.textContent = String(hrs).padStart(2, '0');
    minEl.textContent = String(min).padStart(2, '0');
    secEl.textContent = String(sec).padStart(2, '0');
  }

  tick();
  setInterval(tick, 1000);
}

/* ----------------------------------------------------
 * 9. DOM INITIALIZATION & CLEAN DELEGATED EVENTS
 * ---------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  injectChatbotIfNeeded();
  initTheme();
  initLocation();
  updateCounts();
  populateCategoryDrawer();
  renderDeals();
  renderProducts();
  renderCart();
  renderChat();
  initChatSettings();
  initDealCountdown();
  bindLocationDetection();

  // Search input binding
  const searchInput = $('#search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => handleSearchInput(e.target.value));
  }

  // Catalog Toolbar Select Bindings
  const catSelect = $('#category-filter');
  if (catSelect) {
    catSelect.innerHTML = NOVATECH_CATEGORIES.map(c => `<option value="${c === 'All Categories' ? 'All' : c}">${c}</option>`).join('');
    catSelect.addEventListener('change', e => {
      activeCategory = e.target.value;
      renderedCount = 8;
      renderProducts();
    });
  }

  if ($('#price-filter')) $('#price-filter').addEventListener('change', e => { activePrice = e.target.value; renderProducts(); });
  if ($('#rating-filter')) $('#rating-filter').addEventListener('change', e => { activeRating = e.target.value; renderProducts(); });
  if ($('#stock-filter')) $('#stock-filter').addEventListener('change', e => { activeStock = e.target.value; renderProducts(); });
  if ($('#deal-filter')) $('#deal-filter').addEventListener('change', e => { dealOnly = e.target.checked; renderProducts(); });
  if ($('#sort-filter')) $('#sort-filter').addEventListener('change', e => { activeSort = e.target.value; renderProducts(); });
  if ($('#clear-filters')) $('#clear-filters').addEventListener('click', resetFilters);
  if ($('#load-more')) $('#load-more').addEventListener('click', () => { renderedCount += 4; renderProducts(); });

  // Location Form
  if ($('#location-form')) $('#location-form').addEventListener('submit', saveLocation);

  // Chat Form
  if ($('#chat-form')) {
    $('#chat-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = $('#chat-input');
      handleChatMessage(input.value);
      input.value = '';
    });
  }

  // Inject Amazon-style All menu drawer
  injectAllMenu();

  // Handle category from URL parameter (e.g. index.html?category=Smart%20Home)
  const urlParams = new URLSearchParams(window.location.search);
  const catParam = urlParams.get('category');
  if (catParam) {
    if (typeof selectCategoryFromSidebar === 'function') {
      setTimeout(() => {
        selectCategoryFromSidebar(catParam);
      }, 100);
    }
  }
});

// Single Delegated Click Listener (Prevents Double Triggers)
document.addEventListener('click', e => {
  if (e.target.id === 'overlay') {
    closeEverything();
    return;
  }
  const target = e.target.closest('button, a');
  if (!target) return;

  if (target.matches('[data-open-all-menu]')) {
    openPanel('all-menu-panel');
    target.classList.add('active');
  }
  if (target.matches('[data-close-all-menu]')) {
    closeEverything();
  }
  if (target.matches('.all-menu-item')) {
    const action = target.dataset.action;
    const cat = target.dataset.category;

    if (action === 'select-category' && cat) {
      if (typeof selectCategoryFromSidebar === 'function' && document.getElementById('shop')) {
        selectCategoryFromSidebar(cat);
      } else {
        window.location.href = `index.html?category=${encodeURIComponent(cat)}`;
      }
    } else if (action === 'open-categories') {
      closeEverything();
      openPanel('category-panel');
    } else if (action === 'music') {
      if (typeof selectCategoryFromSidebar === 'function' && document.getElementById('shop')) {
        selectCategoryFromSidebar('Audio');
      } else {
        window.location.href = `index.html?category=Audio`;
      }
    } else if (action === 'kindle') {
      window.location.href = `search.html?q=tablet`;
    } else if (action === 'appstore') {
      showToast('NovaTech Appstore coming soon!');
      closeEverything();
    } else if (action === 'giftcards') {
      showToast('NovaTech Gift Cards coming soon!');
      closeEverything();
    } else if (action === 'shop-interest') {
      if (document.getElementById('shop')) {
        document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
        closeEverything();
      } else {
        window.location.href = `index.html#shop`;
      }
    }
  }

  if (target.matches('.password-generator-btn')) {
    const inputId = target.dataset.generatePassword;
    const input = inputId ? document.getElementById(inputId) : null;
    if (input) {
      input.value = generateSecurePassword();
      input.focus();
      showToast('Secure password generated.');
    }
  }
  if (target.matches('.theme-toggle-btn') || target.matches('#theme-toggle')) {
    toggleTheme(e);
  }
  if (target.matches('[data-open-categories]')) { populateCategoryDrawer(); openPanel('category-panel'); }
  if (target.matches('[data-select-category]')) selectCategoryFromSidebar(target.dataset.selectCategory);
  if (target.matches('[data-open-cart]')) { renderCart(); openPanel('cart-panel'); }
  if (target.matches('[data-open-location]')) openPanel('location-panel');
  if (target.matches('[data-open-search]')) openModal('search-modal');
  if (target.matches('[data-close-modal], [data-close-panel]')) closeEverything();
  
  if (target.matches('.add-to-cart')) addToCart(target.dataset.product);
  if (target.matches('.wishlist-btn')) toggleWishlist(target.dataset.product);
  if (target.matches('[data-remove-cart]')) removeFromCart(target.dataset.removeCart);
  
  if (target.matches('[data-cart-qty]')) {
    updateCartQuantity(target.dataset.cartQty, parseInt(target.dataset.change, 10));
  }

  if (target.matches('#chat-launcher')) {
    const panel = $('#chat-panel');
    if (panel) panel.classList.toggle('active');
  }
  if (target.matches('[data-close-chat]')) {
    const panel = $('#chat-panel');
    if (panel) panel.classList.remove('active');
  }
  if (target.matches('[data-clear-chat]')) {
    chatHistory = [{ sender: 'bot', text: 'Chat history cleared. How can I assist you today?' }];
    Storage.set('novatech-chat', chatHistory);
    renderChat();
  }

  if (target.parentElement && target.parentElement.id === 'chat-suggestions') {
    handleChatMessage(target.textContent);
  }

  if (target.matches('.mobile-toggle')) {
    const nav = $('#secondary-nav-links') || $('#nav-links');
    if (nav) {
      nav.classList.toggle('open');
      target.setAttribute('aria-expanded', nav.classList.contains('open'));
    }
  }
});

// Keyboard Esc Listener
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeEverything();
});

// New navbar's inline search form — redirect to the search results page
const navSearchForm = $('#nav-search-form');
if (navSearchForm) {
  navSearchForm.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#nav-search-input');
    const q = input ? input.value.trim() : '';
    const catSelect = $('#nav-search-cat');
    const cat = catSelect ? catSelect.value : 'All';
    if (q) {
      const params = new URLSearchParams({ q });
      if (cat && cat !== 'All') params.set('cat', cat);
      window.location.href = `search.html?${params.toString()}`;
    }
  });
}

/* ----------------------------------------------------
 * 10. AMAZON-STYLE "ALL" DRAWER INJECTION
 * ---------------------------------------------------- */
function injectAllMenu() {
  if (document.getElementById('all-menu-panel')) return;

  const allMenuHtml = `
    <aside class="side-panel panel-left all-menu-drawer" id="all-menu-panel" aria-hidden="true" aria-label="Main menu">
      <div class="all-menu-header">
        <a href="account.html" class="all-menu-profile-link">
          <div class="all-menu-profile">
            <svg class="all-menu-avatar" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span id="all-menu-username">Hello, sign in</span>
          </div>
        </a>
        <button class="all-menu-close-btn" data-close-all-menu aria-label="Close menu">×</button>
      </div>
      <div class="all-menu-body">
        <div class="all-menu-section">
          <h3 class="all-menu-section-title">Shop by Department</h3>
          <button class="all-menu-item" data-action="select-category" data-category="TVs & Displays">
            <span>Electronics</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <button class="all-menu-item" data-action="select-category" data-category="Computing">
            <span>Computers</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <button class="all-menu-item" data-action="select-category" data-category="Smart Home">
            <span>Smart Home</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <button class="all-menu-item" data-action="select-category" data-category="Accessories">
            <span>Arts & Crafts</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <button class="all-menu-item" data-action="open-categories">
            <span>See all <span style="font-size: 10px; opacity: 0.8; margin-left: 2px;">▼</span></span>
          </button>
        </div>
        <div class="all-menu-section">
          <h3 class="all-menu-section-title">Programs & Features</h3>
          <button class="all-menu-item" data-action="giftcards">
            <span>Gift Cards</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          <button class="all-menu-item" data-action="shop-interest">
            <span>Shop By Interest</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <div class="all-menu-section">
          <h3 class="all-menu-section-title">Help & Settings</h3>
          <a href="account.html" class="all-menu-item">
            <span>Your Account</span>
          </a>
          <a href="policies.html?policy=faq" class="all-menu-item">
            <span>Customer Service</span>
          </a>
          <a href="account.html" class="all-menu-item">
            <span>Sign in</span>
          </a>
        </div>
      </div>
    </aside>
  `;

  document.body.insertAdjacentHTML('beforeend', allMenuHtml);
  updateAllMenuProfile();
}

function updateAllMenuProfile() {
  const usernameEl = document.getElementById('all-menu-username');
  if (!usernameEl) return;
  const profile = typeof getProfile === 'function' ? getProfile() : null;
  if (profile && profile.name) {
    usernameEl.textContent = `Hello, ${profile.name}`;
  } else {
    usernameEl.textContent = 'Hello, sign in';
  }
}
