import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import productRoutes from './routes/productRoutes.js';
import shopifyRoutes from './routes/shopifyRoutes.js';
import { handleShopifyWebhook } from './controllers/shopifyController.js';
import { sql } from './config/db.js';
import { aj } from './lib/arcjet.js';
import { shopifyConfig } from './shopify/config.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);
app.use(morgan('dev'));

// Shopify webhooks need the raw body for HMAC verification — mount before JSON parser
app.post(
  '/api/shopify/webhooks',
  express.raw({ type: 'application/json' }),
  (req, _res, next) => {
    req.rawBody = req.body;
    next();
  },
  handleShopifyWebhook
);

app.use(express.json());

app.use(async (req, res, next) => {
  // Webhooks are verified via HMAC; skip Arcjet bot checks for that path
  if (req.path.startsWith('/api/shopify/webhooks')) {
    return next();
  }

  try {
    const decision = await aj.protect(req, {
      requested: 1,
    });

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        res.status(429).json({ error: 'Too Many Requests' });
      } else if (decision.reason.isBot()) {
        res.status(403).json({ error: 'Bot Access Denied' });
      } else {
        res.status(403).json({ error: 'Forbidden' });
      }
      return;
    }

    if (
      decision.results.some(
        (result) => result.reason.isBot() && result.reason.isSpoofed()
      )
    ) {
      res.status(403).json({ error: 'Spoofed bot detected' });
      return;
    }

    next();
  } catch (error) {
    console.error('Arcjet error:', error);
    next(error);
  }
});

app.use('/api/products', productRoutes);
app.use('/api/shopify', shopifyRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/frontend/dist')));

  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(path.resolve(__dirname, 'frontend', 'dist', 'index.html'));
      return;
    }
    next();
  });
}

async function initDB() {
  try {
    await sql`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS shopify_products (
            id SERIAL PRIMARY KEY,
            shopify_id VARCHAR(255) UNIQUE NOT NULL,
            handle VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL DEFAULT 0,
            image TEXT,
            status VARCHAR(50) DEFAULT 'ACTIVE',
            synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    await sql`
        CREATE TABLE IF NOT EXISTS shopify_webhook_events (
            id SERIAL PRIMARY KEY,
            topic VARCHAR(100) NOT NULL,
            shop VARCHAR(255),
            payload JSONB NOT NULL,
            received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;

    console.log('Database initialized successfully');
    if (shopifyConfig.enabled) {
      console.log(`Shopify enabled for store: ${shopifyConfig.storeDomain}`);
    } else {
      console.log(
        'Shopify is not fully configured. Local inventory still works. See SHOPIFY.md'
      );
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
