import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  updateUser,
  deleteUser,
  approveParkingSpot,
  removeParkingSpot,
  verifyParkingOwner,
  setUserSuspension,
  getAllTransactions,
  getPendingApprovals,
  getPlatformSettings,
  updateCommission,
  getComplaints,
  getWithdrawalRequests,
  processWithdrawal
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
router.put('/users/:id/suspend', mongoIdValidation, setUserSuspension);
router.put('/users/:id/verify-owner', mongoIdValidation, verifyParkingOwner);
router.delete('/users/:id', mongoIdValidation, deleteUser);
router.put('/parking/:id/approve', mongoIdValidation, approveParkingSpot);
router.delete('/parking/:id', mongoIdValidation, removeParkingSpot);
router.get('/transactions', getAllTransactions);
router.get('/pending', getPendingApprovals);
router.get('/settings', getPlatformSettings);
router.put('/settings/commission', updateCommission);
router.get('/complaints', getComplaints);
router.get('/withdrawals', getWithdrawalRequests);
router.put('/withdrawals/:id', mongoIdValidation, processWithdrawal);

export default router;
