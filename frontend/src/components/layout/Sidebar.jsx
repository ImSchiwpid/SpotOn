import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiMap,
  FiCalendar,
  FiPlusCircle,
  FiUser,
  FiLogOut,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle
} from 'react-icons/fi';

const navItems = [
  { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
  { icon: FiMap, label: 'Explore Parking', path: '/explore' },
  { icon: FiCalendar, label: 'My Bookings', path: '/bookings' },
  { icon: FiPlusCircle, label: 'Add Parking', path: '/add-parking' },
  { icon: FiUser, label: 'Profile', path: '/profile' },
];

const bottomItems = [
  { icon: FiSettings, label: 'Settings', path: '/settings' },
  { icon: FiHelpCircle, label: 'Help & Support', path: '/help' },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white border-r border-gray-100 shadow-card z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg">
            <FiMap className="w-5 h-5 text-white" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  SPOT-ON
                </h1>
                <p className="text-xs text-gray-400">Smart Parking</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              isCollapsed={isCollapsed}
            />
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-100">
        <ul className="space-y-2">
          {bottomItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              isCollapsed={isCollapsed}
            />
          ))}
          <li>
            <button className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                <FiLogOut className="w-5 h-5" />
              </div>
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium overflow-hidden whitespace-nowrap"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </li>
        </ul>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-md"
      >
        {isCollapsed ? (
          <FiChevronRight className="w-4 h-4" />
        ) : (
          <FiChevronLeft className="w-4 h-4" />
        )}
      </button>
    </motion.aside>
  );
};

const NavItem = ({ icon: Icon, label, path, isCollapsed }) => {
  return (
    <li>
      <NavLink
        to={path}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
            isActive
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
              : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
          }`
        }
      >
        <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-white transition-colors flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="font-medium overflow-hidden whitespace-nowrap"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </NavLink>
    </li>
  );
};

export default Sidebar;
