import express from 'express';
import { getPublicPostCategories } from '../../controllers/public/postCategory.controller.js';

const router = express.Router();

router.get('/', getPublicPostCategories);

export default router;
