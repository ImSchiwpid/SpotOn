import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { MainLayout } from '../components/layout';
import { ownerAPI, parkingAPI } from '../utils/api';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0);

const monthLabel = (year, month) =>
  new Date(year, month - 1, 1).toLocaleString('en-IN', { month: 'short' });

const StatCard = ({ label, value, helper }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    {helper ? <p className="text-xs text-gray-500 mt-1">{helper}</p> : null}
  </div>
);

const OwnerPanel = () => {
  const [dashboard, setDashboard] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [spots, setSpots] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardRes, bookingsRes, spotsRes, txRes] = await Promise.all([
        ownerAPI.getDashboard(),
        ownerAPI.getBookings(),
        parkingAPI.getMy(),
        ownerAPI.getTransactions()
      ]);
      setDashboard(dashboardRes.data?.data || null);
      setBookings(bookingsRes.data?.data || []);
      setSpots(spotsRes.data?.data || []);
      setTransactions(txRes.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load owner data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const decide = async (bookingId, decision) => {
    try {
      await ownerAPI.decideBooking(bookingId, { decision });
      toast.success(`Booking ${decision}`);
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update booking');
    }
  };

  const toggleMaintenance = async (spotId, enabled) => {
    try {
      await ownerAPI.setMaintenance(spotId, { enabled, reason: enabled ? 'Maintenance' : '' });
      toast.success('Parking availability updated');
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update maintenance mode');
    }
  };

  const monthlyRevenueData = useMemo(() => {
    const rows = dashboard?.monthlyRevenue || [];
    return rows.map((item) => ({
      month: monthLabel(item?._id?.year, item?._id?.month),
      revenue: Number(item?.revenue || 0)
    }));
  }, [dashboard]);

  const bookingStatusData = useMemo(() => {
    const counts = bookings.reduce(
      (acc, booking) => {
        const status = booking.status || 'pending';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      },
      { pending: 0, confirmed: 0, completed: 0, cancelled: 0, failed: 0 }
    );

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  const occupancyData = useMemo(() => {
    const rate = Number(dashboard?.occupancyRate || 0);
    const occupied = Math.max(0, Math.min(100, Number(rate.toFixed(2))));
    return [
      { name: 'Occupied', value: occupied },
      { name: 'Available', value: Number((100 - occupied).toFixed(2)) }
    ];
  }, [dashboard]);

  const pendingOwnerDecisions = useMemo(
    () => bookings.filter((b) => b.ownerDecision === 'pending').slice(0, 8),
    [bookings]
  );

  const recentTransactions = useMemo(() => transactions.slice(0, 10), [transactions]);

  if (loading) {
    return (
      <MainLayout>
        <p className="text-gray-500">Loading owner dashboard...</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Owner Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="Listed Spots" value={dashboard?.totalSpots || 0} />
          <StatCard label="Paid Bookings" value={dashboard?.totalBookings || 0} />
          <StatCard label="Total Earnings" value={formatCurrency(dashboard?.totalEarnings || 0)} />
          <StatCard label="Occupancy" value={`${dashboard?.occupancyRate || 0}%`} helper="Across all your spots" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={monthlyRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v) => formatCurrency(v)} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Occupancy Split</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={occupancyData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={100} label>
                    <Cell fill="#0ea5e9" />
                    <Cell fill="#d1fae5" />
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Bookings by Status</h2>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={bookingStatusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#22c55e" name="Bookings" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Incoming Booking Decisions</h2>
          <div className="space-y-2">
            {pendingOwnerDecisions.length === 0 && <p className="text-gray-500">No pending decisions.</p>}
            {pendingOwnerDecisions.map((booking) => (
              <div key={booking._id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-900">{booking.parkingSpot?.title}</p>
                  <p className="text-sm text-gray-500">
                    {booking.user?.name} | {booking.status} | {formatCurrency(booking.totalAmount)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => decide(booking._id, 'approved')} className="px-2 py-1 bg-green-600 text-white rounded">
                    Approve
                  </button>
                  <button onClick={() => decide(booking._id, 'rejected')} className="px-2 py-1 bg-red-600 text-white rounded">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Manage Spot Availability</h2>
          <div className="space-y-2">
            {spots.length === 0 && <p className="text-gray-500">No spots listed yet.</p>}
            {spots.map((spot) => (
              <div key={spot._id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                <p className="text-gray-900">
                  {spot.title} ({spot.city}) - {spot.isMaintenanceMode ? 'Maintenance' : 'Active'}
                </p>
                <button
                  onClick={() => toggleMaintenance(spot._id, !spot.isMaintenanceMode)}
                  className="px-2 py-1 bg-gray-900 text-white rounded"
                >
                  {spot.isMaintenanceMode ? 'Mark Active' : 'Set Maintenance'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Recent Transactions</h2>
          <div className="space-y-2">
            {recentTransactions.length === 0 && <p className="text-gray-500">No transactions yet.</p>}
            {recentTransactions.map((tx) => (
              <div key={tx._id} className="border border-gray-200 rounded-lg p-3 flex justify-between">
                <p className="text-gray-700">
                  {tx.description}
                  <span className="block text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()}</span>
                </p>
                <p className={`font-medium ${tx.amount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {tx.amount > 0 ? '+' : ''}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OwnerPanel;
