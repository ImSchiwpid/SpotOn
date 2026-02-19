import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MainLayout } from '../components/layout';
import { notificationAPI } from '../utils/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationAPI.getMy();
      setNotifications(response.data?.data || []);
      setUnreadCount(response.data?.unreadCount || 0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const markOneRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, read: true } : item))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update notification');
    }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update notifications');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <button onClick={markAllRead} className="px-4 py-2 bg-gray-900 text-white rounded-lg">
            Mark all read
          </button>
        </div>

        <p className="text-sm text-gray-500">Unread: {unreadCount}</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
          {loading && <p className="p-6 text-gray-500">Loading notifications...</p>}
          {!loading && notifications.length === 0 && (
            <p className="p-6 text-gray-500">No notifications yet.</p>
          )}
          {!loading &&
            notifications.map((item) => (
              <button
                key={item._id}
                onClick={() => markOneRead(item._id)}
                className={`w-full text-left p-4 border-b border-gray-100 last:border-b-0 ${
                  item.read ? 'bg-white' : 'bg-primary-50/40'
                }`}
              >
                <p className="font-semibold text-gray-900">{item.title}</p>
                <p className="text-sm text-gray-600 mt-1">{item.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
              </button>
            ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;

