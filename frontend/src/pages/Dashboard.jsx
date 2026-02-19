import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MainLayout } from '../components/layout';
import { AuthContext } from '../App';
import { adminAPI, bookingAPI, ownerAPI } from '../utils/api';
import { normalizeRole } from '../utils/roles';

const StatCard = ({ label, value }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
  </div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const role = normalizeRole(user?.role);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        if (role === 'admin') {
          const response = await adminAPI.getDashboard();
          setData(response.data?.data);
        } else if (role === 'parking_owner') {
          const response = await ownerAPI.getDashboard();
          setData(response.data?.data);
        } else {
          const [bookings, payments] = await Promise.all([
            bookingAPI.getMy(),
            bookingAPI.getPaymentHistory()
          ]);
          setData({
            bookings: bookings.data?.data || [],
            payments: payments.data?.data || []
          });
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [role]);

  if (loading) {
    return (
      <MainLayout>
        <p className="text-gray-500">Loading dashboard...</p>
      </MainLayout>
    );
  }

  if (role === 'admin') {
    const overview = data?.overview || {};
    return (
      <MainLayout>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={overview.totalUsers || 0} />
          <StatCard label="Parking Spots" value={overview.totalParkingSpots || 0} />
          <StatCard label="Total Bookings" value={overview.totalBookings || 0} />
          <StatCard label="Revenue" value={`Rs. ${overview.totalRevenue || 0}`} />
        </div>
      </MainLayout>
    );
  }

  if (role === 'parking_owner') {
    return (
      <MainLayout>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Owner Dashboard</h1>
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="Listed Spots" value={data?.totalSpots || 0} />
          <StatCard label="Total Bookings" value={data?.totalBookings || 0} />
          <StatCard label="Earnings" value={`Rs. ${data?.totalEarnings || 0}`} />
          <StatCard label="Occupancy Rate" value={`${data?.occupancyRate || 0}%`} />
        </div>
      </MainLayout>
    );
  }

  const myBookings = data?.bookings || [];
  const paidPayments = data?.payments || [];
  return (
    <MainLayout>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Customer Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="My Bookings" value={myBookings.length} />
        <StatCard label="Payments" value={paidPayments.length} />
        <StatCard
          label="Total Spent"
          value={`Rs. ${paidPayments.reduce((sum, item) => sum + (item.amount || 0), 0)}`}
        />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
