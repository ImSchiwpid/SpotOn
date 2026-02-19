import Notification from '../models/Notification.js';

export const createNotification = async ({ userId, title, message, type = 'system', metadata = {}, io }) => {
  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type,
    metadata
  });

  if (io) {
    io.emit('notificationCreated', {
      userId: String(userId),
      notification
    });
  }

  return notification;
};

