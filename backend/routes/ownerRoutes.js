import express from 'express';
import {
  getOwnerDashboard,
  getOwnerBookings,
  decideBooking,
  setMaintenanceMode,
  requestWithdrawal,
  getWithdrawalHistory,
  getOwnerTransactions
} from '../controllers/ownerController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { mongoIdValidation } from '../middleware/validation.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('parking_owner', 'admin'));

router.get('/dashboard', getOwnerDashboard);
router.get('/bookings', getOwnerBookings);
router.put('/bookings/:id/decision', mongoIdValidation, decideBooking);
router.put('/parking/:id/maintenance', mongoIdValidation, setMaintenanceMode);
router.post('/withdrawals', requestWithdrawal);
router.get('/withdrawals', getWithdrawalHistory);
router.get('/transactions', getOwnerTransactions);

export default router;

