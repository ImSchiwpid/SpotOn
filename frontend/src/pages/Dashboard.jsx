import React from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiDollarSign, FiStar, FiTrendingUp, FiArrowRight, FiClock } from 'react-icons/fi';
import { MainLayout } from '../components/layout';

const stats = [
  {
    icon: FiCalendar,
    label: 'Total Bookings',
    value: '47',
    change: '+12%',
    trend: 'up',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    icon: FiMapPin,
    label: 'Spots Listed',
    value: '8',
    change: '+2',
    trend: 'up',
    color: 'from-primary-500 to-primary-600',
    bgColor: 'bg-primary-50',
    iconColor: 'text-primary-600',
  },
  {
    icon: FiDollarSign,
    label: 'Total Earned',
    value: '$1,284',
    change: '+23%',
    trend: 'up',
    color: 'from-green-500 to-green-600',
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: FiStar,
    label: 'Avg. Rating',
    value: '4.9',
    change: '+0.2',
    trend: 'up',
    color: 'from-yellow-500 to-yellow-600',
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
  },
];

const recentBookings = [
  {
    id: 'BK-001',
    spot: 'Downtown Plaza - Spot A12',
    user: 'Sarah Wilson',
    date: 'Feb 15, 2024',
    time: '10:00 AM - 2:00 PM',
    amount: '$25.00',
    status: 'confirmed',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'BK-002',
    spot: 'City Mall Basement - Spot B5',
    user: 'Michael Chen',
    date: 'Feb 15, 2024',
    time: '3:00 PM - 6:00 PM',
    amount: '$18.00',
    status: 'pending',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
  },
  {
    id: 'BK-003',
    spot: 'Tech Park Zone C - Spot C8',
    user: 'Emily Davis',
    date: 'Feb 14, 2024',
    time: '9:00 AM - 5:00 PM',
    amount: '$45.00',
    status: 'completed',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
  },
];

const upcomingSlots = [
  {
    spot: 'Airport Short-term - Spot P3',
    nextBooking: 'Today, 4:00 PM',
    duration: '3 hours',
    earnings: '$35.00',
  },
  {
    spot: 'Hospital Visitor - Spot H1',
    nextBooking: 'Tomorrow, 8:00 AM',
    duration: '6 hours',
    earnings: '$42.00',
  },
];

const Dashboard = () => {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, Alex! 👋</h1>
            <p className="text-gray-500 mt-1">Here's what's happening with your parking spots today.</p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
              View Analytics
            </button>
            <button className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2">
              <FiMapPin className="w-4 h-4" />
              Add New Spot
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-card hover:shadow-premium transition-all duration-300 border border-gray-100 group"
            >
              <div className="flex items-start justify-between">
                <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  <FiTrendingUp className={`w-3 h-3 ${stat.trend === 'down' ? 'rotate-180' : ''}`} />
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
              <button className="text-primary-600 text-sm font-medium hover:text-primary-700 flex items-center gap-1">
                View All <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img
                        src={booking.avatar}
                        alt={booking.user}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-gray-100"
                      />
                      <div>
                        <p className="font-semibold text-gray-900">{booking.user}</p>
                        <p className="text-sm text-gray-500">{booking.spot}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{booking.amount}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 ml-16">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4" />
                      {booking.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="w-4 h-4" />
                      {booking.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Slots */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Upcoming Slots</h2>
            </div>
            <div className="p-6 space-y-4">
              {upcomingSlots.map((slot, index) => (
                <div key={index} className="p-4 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-100 hover:shadow-md transition-all cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{slot.spot}</p>
                      <p className="text-xs text-primary-600 mt-1">{slot.nextBooking}</p>
                    </div>
                    <span className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <FiClock className="w-4 h-4 text-primary-600" />
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-gray-500">{slot.duration}</span>
                    <span className="font-semibold text-green-600">{slot.earnings}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Today's Revenue</span>
                <span className="text-2xl font-bold text-gray-900">$78.50</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white shadow-lg shadow-primary-500/30"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold">Ready to grow your parking business?</h2>
              <p className="text-primary-100 mt-2">Add more spots and start earning today. No hidden fees.</p>
            </div>
            <button className="px-6 py-3 bg-white text-primary-700 rounded-xl font-semibold hover:bg-primary-50 transition-colors shadow-lg whitespace-nowrap">
              Explore Dashboard Features
            </button>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
