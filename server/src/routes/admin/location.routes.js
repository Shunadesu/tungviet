import express from 'express';
import {
  getAllLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  reorderLocations,
} from '../../controllers/admin/location.controller.js';
import { adminAuth } from '../../middlewares/auth.js';

const router = express.Router();

router.get('/', adminAuth, getAllLocations);
router.post('/', adminAuth, createLocation);
router.post('/reorder', adminAuth, reorderLocations);
router.get('/:id', adminAuth, getLocationById);
router.put('/:id', adminAuth, updateLocation);
router.delete('/:id', adminAuth, deleteLocation);

export default router;
