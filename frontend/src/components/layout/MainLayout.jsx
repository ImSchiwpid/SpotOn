import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import DashboardFooter from './DashboardFooter';

const MainLayout = ({ children }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div className="pointer-events-none fixed -top-24 left-[10%] h-72 w-72 rounded-full bg-primary-200/25 blur-3xl" />
      <div className="pointer-events-none fixed right-[-80px] top-[35%] h-80 w-80 rounded-full bg-primary-100/30 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-100px] left-[30%] h-72 w-72 rounded-full bg-primary-50/60 blur-3xl" />

      {/* Sidebar */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Navbar */}
      <Navbar
        onMenuClick={() => setIsMobileMenuOpen(true)}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Main Content */}
      <main
        className={`relative pt-20 min-h-screen transition-all duration-300 flex flex-col ${
          isSidebarCollapsed ? 'lg:pl-[84px]' : 'lg:pl-[284px]'
        }`}
      >
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 md:px-6 md:py-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </div>
        <div className="mt-auto">
          <DashboardFooter />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
