import express from 'express';
import { adminAuth } from '../../middlewares/auth.js';
import {
  getAllPostCategories,
  getPostCategory,
  createPostCategory,
  updatePostCategory,
  deletePostCategory,
  reorderPostCategories,
} from '../../controllers/admin/postCategory.controller.js';

const router = express.Router();

router.get('/', adminAuth, getAllPostCategories);
router.get('/:id', adminAuth, getPostCategory);
router.post('/', adminAuth, createPostCategory);
router.put('/:id', adminAuth, updatePostCategory);
router.delete('/:id', adminAuth, deletePostCategory);
router.post('/reorder', adminAuth, reorderPostCategories);

export default router;
