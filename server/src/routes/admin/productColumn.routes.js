import express from 'express';
import {
  getAllProductColumns,
  getProductColumnById,
  createProductColumn,
  updateProductColumn,
  deleteProductColumn,
  restoreProductColumn,
  reorderProductColumns,
} from '../../controllers/admin/productColumn.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, getAllProductColumns);
router.get('/:id', adminAuth, getProductColumnById);
router.post('/', adminAuth, createProductColumn);
router.post('/reorder', adminAuth, reorderProductColumns);
router.put('/:id', adminAuth, updateProductColumn);
router.delete('/:id', adminAuth, deleteProductColumn);
router.post('/:id/restore', adminAuth, restoreProductColumn);

export default router;