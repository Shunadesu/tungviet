import express from 'express';
import multer from 'multer';
import { adminAuth } from '../../middlewares/auth.js';
import {
  getAllPosts,
  createPost,
  updatePost,
  deletePost,
  reorderPosts,
  uploadPostImages,
} from '../../controllers/admin/post.controller.js';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, `post-${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

const router = express.Router();

router.get('/', adminAuth, getAllPosts);
router.post('/', adminAuth, createPost);
router.put('/:id', adminAuth, updatePost);
router.delete('/:id', adminAuth, deletePost);
router.post('/reorder', adminAuth, reorderPosts);
router.post('/upload-images', adminAuth, upload.single('file'), uploadPostImages);

export default router;
