# JKL Shop

A full-stack e-commerce demo built with the **PERN** stack (PostgreSQL, Express, React, Node), plus a **headless Shopify** storefront for cart and checkout.

**Live demo:** [https://product-store-3r9t.onrender.com](https://product-store-3r9t.onrender.com)

Store password when testing checkout: ```testpassword```

---

## Features

- **Local inventory CRUD**: create, read, update, and delete products stored in Neon Postgres
- **Headless Shopify shop**: live catalog via Storefront API, cart drawer, and Shopify-hosted checkout
- **Admin product sync**: pull Shopify products into Postgres with the Admin API
- **Webhooks**: HMAC-verified product events written to Postgres
- **Security**: Arcjet rate limiting, bot detection, and Helmet headers
- **Theming**: DaisyUI theme switcher with persistent preference

---

## Tech Stack

| Layer | Tech |
|--------|------|
| Frontend | React 19, Vite, Tailwind CSS, DaisyUI, Zustand, React Router, Axios |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL (Neon serverless) |
| Commerce | Shopify Storefront API + Admin API |
| Security | Arcjet, Helmet, CORS |
| Deploy | Render |

---

## Project Structure

```
product_store/
├── backend/
│   ├── config/          # Neon DB connection
│   ├── controllers/     # Product + Shopify handlers
│   ├── routes/          # Express routers
│   ├── shopify/         # GraphQL clients, queries, webhook HMAC
│   ├── lib/             # Arcjet
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/  # Nav, cards, cart drawer, modals
│       ├── pages/       # Inventory + Shopify shop pages
│       └── store/       # Zustand stores
├── .env.example
└── SHOPIFY.md           # Shopify credential setup guide
```

---

## Screens

| Route | Description |
|--------|-------------|
| `/` | Local inventory, Postgres-backed product CRUD |
| `/product/:id` | Edit / delete a local product |
| `/shop` | Shopify storefront catalog |
| `/shop/:handle` | Shopify product detail + add to cart |

---

<details>
<summary><strong>Installation</strong></summary>

### Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) Postgres database
- An [Arcjet](https://arcjet.com) API key
- (Optional) A Shopify development store, see `SHOPIFY.md`

### 1. Clone the repo

```bash
git clone https://github.com/johnlampa/product_store.git
cd product_store
```

### 2. Install dependencies

```bash
npm install
npm install --prefix frontend
```

### 3. Configure environment

```bash
cp .env.example .env
```

Fill in `.env`:

```env
PORT=3000
NODE_ENV=development

PGUSER=
PGPASSWORD=
PGHOST=
PGDATABASE=

ARCJET_KEY=

# Optional: Shopify headless commerce
SHOPIFY_ENABLED=true
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_API_VERSION=2025-01
SHOPIFY_STOREFRONT_ACCESS_TOKEN=
SHOPIFY_ADMIN_ACCESS_TOKEN=
SHOPIFY_WEBHOOK_SECRET=
```

For Shopify scopes, tokens, sync, and webhooks, see [SHOPIFY.md](./SHOPIFY.md).

### 4. Run locally

```bash
# Terminal 1: API (http://localhost:3000)
npm run dev

# Terminal 2: Frontend (http://localhost:5173)
cd frontend && npm run dev
```

### 5. Production build

```bash
npm run build
NODE_ENV=production npm start
```

</details>

---

## API Overview

### Local products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | List products |
| `GET` | `/api/products/:id` | Get one product |
| `POST` | `/api/products` | Create product |
| `PUT` | `/api/products/:id` | Update product |
| `DELETE` | `/api/products/:id` | Delete product |

### Shopify

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/shopify/status` | Credential / config status |
| `GET` | `/api/shopify/products` | Storefront product list |
| `GET` | `/api/shopify/products/:handle` | Product by handle |
| `POST` | `/api/shopify/cart` | Create cart |
| `GET` | `/api/shopify/cart/:cartId` | Get cart |
| `POST` | `/api/shopify/cart/lines` | Add line item |
| `PUT` | `/api/shopify/cart/lines` | Update quantity |
| `DELETE` | `/api/shopify/cart/lines` | Remove line item |
| `POST` | `/api/shopify/sync` | Sync Admin products into Postgres |
| `POST` | `/api/shopify/webhooks` | Shopify webhook receiver |

---

## License

ISC
