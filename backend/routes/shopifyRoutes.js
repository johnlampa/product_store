import express from 'express';
import {
  getShopifyStatus,
  getShopifyProducts,
  getShopifyProduct,
  getCart,
  createCart,
  addCartLines,
  updateCartLine,
  removeCartLine,
  syncShopifyProducts,
  getCachedShopifyProducts,
} from '../controllers/shopifyController.js';

const router = express.Router();

router.get('/status', getShopifyStatus);
router.get('/products', getShopifyProducts);
router.get('/products/:handle', getShopifyProduct);

router.get('/cart/:cartId', getCart);
router.post('/cart', createCart);
router.post('/cart/lines', addCartLines);
router.put('/cart/lines', updateCartLine);
router.delete('/cart/lines', removeCartLine);

router.get('/cache', getCachedShopifyProducts);
router.post('/sync', syncShopifyProducts);

export default router;
