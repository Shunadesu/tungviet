import express from 'express';
import { adminAuth } from '../../middlewares/auth.js';
import {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  reorderPosts,
} from '../../controllers/admin/post.controller.js';

const router = express.Router();

router.get('/', adminAuth, getAllPosts);
router.post('/', adminAuth, createPost);
router.put('/:id', adminAuth, updatePost);
router.delete('/:id', adminAuth, deletePost);
router.post('/reorder', adminAuth, reorderPosts);

export default router;
