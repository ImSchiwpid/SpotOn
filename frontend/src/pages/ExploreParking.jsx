import React, { useContext, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { FiHeart, FiInfo, FiMapPin, FiSearch } from 'react-icons/fi';
import { MainLayout } from '../components/layout';
import { AuthContext, SocketContext } from '../App';
import { bookingAPI, carAPI, favoriteAPI, parkingAPI } from '../utils/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const FitBounds = ({ points }) => {
  const map = useMap();

  useEffect(() => {
    if (!points.length) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);

  return null;
};

let razorpayScriptPromise;

const loadRazorpayScript = () => {
  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  return razorpayScriptPromise;
};

const ExploreParking = () => {
  const { user } = useContext(AuthContext);
  const socket = useContext(SocketContext);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [cars, setCars] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    parkingType: '',
    hasCCTV: false,
    hasEVCharging: false,
    startTime: '',
    endTime: ''
  });
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    startTime: '',
    endTime: '',
    carId: '',
    specialRequests: ''
  });

  const fetchParking = async (city = '', extra = {}) => {
    setLoading(true);
    try {
      const params = {
        ...(city ? { city } : {}),
        ...(extra.minPrice ? { minPrice: extra.minPrice } : {}),
        ...(extra.maxPrice ? { maxPrice: extra.maxPrice } : {}),
        ...(extra.parkingType ? { parkingType: extra.parkingType } : {}),
        ...(extra.hasCCTV ? { hasCCTV: true } : {}),
        ...(extra.hasEVCharging ? { hasEVCharging: true } : {}),
        ...(extra.startTime ? { startTime: extra.startTime } : {}),
        ...(extra.endTime ? { endTime: extra.endTime } : {})
      };
      const response = await parkingAPI.getAll(params);
      const list = response?.data?.data || [];
      setParkingSpots(list);
      setSelectedSpot(list.length > 0 ? list[0] : null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load parking spots');
      setParkingSpots([]);
      setSelectedSpot(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const response = await parkingAPI.getCities();
      setCities(response?.data?.data || []);
    } catch (error) {
      setCities([]);
    }
  };

  const fetchCars = async () => {
    try {
      const response = await carAPI.getAll();
      setCars(response?.data?.data || []);
    } catch (error) {
      setCars([]);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await favoriteAPI.getMy();
      const list = response?.data?.data || [];
      setFavoriteIds(list.map((item) => item.parkingSpot?._id).filter(Boolean));
    } catch (error) {
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    fetchParking();
    fetchCities();
    fetchCars();
    fetchFavorites();
  }, []);

  useEffect(() => {
    if (!socket) return undefined;

    const applySpotAvailabilityUpdate = ({ parkingId, availableSlots }) => {
      if (!parkingId || typeof availableSlots !== 'number') return;

      setParkingSpots((prev) =>
        prev.map((spot) =>
          spot._id === parkingId
            ? {
                ...spot,
                availableSlots
              }
            : spot
        )
      );

      setSelectedSpot((prev) =>
        prev?._id === parkingId
          ? {
              ...prev,
              availableSlots
            }
          : prev
      );
    };

    const onSlotUpdated = (payload) => {
      applySpotAvailabilityUpdate(payload || {});
    };

    const onBookingConfirmed = (payload) => {
      applySpotAvailabilityUpdate(payload || {});
    };

    socket.on('slotUpdated', onSlotUpdated);
    socket.on('bookingConfirmed', onBookingConfirmed);

    return () => {
      socket.off('slotUpdated', onSlotUpdated);
      socket.off('bookingConfirmed', onBookingConfirmed);
    };
  }, [socket]);

  const filteredSpots = useMemo(() => {
    let list = parkingSpots;

    if (showFavoritesOnly) {
      list = list.filter((spot) => favoriteIds.includes(spot._id));
    }

    if (!searchText.trim()) return list;
    const q = searchText.toLowerCase();
    return list.filter(
      (spot) =>
        spot.title?.toLowerCase().includes(q) ||
        spot.address?.toLowerCase().includes(q) ||
        spot.city?.toLowerCase().includes(q)
    );
  }, [favoriteIds, parkingSpots, searchText, showFavoritesOnly]);

  const markerData = useMemo(() => {
    return filteredSpots
      .map((spot) => {
        const coords = spot?.location?.coordinates;
        if (!Array.isArray(coords) || coords.length !== 2) return null;
        const lng = Number(coords[0]);
        const lat = Number(coords[1]);
        if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
        return {
          spot,
          position: [lat, lng]
        };
      })
      .filter(Boolean);
  }, [filteredSpots]);

  const mapCenter = markerData.length > 0 ? markerData[0].position : [20.5937, 78.9629];
  const mapPoints = markerData.map((entry) => entry.position);

  const bookingSummary = useMemo(() => {
    const start = bookingForm.startTime ? new Date(bookingForm.startTime) : null;
    const end = bookingForm.endTime ? new Date(bookingForm.endTime) : null;

    if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return { hours: 0, amount: 0 };
    }

    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const amount = Number(selectedSpot?.pricePerHour || 0) * hours;
    return { hours, amount };
  }, [bookingForm.endTime, bookingForm.startTime, selectedSpot?.pricePerHour]);

  const openRazorpayCheckout = ({ booking, order }) => {
    const fallbackKey = process.env.REACT_APP_RAZORPAY_KEY_ID;
    const key = order?.key || fallbackKey;

    if (!key) {
      toast.error('Razorpay key is missing. Please configure REACT_APP_RAZORPAY_KEY_ID.');
      return;
    }

    const razorpay = new window.Razorpay({
      key,
      amount: order.amount,
      currency: order.currency || 'INR',
      name: 'SPOT-ON Parking',
      description: `Booking ${booking.bookingCode}`,
      order_id: order.id,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || ''
      },
      notes: {
        bookingId: booking._id,
        bookingCode: booking.bookingCode
      },
      theme: {
        color: '#0284c7'
      },
      handler: async (paymentResponse) => {
        try {
          await bookingAPI.verifyPayment({
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            bookingId: booking._id
          });
          toast.success('Booking confirmed and payment verified');
          setBookingForm({
            startTime: '',
            endTime: '',
            carId: '',
            specialRequests: ''
          });
          await fetchParking(selectedCity, filters);
        } catch (error) {
          toast.error(error.response?.data?.message || 'Payment verification failed');
        }
      },
      modal: {
        ondismiss: () => {
          toast('Payment cancelled. Booking remains pending in My Bookings.');
        }
      }
    });

    razorpay.on('payment.failed', (event) => {
      const message = event?.error?.description || 'Payment failed';
      toast.error(message);
    });

    razorpay.open();
  };

  const handleCreateBooking = async () => {
    if (!selectedSpot?._id) {
      toast.error('Please select a parking spot first');
      return;
    }

    if (!bookingForm.startTime || !bookingForm.endTime) {
      toast.error('Please choose start and end time');
      return;
    }

    const start = new Date(bookingForm.startTime);
    const end = new Date(bookingForm.endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      toast.error('Invalid booking time');
      return;
    }

    if (end <= start) {
      toast.error('End time must be after start time');
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      toast.error('Unable to load Razorpay checkout');
      return;
    }

    setBookingSubmitting(true);
    try {
      const response = await bookingAPI.create({
        parkingSpotId: selectedSpot._id,
        carId: bookingForm.carId || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        specialRequests: bookingForm.specialRequests.trim() || undefined
      });

      const booking = response?.data?.data?.booking;
      const order = response?.data?.data?.order;

      if (!booking || !order?.id) {
        toast.error('Booking created but payment order is missing');
        return;
      }

      openRazorpayCheckout({ booking, order });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingSubmitting(false);
    }
  };

  const isFavorite = (parkingId) => favoriteIds.includes(parkingId);

  const toggleFavorite = async (parkingId) => {
    const currentlyFavorite = isFavorite(parkingId);
    try {
      if (currentlyFavorite) {
        await favoriteAPI.remove(parkingId);
        setFavoriteIds((prev) => prev.filter((id) => id !== parkingId));
        toast.success('Removed from favorites');
      } else {
        await favoriteAPI.add(parkingId);
        setFavoriteIds((prev) => [...prev, parkingId]);
        toast.success('Added to favorites');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update favorites');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Explore Parking</h1>
            <p className="text-gray-500 mt-1">Live map with dynamic parking markers.</p>
          </div>
          <select
            value={selectedCity}
            onChange={async (e) => {
              const city = e.target.value;
              setSelectedCity(city);
              await fetchParking(city, filters);
            }}
            className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="relative max-w-2xl">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by title, address, or city..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl"
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={showFavoritesOnly}
            onChange={(e) => setShowFavoritesOnly(e.target.checked)}
          />
          Show favorites only
        </label>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="number"
            placeholder="Min price"
            value={filters.minPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-xl"
          />
          <input
            type="number"
            placeholder="Max price"
            value={filters.maxPrice}
            onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-xl"
          />
          <select
            value={filters.parkingType}
            onChange={(e) => setFilters((prev) => ({ ...prev, parkingType: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-xl"
          >
            <option value="">Any Type</option>
            <option value="open">Open</option>
            <option value="covered">Covered</option>
          </select>
          <button
            type="button"
            onClick={() => fetchParking(selectedCity, filters)}
            className="px-3 py-2 bg-primary-600 text-white rounded-xl"
          >
            Apply Filters
          </button>
          <input
            type="datetime-local"
            value={filters.startTime}
            onChange={(e) => setFilters((prev) => ({ ...prev, startTime: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-xl md:col-span-2"
          />
          <input
            type="datetime-local"
            value={filters.endTime}
            onChange={(e) => setFilters((prev) => ({ ...prev, endTime: e.target.value }))}
            className="px-3 py-2 border border-gray-200 rounded-xl md:col-span-2"
          />
          <label className="text-sm text-gray-700 flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={filters.hasCCTV}
              onChange={(e) => setFilters((prev) => ({ ...prev, hasCCTV: e.target.checked }))}
            />
            CCTV available
          </label>
          <label className="text-sm text-gray-700 flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              checked={filters.hasEVCharging}
              onChange={(e) => setFilters((prev) => ({ ...prev, hasEVCharging: e.target.checked }))}
            />
            EV charging
          </label>
        </div>

        {loading ? <p className="text-sm text-gray-500">Loading parking spots...</p> : null}
        {!loading && filteredSpots.length === 0 ? <p className="text-sm text-gray-500">No parking spots found.</p> : null}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
          <div className="xl:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
            <MapContainer center={mapCenter} zoom={12} style={{ height: 560, width: '100%' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <FitBounds points={mapPoints} />
              {markerData.map(({ spot, position }) => (
                <Marker
                  key={spot._id}
                  position={position}
                  eventHandlers={{ click: () => setSelectedSpot(spot) }}
                >
                  <Popup>
                    <strong>{spot.title}</strong>
                    <br />
                    {spot.city}
                    <br />
                    Slots: {spot.availableSlots}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          <div className="xl:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiInfo />
                Spot Details
              </h2>
              {!selectedSpot ? (
                <p className="text-sm text-gray-500 mt-4">Click a marker or card to view details.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-gray-900">{selectedSpot.title}</p>
                    <button
                      type="button"
                      onClick={() => toggleFavorite(selectedSpot._id)}
                      className={`px-2.5 py-1.5 text-xs rounded-lg border flex items-center gap-1 ${
                        isFavorite(selectedSpot._id)
                          ? 'bg-red-50 border-red-200 text-red-700'
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      <FiHeart className={isFavorite(selectedSpot._id) ? 'fill-current' : ''} />
                      {isFavorite(selectedSpot._id) ? 'Saved' : 'Save'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {selectedSpot.address}, {selectedSpot.city}, {selectedSpot.state}
                  </p>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="text-sm font-semibold">₹</span>
                    {selectedSpot.pricePerHour}/hour
                  </p>
                  <p className="text-sm text-gray-600">
                    Slots: {selectedSpot.availableSlots}/{selectedSpot.totalSlots}
                  </p>
                  <p className="text-sm text-gray-600">
                    Vehicle Types: {(selectedSpot.vehicleTypes || []).join(', ') || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Amenities: {(selectedSpot.amenities || []).join(', ') || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Type: {selectedSpot.parkingType || 'open'} | CCTV: {selectedSpot.hasCCTV ? 'Yes' : 'No'} | EV:{' '}
                    {selectedSpot.hasEVCharging ? 'Yes' : 'No'}
                  </p>
                  <div className="pt-4 border-t border-gray-100 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900">Create Booking</h3>
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="datetime-local"
                        value={bookingForm.startTime}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            startTime: e.target.value
                          }))
                        }
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                      />
                      <input
                        type="datetime-local"
                        value={bookingForm.endTime}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            endTime: e.target.value
                          }))
                        }
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                      />
                      <select
                        value={bookingForm.carId}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            carId: e.target.value
                          }))
                        }
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                      >
                        <option value="">No car selected (optional)</option>
                        {cars.map((car) => (
                          <option key={car._id} value={car._id}>
                            {car.name} ({car.numberPlate})
                          </option>
                        ))}
                      </select>
                      <textarea
                        value={bookingForm.specialRequests}
                        onChange={(e) =>
                          setBookingForm((prev) => ({
                            ...prev,
                            specialRequests: e.target.value
                          }))
                        }
                        rows={2}
                        placeholder="Special requests (optional)"
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Estimated: {bookingSummary.hours} hour(s) | Rs. {bookingSummary.amount}
                    </p>
                    <button
                      type="button"
                      onClick={handleCreateBooking}
                      disabled={bookingSubmitting}
                      className="w-full px-3 py-2 bg-primary-600 text-white rounded-xl text-sm disabled:opacity-60"
                    >
                      {bookingSubmitting ? 'Creating booking...' : 'Book & Pay'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5 max-h-[360px] overflow-auto">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Results ({filteredSpots.length})</h2>
              <div className="space-y-3">
                {filteredSpots.map((spot, index) => (
                  <motion.button
                    key={spot._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    type="button"
                    onClick={() => setSelectedSpot(spot)}
                    className={`w-full text-left border rounded-xl p-3 transition-colors ${
                      selectedSpot?._id === spot._id ? 'border-primary-500 bg-primary-50/40' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900">{spot.title}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(spot._id);
                        }}
                        className={`p-1.5 rounded-lg border ${
                          isFavorite(spot._id)
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-gray-50 border-gray-200 text-gray-600'
                        }`}
                      >
                        <FiHeart className={`w-3.5 h-3.5 ${isFavorite(spot._id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">{spot.city}</p>
                    <p className="text-xs text-gray-500">Slots: {spot.availableSlots}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExploreParking;
