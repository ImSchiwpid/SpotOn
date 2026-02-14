import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiStar, FiEdit2, FiCamera, FiShield, FiCreditCard, FiKey, FiLogOut, FiTrendingUp, FiDollarSign, FiX, FiTruck } from 'react-icons/fi';
import { MainLayout } from '../components/layout';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const user = {
    name: 'Alex Johnson',
    email: 'alex.johnson@email.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    memberSince: 'January 2023',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
    bio: 'Parking enthusiast and verified host with 3 years of experience. I love providing safe and convenient parking solutions for travelers and commuters.',
    totalBookings: 47,
    totalEarnings: 1284,
    averageRating: 4.9,
    responseRate: 98,
    verified: true,
  };

  const stats = [
    { icon: FiCalendar, label: 'Total Bookings', value: user.totalBookings, color: 'blue' },
    { icon: FiDollarSign, label: 'Total Earnings', value: `$${user.totalEarnings}`, color: 'green' },
    { icon: FiStar, label: 'Avg. Rating', value: user.averageRating, color: 'yellow' },
    { icon: FiTrendingUp, label: 'Response Rate', value: `${user.responseRate}%`, color: 'purple' },
  ];

  const vehicles = [
    { make: 'Toyota', model: 'Camry', year: 2022, plate: 'ABC-1234', type: 'Sedan' },
    { make: 'Tesla', model: 'Model 3', year: 2024, plate: 'EV-2024', type: 'Electric' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'vehicles', label: 'My Vehicles' },
    { id: 'payment', label: 'Payment Methods' },
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-500 mt-1">Manage your account settings and preferences</p>
          </div>
        </div>

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden"
        >
          <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-700" />
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
              <div className="relative">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-32 h-32 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                />
                <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors">
                  <FiCamera className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 md:mb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                  {user.verified && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                      <FiShield className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-500 flex items-center gap-1 mt-1">
                  <FiMapPin className="w-4 h-4" />
                  {user.location}
                </p>
              </div>
              <div className="md:mb-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
                >
                  {isEditing ? (
                    <>
                      <FiX className="w-4 h-4" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <FiEdit2 className="w-4 h-4" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    stat.color === 'green' ? 'bg-green-100 text-green-600' :
                    stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex gap-8 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About</h3>
                  <p className="text-gray-600 leading-relaxed">{user.bio}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <FiMail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <FiPhone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{user.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <FiMapPin className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{user.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Account Info</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500">Member Since</span>
                        <span className="font-medium text-gray-900">{user.memberSince}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500">Account Status</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="text-gray-500">User ID</span>
                        <span className="font-medium text-gray-900">USR-2023-0847</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Vehicles Tab */}
            {activeTab === 'vehicles' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">My Vehicles</h3>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                    Add Vehicle
                  </button>
                </div>

                <div className="space-y-4">
                  {vehicles.map((vehicle, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:border-primary-200 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                          <FiTruck className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{vehicle.year} {vehicle.make} {vehicle.model}</p>
                          <p className="text-sm text-gray-500">{vehicle.type} • {vehicle.plate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <FiLogOut className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Payment Tab */}
            {activeTab === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>

                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <div className="flex items-center gap-4">
                      <FiCreditCard className="w-10 h-10" />
                      <div>
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-sm text-blue-200">Expires 12/25</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium">Default</span>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <FiCreditCard className="w-10 h-10 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">•••• •••• •••• 8888</p>
                        <p className="text-sm text-gray-500">Expires 06/26</p>
                      </div>
                    </div>
                    <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                      Set Default
                    </button>
                  </div>

                  <button className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-primary-300 hover:text-primary-600 transition-colors">
                    + Add Payment Method
                  </button>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Settings</h3>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                    <p className="text-sm text-green-700">
                      <strong>$1,284.00</strong> available for payout
                    </p>
                    <button className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Request Payout
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>

                <div className="space-y-4">
                  <button className="w-full p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:border-primary-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <FiKey className="w-10 h-10 p-2 bg-gray-100 rounded-lg text-gray-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-500">Last changed 3 months ago</p>
                      </div>
                    </div>
                    <span className="text-primary-600 font-medium">Change</span>
                  </button>

                  <button className="w-full p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:border-primary-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <FiShield className="w-10 h-10 p-2 bg-gray-100 rounded-lg text-gray-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-sm text-gray-500">Add an extra layer of security</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Enabled</span>
                  </button>

                  <button className="w-full p-4 border border-gray-200 rounded-xl flex items-center justify-between hover:border-red-200 transition-colors">
                    <div className="flex items-center gap-4">
                      <FiLogOut className="w-10 h-10 p-2 bg-red-100 rounded-lg text-red-600" />
                      <div className="text-left">
                        <p className="font-medium text-red-600">Sign Out All Devices</p>
                        <p className="text-sm text-gray-500">Sign out from all other sessions</p>
                      </div>
                    </div>
                    <span className="text-red-600 font-medium">Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>

                <div className="space-y-4">
                  {[
                    { label: 'Booking Confirmations', desc: 'Receive updates when bookings are confirmed' },
                    { label: 'New Messages', desc: 'Get notified when you receive new messages' },
                    { label: 'Payment Alerts', desc: 'Receive payment and earnings notifications' },
                    { label: 'Promotional Emails', desc: 'Receive offers and promotions' },
                    { label: 'Price Changes', desc: 'Get alerts about pricing updates' },
                  ].map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked={index < 4} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
