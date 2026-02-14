import express from 'express';
import {
  addCar,
  getMyCars,
  getCar,
  updateCar,
  deleteCar,
  setDefaultCar
} from '../controllers/carController.js';
import { protect } from '../middleware/auth.js';
import { carValidation, mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', carValidation, addCar);
router.get('/', getMyCars);
router.get('/:id', mongoIdValidation, getCar);
router.put('/:id', mongoIdValidation, updateCar);
router.delete('/:id', mongoIdValidation, deleteCar);
router.put('/:id/default', mongoIdValidation, setDefaultCar);

export default router;
