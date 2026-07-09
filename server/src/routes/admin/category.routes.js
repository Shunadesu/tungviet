import express from 'express';
import { 
  getAllCategories, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '../../controllers/admin/category.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, getAllCategories);
router.get('/:id', adminAuth, getCategoryById);
router.post('/', adminAuth, createCategory);
router.put('/:id', adminAuth, updateCategory);
router.delete('/:id', adminAuth, deleteCategory);

export default router;
