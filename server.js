const express = require('express');
const session = require('express-session');
const path = require('path');

const products = [
  {
    id: 'shoe-1',
    name: 'Air Max Pulse',
    brand: 'NIKE',
    category: 'shoes',
    price: 299900,
    original: 349900,
    rating: '4.6 ☆',
    badge: 'Sale',
    primaryImg: 'https://images.unsplash.com/photo-1519741498284-170f5452d0d1?auto=format&fit=crop&w=900&q=80',
    secondaryImg: 'https://images.unsplash.com/photo-1573258506593-3d92f5a88c94?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'shoe-2',
    name: 'Ultraboost Light',
    brand: 'ADIDAS',
    category: 'shoes',
    price: 359900,
    rating: '4.8 ☆',
    primaryImg: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
    secondaryImg: 'https://images.unsplash.com/photo-1528701800489-20a4f9c5f0e7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'shoe-3',
    name: 'RS-X Reinvention',
    brand: 'PUMA',
    category: 'shoes',
    price: 189900,
    original: 229900,
    rating: '4.3 ☆',
    badge: 'Low stock',
    primaryImg: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    secondaryImg: 'https://images.unsplash.com/photo-1528701800489-20a4f9c5f0e7?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'clothes-1',
    name: 'Everyday Hoodie',
    brand: 'LOCAL',
    category: 'clothes',
    price: 119900,
    rating: '4.7 ☆',
    primaryImg: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
    secondaryImg: 'https://images.unsplash.com/photo-1520975912174-bb5ddd7138c3?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'clothes-2',
    name: 'Classic Denim Jacket',
    brand: 'TREND',
    category: 'clothes',
    price: 89900,
    rating: '4.5 ☆',
    primaryImg: 'https://images.unsplash.com/photo-1520975912174-bb5ddd7138c3?auto=format&fit=crop&w=900&q=80',
    secondaryImg: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'watch-1',
    name: 'Heritage Chrono',
    brand: 'SEIKO',
    category: 'watches',
    price: 179900,
    rating: '4.6 ☆',
    badge: 'New',
    primaryImg: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    secondaryImg: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80',
  },
];

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(session({
  secret: 'kigali_shopeasy_secret_change_me',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 24 * 60 * 60 * 1000 },
}));
app.use(express.static(path.join(__dirname, '/')));

function getCart(req) {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  return req.session.cart;
}

function cartSummary(cart) {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { items: cart, totalCount, totalPrice };
}

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/cart', (req, res) => {
  const cart = getCart(req);
  res.json(cartSummary(cart));
});

app.post('/api/cart', (req, res) => {
  const { id, quantity = 1 } = req.body;
  const product = products.find(item => item.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const cart = getCart(req);
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += Number(quantity);
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, quantity: Number(quantity) });
  }

  res.json(cartSummary(cart));
});

app.put('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  const cart = getCart(req);
  const existing = cart.find(item => item.id === id);
  if (!existing) {
    return res.status(404).json({ error: 'Item not in cart' });
  }

  existing.quantity = Number(quantity);
  if (existing.quantity <= 0) {
    req.session.cart = cart.filter(item => item.id !== id);
  }

  res.json(cartSummary(getCart(req)));
});

app.delete('/api/cart/:id', (req, res) => {
  const { id } = req.params;
  req.session.cart = getCart(req).filter(item => item.id !== id);
  res.json(cartSummary(req.session.cart));
});

app.post('/api/checkout', (req, res) => {
  const cart = getCart(req);
  const summary = cartSummary(cart);
  req.session.cart = [];
  res.json({ success: true, ...summary });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Kigali ShopEasy API running on http://localhost:${PORT}`);
  });
}

module.exports = app;
