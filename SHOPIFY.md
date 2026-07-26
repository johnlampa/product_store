# Shopify Integration

Notes on the headless Shopify layer that sits on top of the PERN app.

## Endpoints

| Piece | Path / endpoint | Purpose |
|--------|------------------|---------|
| Storefront products | `GET /api/shopify/products` | Live catalog from Shopify |
| Product detail | `GET /api/shopify/products/:handle` | Single product + variants |
| Cart CRUD | `/api/shopify/cart*` | Cart create / add / update / remove |
| Checkout | Cart `checkoutUrl` | Redirects to Shopify-hosted checkout |
| Admin sync | `POST /api/shopify/sync` | Pulls products into Postgres `shopify_products` |
| Webhooks | `POST /api/shopify/webhooks` | HMAC-verified product updates into Postgres |
| Status | `GET /api/shopify/status` | Shows which credentials are configured |
| Shop UI | `/shop`, `/shop/:handle` | React storefront + cart drawer |
| Local inventory | `/` | Postgres CRUD |

## Shopify account setup

Before any of this runs you need a store and API credentials:

1. Create a Shopify Partner account at [partners.shopify.com](https://partners.shopify.com)
2. Create a development store (Partner Dashboard, Stores, Add store)
3. Create a custom app on that store (Settings, Apps and sales channels, Develop apps)
4. Generate API credentials and put them in `.env` (see below)
5. Add products in Shopify Admin so `/shop` has something to show
6. Expose the server publicly (e.g. ngrok) to receive webhooks locally
7. Register webhooks in the custom app pointing at the public URL
8. Deploy with real env vars on the host (Render, Railway, etc.)

---

## Setup steps

### 1. Copy env vars

```bash
cp .env.example .env
```

Fill in the Postgres + Arcjet values, then Shopify:

```env
SHOPIFY_ENABLED=true
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_API_VERSION=2025-01
SHOPIFY_STOREFRONT_ACCESS_TOKEN=shpat_or_shps_...
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret
```

### 2. Custom app scopes

In Shopify Admin, **Develop apps**, your app, **Configuration**:

**Storefront API** (enable Storefront API access):
- `unauthenticated_read_product_listings`
- `unauthenticated_read_product_inventory`
- `unauthenticated_write_checkouts` / cart scopes as shown in the Storefront API checklist

**Admin API** (for sync + webhooks):
- `read_products`
- `write_products` (optional)
- `read_orders` (optional, if order webhooks get added later)

Install the app on the store, then copy:
- **Storefront API** public access token into `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- **Admin API** access token into `SHOPIFY_ADMIN_ACCESS_TOKEN`

### 3. Run the app

```bash
# terminal 1, API
npm run dev

# terminal 2, React
cd frontend && npm run dev
```

Open:
- Local inventory: `http://localhost:5173/`
- Shopify shop: `http://localhost:5173/shop`

### 4. Webhooks (optional)

1. Start a tunnel, e.g. `ngrok http 3000`
2. In the custom app, under **Webhooks**, subscribe to:
   - `products/create`
   - `products/update`
   - `products/delete`
3. URL: `https://YOUR-NGROK-URL/api/shopify/webhooks`
4. Copy the signing secret into `SHOPIFY_WEBHOOK_SECRET`

Events are stored in `shopify_webhook_events` and product rows update in `shopify_products`.

### 5. Sync button

On `/shop`, if the Admin API is configured, **Sync to DB** calls `POST /api/shopify/sync` and caches products in Postgres.

---

## Design notes

- BFF pattern: React never talks to Shopify directly, Express proxies Storefront GraphQL
- Cart persisted via a `localStorage` cart id plus the Shopify Cart API
- Checkout is handed off to Shopify, so payments and PCI scope stay on their side
- Admin sync and webhook HMAC verification both write into Neon Postgres
- Dual mode: local CRUD inventory alongside headless Shopify commerce

## Verifying the setup

- `GET http://localhost:3000/api/shopify/status` shows `storefrontConfigured: true`
- `/shop` lists products from the store
- Add to cart opens the drawer with correct totals
- Checkout opens the Shopify checkout URL
- Sync writes rows into `shopify_products`
- Editing a product in Shopify Admin fires a webhook that updates the cache
