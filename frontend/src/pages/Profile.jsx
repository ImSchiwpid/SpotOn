import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AuthContext } from '../App';
import { authAPI, carAPI, complaintAPI, ownerAPI } from '../utils/api';
import { MainLayout } from '../components/layout';
import { normalizeRole } from '../utils/roles';

const emptyCar = { name: '', numberPlate: '', type: 'car', color: '' };

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const role = normalizeRole(user?.role);

  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cars, setCars] = useState([]);
  const [carForm, setCarForm] = useState(emptyCar);
  const [complaintForm, setComplaintForm] = useState({ subject: '', category: 'other', description: '' });
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    bankName: ''
  });

  useEffect(() => {
    if (user) setProfileForm({ name: user.name || '', phone: user.phone || '' });
  }, [user]);

  const loadCars = async () => {
    try {
      const response = await carAPI.getAll();
      setCars(response.data?.data || []);
    } catch (error) {
      setCars([]);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const saveProfile = async () => {
    try {
      const response = await authAPI.updateProfile(profileForm);
      const updated = response.data?.data;
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImageFile) {
      toast.error('Please select an image first');
      return;
    }

    const formData = new FormData();
    formData.append('profileImage', profileImageFile);

    try {
      setUploadingImage(true);
      const response = await authAPI.updateProfileImage(formData);
      const updated = response.data?.data;
      setUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setProfileImageFile(null);
      toast.success('Profile image updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload profile image');
    } finally {
      setUploadingImage(false);
    }
  };

  const addCar = async () => {
    try {
      await carAPI.create(carForm);
      setCarForm(emptyCar);
      toast.success('Vehicle added');
      await loadCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const deleteCar = async (id) => {
    try {
      await carAPI.delete(id);
      toast.success('Vehicle deleted');
      await loadCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete vehicle');
    }
  };

  const setDefaultCar = async (id) => {
    try {
      await carAPI.setDefault(id);
      toast.success('Default vehicle updated');
      await loadCars();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set default vehicle');
    }
  };

  const submitComplaint = async () => {
    try {
      await complaintAPI.create(complaintForm);
      setComplaintForm({ subject: '', category: 'other', description: '' });
      toast.success('Complaint submitted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const requestWithdrawal = async () => {
    try {
      await ownerAPI.requestWithdrawal({
        amount: Number(withdrawForm.amount),
        bankDetails: {
          accountHolderName: withdrawForm.accountHolderName,
          accountNumber: withdrawForm.accountNumber,
          ifsc: withdrawForm.ifsc,
          bankName: withdrawForm.bankName
        }
      });
      toast.success('Withdrawal request submitted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request withdrawal');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account</h2>
          <div className="flex items-center gap-4 mb-4">
            <img
              src={
                user?.profileImage ||
                'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
              }
              alt={user?.name || 'Profile'}
              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
            />
            <div className="flex-1 flex flex-wrap gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                className="text-sm"
              />
              <button
                onClick={uploadProfileImage}
                disabled={uploadingImage}
                className="px-3 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-60"
              >
                {uploadingImage ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <input
              value={profileForm.name}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Name"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
            <input
              value={profileForm.phone}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="Phone"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
          <button onClick={saveProfile} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">
            Save Profile
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">My Vehicles</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <input
              value={carForm.name}
              onChange={(e) => setCarForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Vehicle name"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
            <input
              value={carForm.numberPlate}
              onChange={(e) => setCarForm((prev) => ({ ...prev, numberPlate: e.target.value }))}
              placeholder="Number plate"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
            <select
              value={carForm.type}
              onChange={(e) => setCarForm((prev) => ({ ...prev, type: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
            </select>
            <button onClick={addCar} className="bg-primary-600 text-white rounded-lg px-3 py-2">
              Add Vehicle
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {cars.map((car) => (
              <div key={car._id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                <p className="text-sm text-gray-700">
                  {car.name} ({car.numberPlate}) - {car.type} {car.isDefault ? '[Default]' : ''}
                </p>
                <div className="flex gap-2">
                  {!car.isDefault && (
                    <button onClick={() => setDefaultCar(car._id)} className="px-2 py-1 text-xs bg-gray-900 text-white rounded">
                      Set Default
                    </button>
                  )}
                  <button onClick={() => deleteCar(car._id)} className="px-2 py-1 text-xs bg-red-600 text-white rounded">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Raise Complaint</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={complaintForm.subject}
              onChange={(e) => setComplaintForm((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Subject"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
            <select
              value={complaintForm.category}
              onChange={(e) => setComplaintForm((prev) => ({ ...prev, category: e.target.value }))}
              className="border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value="other">Other</option>
              <option value="payment">Payment</option>
              <option value="parking">Parking</option>
              <option value="behavior">Behavior</option>
              <option value="refund">Refund</option>
            </select>
            <button onClick={submitComplaint} className="bg-primary-600 text-white rounded-lg px-3 py-2">
              Submit
            </button>
            <textarea
              value={complaintForm.description}
              onChange={(e) => setComplaintForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Complaint description"
              rows={3}
              className="md:col-span-3 border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        {role === 'parking_owner' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Withdraw Earnings</h2>
            <div className="grid md:grid-cols-3 gap-3">
              <input
                value={withdrawForm.amount}
                onChange={(e) => setWithdrawForm((prev) => ({ ...prev, amount: e.target.value }))}
                placeholder="Amount"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
              <input
                value={withdrawForm.accountHolderName}
                onChange={(e) => setWithdrawForm((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                placeholder="Account holder"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
              <input
                value={withdrawForm.accountNumber}
                onChange={(e) => setWithdrawForm((prev) => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="Account number"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
              <input
                value={withdrawForm.ifsc}
                onChange={(e) => setWithdrawForm((prev) => ({ ...prev, ifsc: e.target.value }))}
                placeholder="IFSC"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
              <input
                value={withdrawForm.bankName}
                onChange={(e) => setWithdrawForm((prev) => ({ ...prev, bankName: e.target.value }))}
                placeholder="Bank name"
                className="border border-gray-200 rounded-lg px-3 py-2"
              />
              <button onClick={requestWithdrawal} className="bg-primary-600 text-white rounded-lg px-3 py-2">
                Request Withdrawal
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
