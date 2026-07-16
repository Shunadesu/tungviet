import express from 'express';
import { getPublicPosts, getPublicPost } from '../../controllers/public/post.controller.js';

const router = express.Router();

router.get('/', getPublicPosts);
router.get('/:slug', getPublicPost);

export default router;
