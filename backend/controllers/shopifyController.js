import { storefrontRequest, adminRequest } from '../shopify/client.js';
import {
  PRODUCTS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  CART_CREATE_MUTATION,
  CART_QUERY,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  ADMIN_PRODUCTS_QUERY,
} from '../shopify/queries.js';
import { mapCart, mapStorefrontProduct, throwUserErrors } from '../shopify/mappers.js';
import { shopifyConfig } from '../shopify/config.js';
import { verifyShopifyWebhook } from '../shopify/verifyWebhook.js';
import { sql } from '../config/db.js';

function handleError(res, error, context) {
  console.error(`Shopify ${context}:`, error.details || error);
  const status = error.status || 500;
  res.status(status).json({
    success: false,
    message: error.message || 'Internal Server Error',
  });
}

export const getShopifyStatus = async (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      enabled: shopifyConfig.enabled,
      storeDomain: shopifyConfig.storeDomain || null,
      apiVersion: shopifyConfig.apiVersion,
      storefrontConfigured: Boolean(
        shopifyConfig.storeDomain && shopifyConfig.storefrontAccessToken
      ),
      adminConfigured: Boolean(
        shopifyConfig.storeDomain && shopifyConfig.adminAccessToken
      ),
      webhookConfigured: Boolean(shopifyConfig.webhookSecret),
    },
  });
};

export const getShopifyProducts = async (req, res) => {
  try {
    const first = Math.min(Number(req.query.limit) || 20, 50);
    const data = await storefrontRequest(PRODUCTS_QUERY, { first });
    const products =
      data.products?.edges?.map((edge) => mapStorefrontProduct(edge.node)) || [];

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    handleError(res, error, 'getShopifyProducts');
  }
};

export const getShopifyProduct = async (req, res) => {
  try {
    const { handle } = req.params;
    const data = await storefrontRequest(PRODUCT_BY_HANDLE_QUERY, { handle });
    const product = mapStorefrontProduct(data.product);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    handleError(res, error, 'getShopifyProduct');
  }
};

export const getCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const data = await storefrontRequest(CART_QUERY, { cartId });

    if (!data.cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    res.status(200).json({ success: true, data: mapCart(data.cart) });
  } catch (error) {
    handleError(res, error, 'getCart');
  }
};

export const createCart = async (req, res) => {
  try {
    const { variantId, quantity = 1 } = req.body;
    const lines = variantId
      ? [{ merchandiseId: variantId, quantity: Number(quantity) || 1 }]
      : [];

    const data = await storefrontRequest(CART_CREATE_MUTATION, { lines });
    throwUserErrors(data.cartCreate?.userErrors);

    res.status(201).json({ success: true, data: mapCart(data.cartCreate.cart) });
  } catch (error) {
    handleError(res, error, 'createCart');
  }
};

export const addCartLines = async (req, res) => {
  try {
    const { cartId, variantId, quantity = 1 } = req.body;

    if (!cartId || !variantId) {
      return res.status(400).json({
        success: false,
        message: 'cartId and variantId are required',
      });
    }

    const data = await storefrontRequest(CART_LINES_ADD_MUTATION, {
      cartId,
      lines: [{ merchandiseId: variantId, quantity: Number(quantity) || 1 }],
    });
    throwUserErrors(data.cartLinesAdd?.userErrors);

    res.status(200).json({ success: true, data: mapCart(data.cartLinesAdd.cart) });
  } catch (error) {
    handleError(res, error, 'addCartLines');
  }
};

export const updateCartLine = async (req, res) => {
  try {
    const { cartId, lineId, quantity } = req.body;

    if (!cartId || !lineId || quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: 'cartId, lineId, and quantity are required',
      });
    }

    const data = await storefrontRequest(CART_LINES_UPDATE_MUTATION, {
      cartId,
      lines: [{ id: lineId, quantity: Number(quantity) }],
    });
    throwUserErrors(data.cartLinesUpdate?.userErrors);

    res.status(200).json({ success: true, data: mapCart(data.cartLinesUpdate.cart) });
  } catch (error) {
    handleError(res, error, 'updateCartLine');
  }
};

export const removeCartLine = async (req, res) => {
  try {
    const { cartId, lineId } = req.body;

    if (!cartId || !lineId) {
      return res.status(400).json({
        success: false,
        message: 'cartId and lineId are required',
      });
    }

    const data = await storefrontRequest(CART_LINES_REMOVE_MUTATION, {
      cartId,
      lineIds: [lineId],
    });
    throwUserErrors(data.cartLinesRemove?.userErrors);

    res.status(200).json({ success: true, data: mapCart(data.cartLinesRemove.cart) });
  } catch (error) {
    handleError(res, error, 'removeCartLine');
  }
};

export const syncShopifyProducts = async (_req, res) => {
  try {
    let hasNextPage = true;
    let after = null;
    let synced = 0;

    while (hasNextPage) {
      const data = await adminRequest(ADMIN_PRODUCTS_QUERY, {
        first: 50,
        after,
      });

      const connection = data.products;
      const edges = connection?.edges || [];

      for (const edge of edges) {
        const node = edge.node;
        const variant = node.variants?.edges?.[0]?.node;
        const price = variant?.price ? Number(variant.price) : 0;
        const image = node.featuredImage?.url || '';

        await sql`
          INSERT INTO shopify_products (
            shopify_id, handle, title, price, image, status, synced_at
          )
          VALUES (
            ${node.id},
            ${node.handle},
            ${node.title},
            ${price},
            ${image},
            ${node.status || 'ACTIVE'},
            NOW()
          )
          ON CONFLICT (shopify_id)
          DO UPDATE SET
            handle = EXCLUDED.handle,
            title = EXCLUDED.title,
            price = EXCLUDED.price,
            image = EXCLUDED.image,
            status = EXCLUDED.status,
            synced_at = NOW()
        `;
        synced += 1;
      }

      hasNextPage = Boolean(connection?.pageInfo?.hasNextPage);
      after = connection?.pageInfo?.endCursor || null;
    }

    res.status(200).json({
      success: true,
      message: `Synced ${synced} Shopify products into Postgres`,
      data: { synced },
    });
  } catch (error) {
    handleError(res, error, 'syncShopifyProducts');
  }
};

export const getCachedShopifyProducts = async (_req, res) => {
  try {
    const products = await sql`
      SELECT *
      FROM shopify_products
      ORDER BY synced_at DESC
    `;
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    handleError(res, error, 'getCachedShopifyProducts');
  }
};

export const handleShopifyWebhook = async (req, res) => {
  try {
    const hmac = req.get('X-Shopify-Hmac-Sha256');
    const topic = req.get('X-Shopify-Topic') || 'unknown';
    const shop = req.get('X-Shopify-Shop-Domain') || shopifyConfig.storeDomain || '';
    const rawBody = req.rawBody;

    if (!rawBody) {
      return res.status(400).json({ success: false, message: 'Missing raw body' });
    }

    const valid = verifyShopifyWebhook(rawBody, hmac);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const payload = JSON.parse(rawBody.toString('utf8'));

    await sql`
      INSERT INTO shopify_webhook_events (topic, shop, payload)
      VALUES (${topic}, ${shop}, ${payload})
    `;

    if (topic.startsWith('products/')) {
      const shopifyId = payload.admin_graphql_api_id || `gid://shopify/Product/${payload.id}`;
      const handle = payload.handle || '';
      const title = payload.title || '';
      const image = payload.image?.src || payload.images?.[0]?.src || '';
      const price = Number(payload.variants?.[0]?.price || 0);
      const status = (payload.status || 'active').toUpperCase();

      if (topic === 'products/delete') {
        await sql`DELETE FROM shopify_products WHERE shopify_id = ${shopifyId}`;
      } else {
        await sql`
          INSERT INTO shopify_products (
            shopify_id, handle, title, price, image, status, synced_at
          )
          VALUES (
            ${shopifyId},
            ${handle},
            ${title},
            ${price},
            ${image},
            ${status},
            NOW()
          )
          ON CONFLICT (shopify_id)
          DO UPDATE SET
            handle = EXCLUDED.handle,
            title = EXCLUDED.title,
            price = EXCLUDED.price,
            image = EXCLUDED.image,
            status = EXCLUDED.status,
            synced_at = NOW()
        `;
      }
    }

    res.status(200).json({ success: true });
  } catch (error) {
    handleError(res, error, 'handleShopifyWebhook');
  }
};
