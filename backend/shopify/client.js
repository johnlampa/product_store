import { createStorefrontApiClient } from '@shopify/storefront-api-client';
import { createAdminApiClient } from '@shopify/admin-api-client';
import {
  assertAdminConfigured,
  assertStorefrontConfigured,
  shopifyConfig,
} from './config.js';

let storefrontClient;
let adminClient;

export function getStorefrontClient() {
  assertStorefrontConfigured();

  if (!storefrontClient) {
    storefrontClient = createStorefrontApiClient({
      storeDomain: shopifyConfig.storeDomain,
      apiVersion: shopifyConfig.apiVersion,
      publicAccessToken: shopifyConfig.storefrontAccessToken,
    });
  }

  return storefrontClient;
}

export function getAdminClient() {
  assertAdminConfigured();

  if (!adminClient) {
    adminClient = createAdminApiClient({
      storeDomain: shopifyConfig.storeDomain,
      apiVersion: shopifyConfig.apiVersion,
      accessToken: shopifyConfig.adminAccessToken,
    });
  }

  return adminClient;
}

export async function storefrontRequest(query, variables = {}) {
  const client = getStorefrontClient();
  const { data, errors } = await client.request(query, { variables });

  if (errors) {
    const message =
      errors?.message ||
      errors?.graphQLErrors?.[0]?.message ||
      'Shopify Storefront API error';
    const error = new Error(message);
    error.status = 502;
    error.details = errors;
    throw error;
  }

  return data;
}

export async function adminRequest(query, variables = {}) {
  const client = getAdminClient();
  const { data, errors } = await client.request(query, { variables });

  if (errors) {
    const message =
      errors?.message ||
      errors?.graphQLErrors?.[0]?.message ||
      'Shopify Admin API error';
    const error = new Error(message);
    error.status = 502;
    error.details = errors;
    throw error;
  }

  return data;
}
