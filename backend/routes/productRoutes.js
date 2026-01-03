import express from 'express';
import { getProducts } from '../controllers/productController.js';
import { createProduct } from '../controllers/productController.js';
import { getProduct } from '../controllers/productController.js';
import { updateProduct } from '../controllers/productController.js';
import { deleteProduct } from '../controllers/productController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

export default router;