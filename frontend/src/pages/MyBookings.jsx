import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiMapPin, FiStar, FiFilter, FiTruck } from 'react-icons/fi';
import { MainLayout } from '../components/layout';

const bookings = [
  {
    id: 'BK-2024-001',
    spot: 'Downtown Plaza - Spot A12',
    address: '123 Main Street, Downtown',
    date: 'Feb 15, 2024',
    startTime: '10:00 AM',
    endTime: '2:00 PM',
    duration: '4 hours',
    amount: 25,
    status: 'confirmed',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200&h=150&fit=crop',
    vehicle: 'Toyota Camry (ABC-1234)',
    host: 'Sarah Wilson',
    rating: null,
  },
  {
    id: 'BK-2024-002',
    spot: 'City Mall Basement - Spot B5',
    address: '456 Shopping Ave, Midtown',
    date: 'Feb 15, 2024',
    startTime: '3:00 PM',
    endTime: '6:00 PM',
    duration: '3 hours',
    amount: 18,
    status: 'pending',
    image: 'https://images.unsplash.com/photo-1573348722427-f1d6d73a3d79?w=200&h=150&fit=crop',
    vehicle: 'Honda Civic (XYZ-5678)',
    host: 'Michael Chen',
    rating: null,
  },
  {
    id: 'BK-2024-003',
    spot: 'Tech Park Zone C - Spot C8',
    address: '789 Innovation Blvd, Tech District',
    date: 'Feb 14, 2024',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    duration: '8 hours',
    amount: 45,
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1494905998402-395d579af97f?w=200&h=150&fit=crop',
    vehicle: 'Tesla Model 3 (EV-2024)',
    host: 'Emily Davis',
    rating: 5,
  },
  {
    id: 'BK-2024-004',
    spot: 'Airport Short-term - Spot P3',
    address: 'Airport Road, Terminal 1',
    date: 'Feb 10, 2024',
    startTime: '6:00 AM',
    endTime: '10:00 AM',
    duration: '4 hours',
    amount: 40,
    status: 'completed',
    image: 'https://images.unsplash.com/photo-1563007618-9841fd2c3b14?w=200&h=150&fit=crop',
    vehicle: 'BMW X5 (LUX-8888)',
    host: 'Robert Taylor',
    rating: 4,
  },
  {
    id: 'BK-2024-005',
    spot: 'Harbor View Complex',
    address: '321 Marina Drive, Harbor Area',
    date: 'Feb 8, 2024',
    startTime: '2:00 PM',
    endTime: '8:00 PM',
    duration: '6 hours',
    amount: 36,
    status: 'cancelled',
    image: 'https://images.unsplash.com/photo-1508109777868-5fb7b6b24f8f?w=200&h=150&fit=crop',
    vehicle: 'Toyota Camry (ABC-1234)',
    host: 'Jennifer Lopez',
    rating: null,
  },
];

const statusColors = {
  confirmed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Confirmed' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Completed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
};

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const filteredBookings = activeTab === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === activeTab);

  const tabs = [
    { id: 'all', label: 'All Bookings', count: bookings.length },
    { id: 'upcoming', label: 'Upcoming', count: bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length },
    { id: 'completed', label: 'Completed', count: bookings.filter(b => b.status === 'completed').length },
    { id: 'cancelled', label: 'Cancelled', count: bookings.filter(b => b.status === 'cancelled').length },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 mt-1">Manage and track all your parking reservations</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
              <FiFilter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2">
              <FiCalendar className="w-4 h-4" />
              New Booking
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tabs.slice(1).map((tab, index) => (
            <motion.button
              key={tab.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl border transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-50 border-primary-200'
                  : 'bg-white border-gray-100 hover:border-gray-200'
              }`}
            >
              <p className="text-2xl font-bold text-gray-900">{tab.count}</p>
              <p className="text-sm text-gray-500">{tab.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex gap-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    activeTab === tab.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          <div className="divide-y divide-gray-50">
            {filteredBookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedBooking(booking)}
              >
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={booking.image}
                      alt={booking.spot}
                      className="w-full md:w-32 h-24 md:h-20 object-cover rounded-xl"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{booking.spot}</h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <FiMapPin className="w-4 h-4" />
                          {booking.address}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[booking.status].bg} ${statusColors[booking.status].text}`}>
                        {statusColors[booking.status].label}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {booking.startTime} - {booking.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiTruck className="w-4 h-4" />
                        {booking.vehicle}
                      </span>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4">
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">${booking.amount}</p>
                      <p className="text-sm text-gray-500">{booking.duration}</p>
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'completed' && !booking.rating && (
                        <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                          Rate Now
                        </button>
                      )}
                      {booking.status === 'pending' && (
                        <button className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                          Cancel
                        </button>
                      )}
                      {booking.status === 'cancelled' && (
                        <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                          Book Again
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rating for completed bookings */}
                {booking.status === 'completed' && booking.rating && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                    <span className="text-sm text-gray-500">Your rating:</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          className={`w-4 h-4 ${i < booking.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{booking.rating}/5</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {filteredBookings.length} of {bookings.length} bookings
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1.5 bg-primary-600 text-white rounded-lg font-medium">
              1
            </button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              2
            </button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyBookings;
