import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from '../../controllers/admin/product.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, getAllProducts);
router.get('/:id', adminAuth, getProductById);
router.post('/', adminAuth, createProduct);
router.put('/:id', adminAuth, updateProduct);
router.delete('/:id', adminAuth, deleteProduct);

export default router;
