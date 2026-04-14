const mobileToggle = document.querySelector('.mobile-menu-toggle');
const navLinks = document.querySelector('.nav-links');
const filterButtons = document.querySelectorAll('.filter-btn');
const productGrid = document.querySelector('#product-grid');
const cartButton = document.querySelector('.cart-button');
const cartBadge = document.querySelector('.cart-badge');
const cartBackdrop = document.querySelector('.cart-backdrop');
const cartDrawer = document.querySelector('.cart-drawer');
const closeCart = document.querySelector('.close-cart');
const cartItemsContainer = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartEmpty = document.querySelector('.cart-empty');
const checkoutButton = document.querySelector('.checkout-btn');

let products = [];
let productCards = [];
let cart = [];

function formatRwf(value) {
  return `RWF ${Number(value).toLocaleString('en-RW')}`;
}

async function fetchProducts() {
  try {
    const response = await fetch('/api/products');
    return response.ok ? response.json() : [];
  } catch (error) {
    console.error('Unable to fetch products:', error);
    return [];
  }
}

async function fetchCart() {
  try {
    const response = await fetch('/api/cart');
    return response.ok ? response.json() : { items: [] };
  } catch (error) {
    console.error('Unable to fetch cart:', error);
    return { items: [] };
  }
}

async function postCartItem(productId, quantity = 1) {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: productId, quantity }),
  });
  return response.ok ? response.json() : null;
}

async function updateCartItem(productId, quantity) {
  const response = await fetch(`/api/cart/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
  });
  return response.ok ? response.json() : null;
}

async function deleteCartItem(productId) {
  const response = await fetch(`/api/cart/${productId}`, {
    method: 'DELETE',
  });
  return response.ok ? response.json() : null;
}

async function checkoutCart() {
  const response = await fetch('/api/checkout', {
    method: 'POST',
  });
  return response.ok ? response.json() : null;
}

function animateCartBadge() {
  if (!cartBadge) return;
  cartBadge.classList.add('bump');
  window.setTimeout(() => cartBadge.classList.remove('bump'), 350);
}

function updateCartBadge() {
  if (!cartBadge) return;
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalCount;
  cartBadge.style.display = totalCount > 0 ? 'inline-flex' : 'none';
}

function ensureImageFallback(img) {
  img.addEventListener('error', () => {
    if (img.dataset.fallback) return;
    img.dataset.fallback = 'true';
    img.src = 'https://via.placeholder.com/900x600?text=Photo+not+available';
  });
}

function renderProducts(data) {
  if (!productGrid) return;

  products = data;

  productGrid.innerHTML = products
    .map(product => {
      const priceText = formatRwf(product.price);
      const original = product.original ? `<span class="original">${formatRwf(product.original)}</span>` : '';
      const badge = product.badge ? `<div class="product-badge">${product.badge}</div>` : '';

      return `
        <article class="product-card" data-category="${product.category}" data-id="${product.id}" data-price="${product.price}" data-name="${product.name}">
          ${badge}
          <div class="product-image">
            <img class="primary-img" loading="lazy" src="${product.primaryImg}" alt="${product.name}" />
            <img class="secondary-img" loading="lazy" src="${product.secondaryImg}" alt="${product.name} alternate" />
          </div>
          <div class="product-copy">
            <p class="product-brand">${product.brand}</p>
            <h3>${product.name}</h3>
            <div class="product-meta">
              <span class="rating">${product.rating}</span>
              <span class="price">${priceText} ${original}</span>
            </div>
          </div>
          <button class="btn btn-add add-to-cart">Add to cart</button>
        </article>
      `;
    })
    .join('');

  productCards = Array.from(productGrid.querySelectorAll('.product-card'));
  productCards.forEach(card => card.classList.add('visible'));
  document.querySelectorAll('img').forEach(ensureImageFallback);
  productGrid.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', async () => {
      const card = button.closest('.product-card');
      if (!card) return;
      const id = card.dataset.id;
      const result = await postCartItem(id);
      if (result) {
        cart = result.items;
        updateCartBadge();
        animateCartBadge();
        renderCart();
        openCart();
      }
    });
  });
}

function renderCart() {
  if (!cartItemsContainer || !cartTotal || !cartEmpty || !checkoutButton) return;

  cartItemsContainer.innerHTML = '';

  if (!cart || cart.length === 0) {
    cartEmpty.classList.remove('hidden');
    cartItemsContainer.classList.add('hidden');
    checkoutButton.disabled = true;
    cartTotal.textContent = formatRwf(0);
    return;
  }

  cartEmpty.classList.add('hidden');
  cartItemsContainer.classList.remove('hidden');
  checkoutButton.disabled = false;

  cart.forEach(item => {
    const entry = document.createElement('div');
    entry.className = 'cart-item';
    entry.innerHTML = `
      <h4>${item.name}</h4>
      <p>${formatRwf(item.price)} × ${item.quantity}</p>
      <div class="cart-item-controls">
        <div class="quantity-controls">
          <button data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button data-action="increase" data-id="${item.id}">+</button>
        </div>
        <button class="btn btn-outline remove-item" data-id="${item.id}">Remove</button>
      </div>
    `;
    cartItemsContainer.appendChild(entry);
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartTotal.textContent = formatRwf(total);
}

function openCart() {
  if (!cartBackdrop || !cartDrawer) return;
  cartDrawer.classList.remove('hidden');
  cartBackdrop.classList.remove('hidden');
  cartDrawer.classList.add('open');
  cartBackdrop.classList.add('open');
  cartDrawer.setAttribute('aria-hidden', 'false');
}

function closeCartDrawer() {
  if (!cartBackdrop || !cartDrawer) return;
  cartDrawer.classList.remove('open');
  cartBackdrop.classList.remove('open');
  cartDrawer.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    if (!cartDrawer.classList.contains('open')) {
      cartDrawer.classList.add('hidden');
      cartBackdrop.classList.add('hidden');
    }
  }, 250);
}

async function handleCartActions(event) {
  const button = event.target.closest('button');
  if (!button) return;
  const id = button.dataset.id;

  if (button.matches('[data-action="increase"]')) {
    const result = await updateCartItem(id, (cart.find(item => item.id === id)?.quantity || 1) + 1);
    if (result) cart = result.items;
  }

  if (button.matches('[data-action="decrease"]')) {
    const result = await updateCartItem(id, (cart.find(item => item.id === id)?.quantity || 1) - 1);
    if (result) cart = result.items;
  }

  if (button.classList.contains('remove-item')) {
    const result = await deleteCartItem(id);
    if (result) cart = result.items;
  }

  updateCartBadge();
  renderCart();
}

function setupFilters() {
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;
      productCards.forEach(card => {
        const category = card.dataset.category;
        card.style.display = filter === 'all' || category === filter ? '' : 'none';
      });
    });
  });
}

function setupSectionReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('section').forEach(section => observer.observe(section));
}

async function init() {
  const productData = await fetchProducts();
  renderProducts(productData);

  const cartData = await fetchCart();
  cart = cartData.items || [];
  updateCartBadge();
  renderCart();

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  }
  if (cartButton) {
    cartButton.addEventListener('click', openCart);
  }
  if (cartBackdrop) {
    cartBackdrop.addEventListener('click', closeCartDrawer);
  }
  if (closeCart) {
    closeCart.addEventListener('click', closeCartDrawer);
  }
  if (cartItemsContainer) {
    cartItemsContainer.addEventListener('click', handleCartActions);
  }
  if (checkoutButton) {
    checkoutButton.addEventListener('click', async () => {
      if (!cart.length) return;
      const result = await checkoutCart();
      if (result) {
        alert(`Thank you for your order! Total: ${formatRwf(result.totalPrice)}`);
        cart = [];
        updateCartBadge();
        renderCart();
        closeCartDrawer();
      }
    });
  }

  setupFilters();
  setupSectionReveal();
}

init();
