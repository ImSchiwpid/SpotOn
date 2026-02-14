import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  approveParkingSpot,
  getAllTransactions,
  getPendingApprovals
} from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected and admin only
router.use(protect);
router.use(restrictTo('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', mongoIdValidation, updateUser);
router.delete('/users/:id', mongoIdValidation, deleteUser);
router.put('/parking/:id/approve', mongoIdValidation, approveParkingSpot);
router.get('/transactions', getAllTransactions);
router.get('/pending', getPendingApprovals);

export default router;
