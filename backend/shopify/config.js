import dotenv from 'dotenv';

dotenv.config();

const {
  SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  SHOPIFY_ADMIN_ACCESS_TOKEN,
  SHOPIFY_API_VERSION = '2025-01',
  SHOPIFY_WEBHOOK_SECRET,
  SHOPIFY_ENABLED,
} = process.env;

export const shopifyConfig = {
  storeDomain: SHOPIFY_STORE_DOMAIN?.replace(/^https?:\/\//, '').replace(/\/$/, ''),
  storefrontAccessToken: SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  adminAccessToken: SHOPIFY_ADMIN_ACCESS_TOKEN,
  apiVersion: SHOPIFY_API_VERSION,
  webhookSecret: SHOPIFY_WEBHOOK_SECRET,
  enabled:
    SHOPIFY_ENABLED === 'true' ||
    Boolean(SHOPIFY_STORE_DOMAIN && SHOPIFY_STOREFRONT_ACCESS_TOKEN),
};

export function assertStorefrontConfigured() {
  if (!shopifyConfig.storeDomain || !shopifyConfig.storefrontAccessToken) {
    const error = new Error(
      'Shopify Storefront is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.'
    );
    error.status = 503;
    throw error;
  }
}

export function assertAdminConfigured() {
  if (!shopifyConfig.storeDomain || !shopifyConfig.adminAccessToken) {
    const error = new Error(
      'Shopify Admin is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_ACCESS_TOKEN.'
    );
    error.status = 503;
    throw error;
  }
}
