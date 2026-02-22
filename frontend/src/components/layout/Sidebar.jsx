import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome,
  FiMap,
  FiHeart,
  FiCalendar,
  FiTruck,
  FiPlusCircle,
  FiUser,
  FiTrendingUp,
  FiShield,
  FiChevronLeft,
  FiChevronRight
} from 'react-icons/fi';
import { AuthContext } from '../../App';
import { normalizeRole } from '../../utils/roles';
import BrandLogo from '../ui/BrandLogo';

const navItems = [
  { icon: FiHome, label: 'Dashboard', path: '/dashboard' },
  { icon: FiMap, label: 'Explore Parking', path: '/explore' },
  { icon: FiHeart, label: 'Favorites', path: '/favorites' },
  { icon: FiCalendar, label: 'My Bookings', path: '/bookings' },
  { icon: FiTruck, label: 'My Cars', path: '/cars' },
  { icon: FiPlusCircle, label: 'Add Parking', path: '/add-parking' },
  { icon: FiTrendingUp, label: 'Owner Panel', path: '/owner' },
  { icon: FiShield, label: 'Admin Panel', path: '/admin' },
  { icon: FiUser, label: 'Profile', path: '/profile' },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { user } = React.useContext(AuthContext);
  const currentRole = normalizeRole(user?.role);
  const visibleNavItems = navItems.filter((item) => {
    if (item.path === '/add-parking' || item.path === '/owner') {
      return currentRole === 'parking_owner' || currentRole === 'admin';
    }
    if (item.path === '/admin') {
      return currentRole === 'admin';
    }
    return true;
  });

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '280px' }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen border-r border-white/70 bg-white/75 backdrop-blur-xl shadow-card z-40 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <BrandLogo showText={false} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="overflow-hidden"
              >
                <h1 className="text-lg font-bold tracking-tight text-primary-700">SPOT-ON</h1>
                <p className="text-xs text-gray-400">Smart Parking</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 overflow-y-auto">
        <ul className="space-y-2">
          {visibleNavItems.map((item) => (
            <NavItem
              key={item.path}
              {...item}
              isCollapsed={isCollapsed}
            />
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white/90 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-all shadow-sm"
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
              ? 'border border-primary-200 bg-primary-50/80 text-primary-700'
              : 'text-gray-600 hover:bg-white/70 hover:text-gray-900'
          }`
        }
      >
        <div className="w-10 h-10 rounded-xl bg-white/70 border border-gray-100 transition-colors flex items-center justify-center">
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
