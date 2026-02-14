import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiUpload, FiDollarSign, FiTruck, FiCheck, FiImage, FiNavigation, FiType, FiList } from 'react-icons/fi';
import { MainLayout } from '../components/layout';

const AddParking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    price: '',
    availableSpots: '',
    amenities: [],
    images: [],
    operatingHours: { start: '00:00', end: '23:59' },
    vehicleTypes: [],
    rules: '',
  });

  const amenitiesList = [
    'Covered Parking', 'EV Charging', '24/7 Access', 'Security', 'CCTV', 
    'Valet', 'Car Wash', 'Restroom', 'Waiting Area', 'WiFi'
  ];

  const vehicleTypes = [
    { icon: FiTruck, label: 'Sedan', description: 'Standard cars' },
    { icon: FiTruck, label: 'SUV', description: 'Larger vehicles' },
    { icon: FiTruck, label: 'Motorcycle', description: 'Bikes & scooters' },
    { icon: FiTruck, label: 'EV', description: 'Electric vehicles' },
  ];

  const steps = [
    { icon: FiType, label: 'Basic Info' },
    { icon: FiMapPin, label: 'Location' },
    { icon: FiList, label: 'Amenities' },
    { icon: FiImage, label: 'Photos' },
    { icon: FiCheck, label: 'Review' },
  ];

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Parking Spot</h1>
          <p className="text-gray-500 mt-1">List your parking space and start earning today</p>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.label}>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setCurrentStep(index + 1)}
                  className={`flex flex-col items-center gap-2 ${
                    index + 1 <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                    index + 1 < currentStep
                      ? 'bg-green-500 text-white'
                      : index + 1 === currentStep
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {index + 1 < currentStep ? (
                      <FiCheck className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    index + 1 <= currentStep ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {step.label}
                  </span>
                </motion.button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-1 mx-2 rounded ${
                    index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-100'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl shadow-card border border-gray-100 p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parking Spot Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Downtown Plaza - Spot A12"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Describe your parking spot, access instructions, and what makes it special..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price per Hour ($) *
                    </label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        placeholder="5.00"
                        className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Spots *
                    </label>
                    <input
                      type="number"
                      placeholder="2"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      value={formData.availableSpots}
                      onChange={(e) => setFormData({ ...formData, availableSpots: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Supported Vehicle Types
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {vehicleTypes.map((type) => (
                      <button
                        key={type.label}
                        className={`p-4 border rounded-xl text-center transition-all ${
                          formData.vehicleTypes.includes(type.label)
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            vehicleTypes: prev.vehicleTypes.includes(type.label)
                              ? prev.vehicleTypes.filter(v => v !== type.label)
                              : [...prev.vehicleTypes, type.label]
                          }));
                        }}
                      >
                        <type.icon className="w-6 h-6 mx-auto mb-2" />
                        <p className="font-medium text-sm">{type.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900">Location Details</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Address *
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter your parking address"
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                </div>

                <div className="h-64 bg-gray-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200">
                  <div className="text-center">
                    <FiNavigation className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">Map preview will appear here</p>
                    <button className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                      Pin Location on Map
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Opening Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      value={formData.operatingHours.start}
                      onChange={(e) => setFormData({
                        ...formData,
                        operatingHours: { ...formData.operatingHours, start: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Closing Time
                    </label>
                    <input
                      type="time"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      value={formData.operatingHours.end}
                      onChange={(e) => setFormData({
                        ...formData,
                        operatingHours: { ...formData.operatingHours, end: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Amenities */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900">Amenities & Features</h2>
              <p className="text-gray-500">Select all amenities available at your parking spot</p>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {amenitiesList.map((amenity) => (
                  <button
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`p-4 border rounded-xl text-center transition-all ${
                      formData.amenities.includes(amenity)
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiCheck className={`w-6 h-6 mx-auto mb-2 ${
                      formData.amenities.includes(amenity) ? 'opacity-100' : 'opacity-0'
                    }`} />
                    <p className="font-medium text-sm">{amenity}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Rules or Instructions
                </label>
                <textarea
                  rows="3"
                  placeholder="Any specific rules, access codes, or instructions for guests..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                  value={formData.rules}
                  onChange={(e) => setFormData({ ...formData, rules: e.target.value })}
                />
              </div>
            </motion.div>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900">Photos</h2>
              <p className="text-gray-500">Add photos to help guests find and recognize your spot</p>

              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center hover:border-primary-300 transition-colors cursor-pointer">
                <FiUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  Drag and drop photos here
                </p>
                <p className="text-gray-500 mb-4">
                  or click to browse from your computer
                </p>
                <p className="text-sm text-gray-400">
                  Supports: JPG, PNG, WebP (Max 5MB each)
                </p>
                <button className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors">
                  Select Photos
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Placeholder for uploaded images */}
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Photo 1</span>
                </div>
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Photo 2</span>
                </div>
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Photo 3</span>
                </div>
                <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400">Photo 4</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-bold text-gray-900">Review Your Listing</h2>
              <p className="text-gray-500">Review all details before publishing your parking spot</p>

              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Spot Name</p>
                    <p className="font-medium text-gray-900">{formData.name || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Price per Hour</p>
                    <p className="font-medium text-gray-900">${formData.price || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Available Spots</p>
                    <p className="font-medium text-gray-900">{formData.availableSpots || '0'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="font-medium text-gray-900">{formData.address || 'Not set'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amenities</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.amenities.length > 0 ? (
                      formData.amenities.map((amenity) => (
                        <span key={amenity} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-lg text-sm">
                          {amenity}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-400">No amenities selected</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              className={`px-6 py-3 border border-gray-200 rounded-xl font-medium transition-colors ${
                currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Back
            </button>
            <button
              onClick={() => {
                if (currentStep < 5) {
                  setCurrentStep(currentStep + 1);
                } else {
                  // Submit form
                  console.log('Submitting:', formData);
                }
              }}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 flex items-center gap-2"
            >
              {currentStep === 5 ? 'Publish Spot' : 'Continue'}
              <FiCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AddParking;
