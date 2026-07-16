import express from 'express';
import { getActiveProductColumns } from '../../controllers/public/productColumn.controller.js';

const router = express.Router();

router.get('/', getActiveProductColumns);

export default router;