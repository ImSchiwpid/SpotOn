import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { MainLayout } from '../components/layout';
import { carAPI } from '../utils/api';

const emptyForm = {
  name: '',
  numberPlate: '',
  type: 'car',
  color: '',
  isDefault: false
};

const Cars = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState('');
  const [query, setQuery] = useState('');

  const loadCars = async () => {
    try {
      setLoading(true);
      const response = await carAPI.getAll();
      setCars(response.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load cars');
      setCars([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const filteredCars = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return cars;
    return cars.filter((car) =>
      `${car.name} ${car.numberPlate} ${car.type} ${car.color || ''}`.toLowerCase().includes(search)
    );
  }, [cars, query]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId('');
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error('Vehicle name is required');
      return false;
    }
    if (!form.numberPlate.trim()) {
      toast.error('Number plate is required');
      return false;
    }
    return true;
  };

  const submitForm = async () => {
    if (!validateForm()) return;

    const payload = {
      name: form.name.trim(),
      numberPlate: form.numberPlate.trim().toUpperCase(),
      type: form.type,
      color: form.color.trim(),
      isDefault: !!form.isDefault
    };

    try {
      setSaving(true);
      if (editingId) {
        await carAPI.update(editingId, payload);
        toast.success('Vehicle updated');
      } else {
        await carAPI.create(payload);
        toast.success('Vehicle added');
      }
      resetForm();
      await loadCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const editCar = (car) => {
    setEditingId(car._id);
    setForm({
      name: car.name || '',
      numberPlate: car.numberPlate || '',
      type: car.type || 'car',
      color: car.color || '',
      isDefault: !!car.isDefault
    });
  };

  const removeCar = async (id) => {
    try {
      await carAPI.delete(id);
      toast.success('Vehicle deleted');
      if (editingId === id) resetForm();
      await loadCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const markDefault = async (id) => {
    try {
      await carAPI.setDefault(id);
      toast.success('Default vehicle updated');
      await loadCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set default vehicle');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Car Management</h1>
          <p className="text-gray-500 mt-1">Add, update, delete, and set your default vehicle.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Vehicle name/model"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
            <input
              value={form.numberPlate}
              onChange={(e) => setForm((prev) => ({ ...prev, numberPlate: e.target.value.toUpperCase() }))}
              placeholder="Number plate"
              className="border border-gray-200 rounded-lg px-3 py-2 uppercase"
            />
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
            </select>
            <input
              value={form.color}
              onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
              placeholder="Color (optional)"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
          <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(e) => setForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
            />
            Set as default vehicle
          </label>
          <div className="mt-4 flex gap-2">
            <button
              onClick={submitForm}
              disabled={saving}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-60"
            >
              {saving ? 'Saving...' : editingId ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
            {editingId && (
              <button onClick={resetForm} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg">
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">My Vehicles</h2>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or plate..."
              className="border border-gray-200 rounded-lg px-3 py-2 md:w-72"
            />
          </div>

          {loading && <p className="text-gray-500">Loading vehicles...</p>}
          {!loading && filteredCars.length === 0 && <p className="text-gray-500">No vehicles found.</p>}

          {!loading && filteredCars.length > 0 && (
            <div className="space-y-3">
              {filteredCars.map((car) => (
                <div key={car._id} className="border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {car.name} {car.isDefault ? <span className="text-xs text-primary-700">[Default]</span> : null}
                    </p>
                    <p className="text-sm text-gray-600">
                      {car.numberPlate} | {car.type} {car.color ? `| ${car.color}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!car.isDefault && (
                      <button
                        onClick={() => markDefault(car._id)}
                        className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => editCar(car)}
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeCar(car._id)}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Cars;
