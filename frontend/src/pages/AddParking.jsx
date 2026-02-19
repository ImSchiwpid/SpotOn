import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiDollarSign, FiMapPin, FiUpload } from 'react-icons/fi';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MainLayout } from '../components/layout';
import { parkingAPI } from '../utils/api';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

const DEFAULT_CENTER = [20.5937, 78.9629];

const MapClickPicker = ({ onSelect }) => {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng;
      onSelect([lat, lng]);
    }
  });
  return null;
};

const MapRecenter = ({ center }) => {
  const map = useMap();

  React.useEffect(() => {
    if (!Array.isArray(center) || center.length !== 2) return;
    map.setView(center, 14);
  }, [center, map]);

  return null;
};

const AddParking = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState([]);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [selectedCoords, setSelectedCoords] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    pricePerHour: '',
    totalSlots: '',
    amenities: '',
    vehicleTypes: ['car'],
    parkingType: 'open',
    hasCCTV: false,
    hasEVCharging: false,
    availabilityStart: 0,
    availabilityEnd: 24
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleVehicleTypeToggle = (type) => {
    setForm((prev) => {
      const hasType = prev.vehicleTypes.includes(type);
      return {
        ...prev,
        vehicleTypes: hasType
          ? prev.vehicleTypes.filter((item) => item !== type)
          : [...prev.vehicleTypes, type]
      };
    });
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files.slice(0, 5));
  };

  const markerPosition = useMemo(
    () => (selectedCoords && selectedCoords.length === 2 ? selectedCoords : null),
    [selectedCoords]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.address || !form.city || !form.state || !form.pricePerHour || !form.totalSlots) {
      toast.error('Please fill all required fields');
      return;
    }
    if (Number(form.availabilityStart) >= Number(form.availabilityEnd)) {
      toast.error('Availability start hour must be less than end hour');
      return;
    }

    const geocode = async (query) => {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) return null;

      const lat = Number(data[0].lat);
      const lng = Number(data[0].lon);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

      return { lat, lng };
    };

    const fullAddressQuery = [form.address, form.city, form.state, form.zipCode]
      .filter(Boolean)
      .join(', ');
    const cityStateQuery = [form.city, form.state].filter(Boolean).join(', ');

    let lat = DEFAULT_CENTER[0];
    let lng = DEFAULT_CENTER[1];
    if (markerPosition) {
      lat = markerPosition[0];
      lng = markerPosition[1];
    } else {
      let resolved = null;
      try {
        resolved = await geocode(fullAddressQuery);
        if (!resolved && cityStateQuery) {
          resolved = await geocode(cityStateQuery);
        }
      } catch (error) {
        resolved = null;
      }

      if (resolved) {
        lat = resolved.lat;
        lng = resolved.lng;
        setMapCenter([lat, lng]);
        setSelectedCoords([lat, lng]);
      } else {
        setMapCenter(DEFAULT_CENTER);
        toast('Exact address not found. Click on the map to set exact location.');
      }
    }

    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      toast.error('Selected map location is invalid.');
      return;
    }

    const payload = new FormData();
    payload.append('title', form.title);
    payload.append('description', form.description);
    payload.append('address', form.address);
    payload.append('city', form.city);
    payload.append('state', form.state);
    payload.append('zipCode', form.zipCode);
    payload.append('pricePerHour', form.pricePerHour);
    payload.append('totalSlots', form.totalSlots);
    payload.append('parkingType', form.parkingType);
    payload.append('hasCCTV', form.hasCCTV ? 'true' : 'false');
    payload.append('hasEVCharging', form.hasEVCharging ? 'true' : 'false');
    payload.append(
      'availability',
      JSON.stringify({
        startHour: Number(form.availabilityStart),
        endHour: Number(form.availabilityEnd)
      })
    );
    payload.append(
      'location',
      JSON.stringify({
        type: 'Point',
        coordinates: [lng, lat]
      })
    );
    payload.append(
      'amenities',
      JSON.stringify(
        form.amenities
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      )
    );
    payload.append('vehicleTypes', JSON.stringify(form.vehicleTypes.length ? form.vehicleTypes : ['car']));

    images.forEach((file) => payload.append('images', file));

    setSubmitting(true);
    try {
      await parkingAPI.create(payload);
      toast.success('Parking spot published successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish parking spot');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl border border-gray-100 shadow-card p-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Add New Parking Spot</h1>
        <p className="text-gray-500 mt-1">Fill details and publish your listing.</p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              placeholder="Downtown Plaza - Spot A12"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              placeholder="Describe your parking spot"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
            <div className="relative">
              <FiMapPin className="absolute left-3 top-3.5 text-gray-400" />
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl"
                placeholder="123 Main Street"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
            <input name="city" value={form.city} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
            <input name="state" value={form.state} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
            <input name="zipCode" value={form.zipCode} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price per Hour *</label>
            <div className="relative">
              <FiDollarSign className="absolute left-3 top-3.5 text-gray-400" />
              <input
                name="pricePerHour"
                type="number"
                min="0"
                value={form.pricePerHour}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Total Slots *</label>
            <input
              name="totalSlots"
              type="number"
              min="1"
              value={form.totalSlots}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Pick Exact Location *</label>
            <p className="text-xs text-gray-500 mb-2">
              Click on the map to place the parking marker. If you skip this, we will use the best address match.
            </p>
            <div className="h-72 rounded-2xl overflow-hidden border border-gray-200">
              <MapContainer center={mapCenter} zoom={5} className="h-full w-full">
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapRecenter center={mapCenter} />
                <MapClickPicker
                  onSelect={(coords) => {
                    setSelectedCoords(coords);
                    setMapCenter(coords);
                  }}
                />
                {markerPosition && <Marker position={markerPosition} />}
              </MapContainer>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {markerPosition
                ? `Selected: ${markerPosition[0].toFixed(6)}, ${markerPosition[1].toFixed(6)}`
                : 'No pin selected yet.'}
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Parking Type</label>
            <select
              name="parkingType"
              value={form.parkingType}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
            >
              <option value="open">Open</option>
              <option value="covered">Covered</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Hour</label>
            <input
              name="availabilityStart"
              type="number"
              min="0"
              max="23"
              value={form.availabilityStart}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Hour</label>
            <input
              name="availabilityEnd"
              type="number"
              min="1"
              max="24"
              value={form.availabilityEnd}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" name="hasCCTV" checked={form.hasCCTV} onChange={handleChange} />
              CCTV Available
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="hasEVCharging"
                checked={form.hasEVCharging}
                onChange={handleChange}
              />
              EV Charging
            </label>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities (comma separated)</label>
            <input
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              placeholder="Covered Parking, CCTV, EV Charging"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Types</label>
            <div className="flex flex-wrap gap-2">
              {['car', 'bike', 'truck', 'van'].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleVehicleTypeToggle(type)}
                  className={`px-4 py-2 rounded-xl border ${
                    form.vehicleTypes.includes(type)
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white border-gray-200 text-gray-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Images (max 5)</label>
            <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center cursor-pointer hover:border-primary-300 transition-colors">
              <FiUpload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Click to select images</p>
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
            </label>
            {images.length > 0 && <p className="text-sm text-gray-500 mt-2">{images.length} image(s) selected</p>}
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-60"
            >
              {submitting ? 'Publishing...' : 'Publish Spot'}
            </button>
          </div>
        </form>
      </motion.div>
    </MainLayout>
  );
};

export default AddParking;
