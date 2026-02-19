import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiBell, FiChevronDown, FiUser, FiSettings, FiLogOut, FiHelpCircle, FiMenu } from 'react-icons/fi';
import { AuthContext, SocketContext } from '../../App';
import { notificationAPI } from '../../utils/api';
import { formatRoleLabel } from '../../utils/roles';

const Navbar = ({ onMenuClick }) => {
  const { user: authUser, logout } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!authUser) return;
      try {
        const response = await notificationAPI.getMy();
        setNotifications(response.data?.data || []);
        setUnreadCount(response.data?.unreadCount || 0);
      } catch (error) {
        setNotifications([]);
        setUnreadCount(0);
      }
    };
    fetchNotifications();
  }, [authUser]);

  useEffect(() => {
    if (!socket || !authUser) return;
    const authId = String(authUser.id || authUser._id || '');

    const onNotificationCreated = (payload) => {
      if (!payload?.userId || String(payload.userId) !== authId) return;
      setNotifications((prev) => [payload.notification, ...prev].slice(0, 20));
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('notificationCreated', onNotificationCreated);
    return () => socket.off('notificationCreated', onNotificationCreated);
  }, [socket, authUser]);

  const displayUser = {
    name: authUser?.name || 'User',
    email: authUser?.email || 'No email',
    avatar:
      authUser?.profileImage ||
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    role: formatRoleLabel(authUser?.role),
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path) => {
    setIsProfileOpen(false);
    setIsNotifOpen(false);
    navigate(path);
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await notificationAPI.markRead(notification._id);
        setNotifications((prev) =>
          prev.map((item) => (item._id === notification._id ? { ...item, read: true } : item))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        // no-op
      }
    }
  };

  return (
    <header className="fixed top-0 right-0 left-[280px] h-20 bg-white/80 backdrop-blur-lg border-b border-gray-100 z-30 px-6 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600"
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-xl mx-4">
        <div className="relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search parking spots, bookings..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition-all placeholder-gray-400 text-gray-700"
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
          >
            <FiBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 && (
                    <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
                  )}
                  {notifications.slice(0, 8).map((notif) => (
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(notif)}
                      key={notif._id}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notif.read ? 'bg-primary-50/30' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-primary-500' : 'bg-transparent'}`} />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{notif.title}</p>
                          <p className="text-gray-500 text-sm mt-0.5">{notif.message}</p>
                          <p className="text-gray-400 text-xs mt-1">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 text-center">
                  <button
                    onClick={() => handleNavigation('/notifications')}
                    className="text-primary-600 text-sm font-medium hover:text-primary-700"
                  >
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <img
              src={displayUser.avatar}
              alt={displayUser.name}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-primary-100"
            />
            <div className="hidden md:block text-left">
              <p className="font-semibold text-gray-900 text-sm">{displayUser.name}</p>
              <p className="text-xs text-gray-500">{displayUser.role}</p>
            </div>
            <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={displayUser.avatar}
                      alt={displayUser.name}
                      className="w-12 h-12 rounded-xl object-cover ring-2 ring-primary-100"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{displayUser.name}</p>
                      <p className="text-sm text-gray-500">{displayUser.email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigation('/profile');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <FiUser className="w-5 h-5" />
                    <span className="font-medium">My Profile</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigation('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <FiSettings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigation('/help');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <FiHelpCircle className="w-5 h-5" />
                    <span className="font-medium">Help & Support</span>
                  </button>
                </div>
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <FiLogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
