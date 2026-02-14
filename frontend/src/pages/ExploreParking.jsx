import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiStar, FiSearch, FiFilter, FiHeart, FiNavigation, FiCalendar } from 'react-icons/fi';
import { MainLayout } from '../components/layout';

const parkingSpots = [
  {
    id: 1,
    name: 'Downtown Plaza Parking',
    address: '123 Main Street, Downtown',
    price: 5,
    rating: 4.8,
    reviews: 234,
    available: 12,
    distance: '0.3 km',
    image: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&h=300&fit=crop',
    features: ['Covered', 'EV Charging', '24/7 Access'],
    verified: true,
  },
  {
    id: 2,
    name: 'City Mall Basement',
    address: '456 Shopping Ave, Midtown',
    price: 3,
    rating: 4.6,
    reviews: 189,
    available: 8,
    distance: '0.8 km',
    image: 'https://images.unsplash.com/photo-1573348722427-f1d6d73a3d79?w=400&h=300&fit=crop',
    features: ['Security', 'CCTV', 'Valet'],
    verified: true,
  },
  {
    id: 3,
    name: 'Tech Park Zone C',
    address: '789 Innovation Blvd, Tech District',
    price: 4,
    rating: 4.9,
    reviews: 312,
    available: 5,
    distance: '1.2 km',
    image: 'https://images.unsplash.com/photo-1494905998402-395d579af97f?w=400&h=300&fit=crop',
    features: ['EV Charging', 'Shaded', 'Car Wash'],
    verified: true,
  },
  {
    id: 4,
    name: 'Airport Short-term Parking',
    address: 'Airport Road, Terminal 1',
    price: 8,
    rating: 4.5,
    reviews: 567,
    available: 24,
    distance: '2.5 km',
    image: 'https://images.unsplash.com/photo-1563007618-9841fd2c3b14?w=400&h=300&fit=crop',
    features: ['24/7 Access', ' Shuttle', 'Short-term'],
    verified: true,
  },
  {
    id: 5,
    name: 'Harbor View Complex',
    address: '321 Marina Drive, Harbor Area',
    price: 6,
    rating: 4.7,
    reviews: 145,
    available: 3,
    distance: '1.8 km',
    image: 'https://images.unsplash.com/photo-1508109777868-5fb7b6b24f8f?w=400&h=300&fit=crop',
    features: ['Sea View', 'Security', '24/7 Access'],
    verified: false,
  },
  {
    id: 6,
    name: 'Stadium Event Parking',
    address: '999 Sports Complex, East Side',
    price: 10,
    rating: 4.4,
    reviews: 89,
    available: 50,
    distance: '3.2 km',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop',
    features: ['Event Parking', 'Large Vehicles', 'Cashless'],
    verified: true,
  },
];

const filters = [
  { label: 'Price', options: ['$0-$5', '$5-$10', '$10+'] },
  { label: 'Rating', options: ['4.5+', '4.0+', '3.5+'] },
  { label: 'Features', options: ['EV Charging', 'Covered', '24/7 Access'] },
  { label: 'Distance', options: ['< 1km', '< 3km', '< 5km'] },
];

const ExploreParking = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Parking</h1>
            <p className="text-gray-500 mt-1">Find and book the perfect parking spot near you</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
              <FiMapPin className="w-4 h-4" />
              Map View
            </button>
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="px-4 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
            >
              <FiFilter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by location, spot name, or address..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm text-gray-700 placeholder-gray-400"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
            Search
          </button>
        </div>

        {/* Active Filters */}
        {Object.keys(activeFilters).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => (
              <span key={key} className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium flex items-center gap-2">
                {key}: {value}
                <button 
                  onClick={() => setActiveFilters(prev => ({ ...prev, [key]: null }))}
                  className="hover:text-primary-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Filters Dropdown */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white rounded-2xl shadow-card border border-gray-100 p-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filters.map((filter) => (
                  <div key={filter.label}>
                    <h3 className="font-semibold text-gray-900 mb-3">{filter.label}</h3>
                    <div className="space-y-2">
                      {filter.options.map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-600">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium">
                  Clear All
                </button>
                <button className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                  Apply Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkingSpots.map((spot, index) => (
            <motion.div
              key={spot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden hover:shadow-premium transition-all duration-300 group cursor-pointer"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={spot.image}
                  alt={spot.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${spot.available > 10 ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                    {spot.available} spots left
                  </span>
                </div>
                {spot.verified && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-medium flex items-center gap-1">
                    ✓ Verified
                  </span>
                )}
                <button 
                  className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <FiHeart className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{spot.name}</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                      <FiMapPin className="w-4 h-4" />
                      {spot.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm mb-4">
                  <span className="flex items-center gap-1 text-yellow-600">
                    <FiStar className="w-4 h-4 fill-current" />
                    <span className="font-semibold">{spot.rating}</span>
                    <span className="text-gray-400">({spot.reviews})</span>
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <FiNavigation className="w-4 h-4" />
                    {spot.distance}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {spot.features.slice(0, 3).map((feature) => (
                    <span key={feature} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">${spot.price}</span>
                    <span className="text-gray-500 text-sm">/hr</span>
                  </div>
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center gap-2">
                    <FiCalendar className="w-4 h-4" />
                    Book Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center py-8">
          <button className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Load More Spots
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExploreParking;
