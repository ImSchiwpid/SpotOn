import express from 'express';
import { protect } from '../middleware/auth.js';
import { mongoIdValidation } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import Notification from '../models/Notification.js';

const router = express.Router();

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user.id }).sort('-createdAt').limit(100);
  const unreadCount = await Notification.countDocuments({ user: req.user.id, read: false });

  res.status(200).json({
    success: true,
    unreadCount,
    count: notifications.length,
    data: notifications
  });
});

const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found' });
  }
  if (notification.user.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Not authorized' });
  }

  notification.read = true;
  await notification.save();

  res.status(200).json({ success: true, data: notification });
});

const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user.id, read: false }, { $set: { read: true } });

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

router.use(protect);
router.get('/', getMyNotifications);
router.put('/read-all', markAllNotificationsRead);
router.put('/:id/read', mongoIdValidation, markNotificationRead);

export default router;
