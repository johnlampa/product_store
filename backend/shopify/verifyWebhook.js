import crypto from 'crypto';
import { shopifyConfig } from './config.js';

export function verifyShopifyWebhook(rawBody, hmacHeader) {
  if (!shopifyConfig.webhookSecret) {
    const error = new Error(
      'SHOPIFY_WEBHOOK_SECRET is not configured. Cannot verify webhooks.'
    );
    error.status = 503;
    throw error;
  }

  if (!hmacHeader) {
    return false;
  }

  const digest = crypto
    .createHmac('sha256', shopifyConfig.webhookSecret)
    .update(rawBody)
    .digest('base64');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, 'utf8'),
      Buffer.from(hmacHeader, 'utf8')
    );
  } catch {
    return false;
  }
}
