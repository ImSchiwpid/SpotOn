import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiHeart, FiMapPin } from 'react-icons/fi';
import { MainLayout } from '../components/layout';
import { favoriteAPI } from '../utils/api';

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await favoriteAPI.getMy();
      setFavorites(response.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const removeFavorite = async (parkingId) => {
    try {
      await favoriteAPI.remove(parkingId);
      toast.success('Removed from favorites');
      setFavorites((prev) => prev.filter((item) => item.parkingSpot?._id !== parkingId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove favorite');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          {loading && <p className="text-gray-500">Loading favorites...</p>}
          {!loading && favorites.length === 0 && <p className="text-gray-500">No favorite parking spots yet.</p>}

          {!loading && favorites.length > 0 && (
            <div className="space-y-3">
              {favorites.map((item) => {
                const spot = item.parkingSpot;
                return (
                  <div key={item._id} className="border border-gray-200 rounded-xl p-4 flex justify-between items-center gap-3">
                    <button
                      type="button"
                      onClick={() => navigate('/explore')}
                      className="text-left flex-1"
                    >
                      <p className="font-semibold text-gray-900">{spot?.title}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <FiMapPin className="w-4 h-4" />
                        {spot?.address}, {spot?.city}, {spot?.state}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Rs. {spot?.pricePerHour}/hour | Slots: {spot?.availableSlots}/{spot?.totalSlots}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFavorite(spot?._id)}
                      className="px-3 py-2 bg-red-50 text-red-700 rounded-lg flex items-center gap-1"
                    >
                      <FiHeart className="fill-current" />
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Favorites;
