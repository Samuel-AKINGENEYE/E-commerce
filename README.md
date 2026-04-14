# Kigali ShopEasy Full Stack Store

A full-stack ecommerce demo with an Express API backend and a dynamic frontend.

## Files
- `index.html` — homepage layout and storefront
- `styles.css` — responsive styling and animations
- `script.js` — frontend API integration and cart behavior
- `server.js` — Express backend with products and cart API
- `package.json` — Node.js dependencies and start script
- `.gitignore` — ignores `node_modules`

## Run locally
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```
3. Open `http://localhost:3000` in your browser.

## Backend API
- `GET /api/products` — lists product catalog
- `GET /api/cart` — returns user cart from session
- `POST /api/cart` — add item to cart
- `PUT /api/cart/:id` — update cart item quantity
- `DELETE /api/cart/:id` — remove item from cart
- `POST /api/checkout` — clear cart and complete order

## Notes
The cart is stored in server session memory for each browser session. This is a demo setup and can be extended to a database or production store later.