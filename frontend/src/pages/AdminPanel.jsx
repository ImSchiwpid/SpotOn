import React, { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell
} from 'recharts';
import { MainLayout } from '../components/layout';
import { adminAPI } from '../utils/api';

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

const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'users', label: 'Users' },
  { key: 'pending', label: 'Pending' },
  { key: 'transactions', label: 'Transactions' }
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [commission, setCommission] = useState(15);

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [userPage, setUserPage] = useState(1);
  const [userPages, setUserPages] = useState(1);

  const [pendingSpots, setPendingSpots] = useState([]);
  const [spotPage, setSpotPage] = useState(1);
  const [spotPages, setSpotPages] = useState(1);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [withdrawPage, setWithdrawPage] = useState(1);
  const [withdrawPages, setWithdrawPages] = useState(1);
  const [pendingLoading, setPendingLoading] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionQuery, setTransactionQuery] = useState('');
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPages, setTransactionPages] = useState(1);

  const pageLimit = 10;

  const loadOverview = useCallback(async () => {
    try {
      setLoadingOverview(true);
      const [dashboardRes, complaintsRes, settingsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getComplaints(),
        adminAPI.getSettings()
      ]);

      setDashboard(dashboardRes.data?.data || null);
      setComplaints(complaintsRes.data?.data || []);
      setCommission(settingsRes.data?.data?.commissionPercent ?? 15);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load admin overview');
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const response = await adminAPI.getUsers({ page: userPage, limit: pageLimit });
      setUsers(response.data?.data || []);
      setUserPages(response.data?.pages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users');
      setUsers([]);
      setUserPages(1);
    } finally {
      setUsersLoading(false);
    }
  }, [userPage]);

  const loadPending = useCallback(async () => {
    try {
      setPendingLoading(true);
      const [pendingRes, withdrawalRes] = await Promise.all([
        adminAPI.getPendingApprovals({ page: spotPage, limit: pageLimit }),
        adminAPI.getWithdrawals({ status: 'pending', page: withdrawPage, limit: pageLimit })
      ]);
      setPendingSpots(pendingRes.data?.data || []);
      setSpotPages(pendingRes.data?.pages || 1);
      setPendingWithdrawals(withdrawalRes.data?.data || []);
      setWithdrawPages(withdrawalRes.data?.pages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load pending items');
      setPendingSpots([]);
      setPendingWithdrawals([]);
      setSpotPages(1);
      setWithdrawPages(1);
    } finally {
      setPendingLoading(false);
    }
  }, [spotPage, withdrawPage]);

  const loadTransactions = useCallback(async () => {
    try {
      setTransactionsLoading(true);
      const response = await adminAPI.getTransactions({ page: transactionPage, limit: pageLimit });
      setTransactions(response.data?.data || []);
      setTransactionPages(response.data?.pages || 1);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load transactions');
      setTransactions([]);
      setTransactionPages(1);
    } finally {
      setTransactionsLoading(false);
    }
  }, [transactionPage]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    }
  }, [activeTab, loadUsers]);

  useEffect(() => {
    if (activeTab === 'pending') {
      loadPending();
    }
  }, [activeTab, loadPending]);

  useEffect(() => {
    if (activeTab === 'transactions') {
      loadTransactions();
    }
  }, [activeTab, loadTransactions]);

  const approveSpot = async (id) => {
    try {
      await adminAPI.approveParkingSpot(id);
      toast.success('Parking spot approved');
      await Promise.all([loadPending(), loadOverview()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve spot');
    }
  };

  const processWithdrawal = async (id, status) => {
    try {
      await adminAPI.processWithdrawal(id, { status });
      toast.success(`Withdrawal ${status}`);
      await Promise.all([loadPending(), loadOverview()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process withdrawal');
    }
  };

  const suspendUser = async (id, suspend) => {
    try {
      await adminAPI.suspendUser(id, suspend);
      toast.success(suspend ? 'User suspended' : 'User activated');
      await Promise.all([loadUsers(), loadOverview()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const verifyOwner = async (id) => {
    try {
      await adminAPI.verifyOwner(id);
      toast.success('Owner verified');
      await Promise.all([loadUsers(), loadOverview()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify owner');
    }
  };

  const deleteUser = async (id, name) => {
    const confirmed = window.confirm(`Delete user "${name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted');
      await Promise.all([loadUsers(), loadOverview()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const updateCommission = async () => {
    try {
      await adminAPI.updateCommission(Number(commission));
      toast.success('Commission updated');
      await loadOverview();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update commission');
    }
  };

  const revenueByMonth = useMemo(() => {
    const rows = dashboard?.revenueByMonth || [];
    return rows.map((row) => ({
      month: monthLabel(row?._id?.year, row?._id?.month),
      revenue: Number(row?.revenue || 0),
      count: Number(row?.count || 0)
    }));
  }, [dashboard]);

  const bookingsByStatus = useMemo(() => {
    const rows = dashboard?.bookingsByStatus || [];
    return rows.map((row) => ({
      name: row?._id || 'unknown',
      value: Number(row?.count || 0)
    }));
  }, [dashboard]);

  const topCitiesData = useMemo(() => {
    const rows = dashboard?.topCities || [];
    return rows.map((row) => ({
      city: row?._id || 'Unknown',
      bookings: Number(row?.bookings || 0),
      revenue: Number(row?.revenue || 0)
    }));
  }, [dashboard]);

  const peakHourData = useMemo(() => {
    const rows = dashboard?.peakHours || [];
    return rows.map((row) => ({
      hour: `${String(row?._id ?? 0).padStart(2, '0')}:00`,
      bookings: Number(row?.bookings || 0)
    }));
  }, [dashboard]);

  const recentComplaints = useMemo(() => complaints.slice(0, 8), [complaints]);

  const filteredUsers = useMemo(() => {
    const q = userQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q));
  }, [users, userQuery]);

  const filteredTransactions = useMemo(() => {
    const q = transactionQuery.trim().toLowerCase();
    if (!q) return transactions;
    return transactions.filter((tx) =>
      `${tx.type} ${tx.description} ${tx.status} ${tx.user?.name || ''} ${tx.user?.email || ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [transactions, transactionQuery]);

  const renderOverview = () => {
    if (loadingOverview) {
      return <p className="text-gray-500">Loading admin overview...</p>;
    }

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={dashboard?.overview?.totalUsers || 0} />
          <StatCard label="Parking Spots" value={dashboard?.overview?.totalParkingSpots || 0} />
          <StatCard label="Total Bookings" value={dashboard?.overview?.totalBookings || 0} />
          <StatCard label="Platform Revenue" value={formatCurrency(dashboard?.overview?.totalRevenue || 0)} />
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(v, key) => (key === 'revenue' ? formatCurrency(v) : v)} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} name="Revenue" />
                  <Line type="monotone" dataKey="count" stroke="#22c55e" strokeWidth={2} name="Paid Bookings" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Status</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={bookingsByStatus} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} label>
                    {bookingsByStatus.map((entry, index) => (
                      <Cell key={entry.name} fill={['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#6366f1'][index % 5]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Cities by Bookings</h2>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={topCitiesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis allowDecimals={false} />
                  <Tooltip formatter={(v, key) => (key === 'revenue' ? formatCurrency(v) : v)} />
                  <Legend />
                  <Bar dataKey="bookings" fill="#22c55e" name="Bookings" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Peak Start Hours</h2>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <BarChart data={peakHourData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="bookings" fill="#f59e0b" name="Bookings" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Platform Commission</h2>
          <div className="flex gap-3">
            <input
              type="number"
              min="0"
              max="100"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
            <button onClick={updateCommission} className="px-4 py-2 bg-gray-900 text-white rounded-lg">
              Save
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">Recent Complaints</h2>
          <div className="space-y-2">
            {recentComplaints.length === 0 && <p className="text-gray-500">No complaints found.</p>}
            {recentComplaints.map((c) => (
              <div key={c._id} className="border border-gray-200 rounded-lg p-3">
                <p className="font-medium text-gray-900">{c.subject}</p>
                <p className="text-sm text-gray-500">{c.description}</p>
                <p className="text-xs text-gray-500 mt-1">Status: {c.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderUsers = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <input
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
          placeholder="Search users..."
          className="border border-gray-200 rounded-lg px-3 py-2 md:w-72"
        />
      </div>

      {usersLoading && <p className="text-gray-500">Loading users...</p>}
      {!usersLoading && filteredUsers.length === 0 && <p className="text-gray-500">No users found.</p>}

      {!usersLoading && filteredUsers.length > 0 && (
        <div className="space-y-2">
          {filteredUsers.map((u) => (
            <div key={u._id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
              <p className="text-gray-700">
                {u.name} ({u.role}) | {u.email} | {u.isActive ? 'Active' : 'Suspended'}
              </p>
              <div className="flex gap-2">
                {u.role === 'parking_owner' && u.ownerVerificationStatus !== 'verified' && (
                  <button onClick={() => verifyOwner(u._id)} className="px-2 py-1 bg-blue-600 text-white rounded">
                    Verify Owner
                  </button>
                )}
                <button
                  onClick={() => suspendUser(u._id, u.isActive)}
                  className={`px-2 py-1 text-white rounded ${u.isActive ? 'bg-red-600' : 'bg-green-600'}`}
                >
                  {u.isActive ? 'Suspend' : 'Activate'}
                </button>
                <button onClick={() => deleteUser(u._id, u.name)} className="px-2 py-1 bg-gray-900 text-white rounded">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">Page {userPage} of {userPages}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setUserPage((prev) => Math.max(prev - 1, 1))}
            disabled={userPage <= 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setUserPage((prev) => (prev < userPages ? prev + 1 : prev))}
            disabled={userPage >= userPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  const renderPending = () => (
    <div className="space-y-6">
      {pendingLoading && <p className="text-gray-500">Loading pending items...</p>}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Pending Parking Approvals</h2>
        <div className="space-y-2">
          {!pendingLoading && pendingSpots.length === 0 && <p className="text-gray-500">No pending parking approvals.</p>}
          {pendingSpots.map((spot) => (
            <div key={spot._id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
              <p className="text-gray-700">
                {spot.title} - {spot.city}
              </p>
              <button onClick={() => approveSpot(spot._id)} className="px-2 py-1 bg-green-600 text-white rounded">
                Approve
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {spotPage} of {spotPages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSpotPage((prev) => Math.max(prev - 1, 1))}
              disabled={spotPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setSpotPage((prev) => (prev < spotPages ? prev + 1 : prev))}
              disabled={spotPage >= spotPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">Pending Withdrawal Requests</h2>
        <div className="space-y-2">
          {!pendingLoading && pendingWithdrawals.length === 0 && <p className="text-gray-500">No pending withdrawals.</p>}
          {pendingWithdrawals.map((w) => (
            <div key={w._id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
              <p className="text-gray-700">
                {w.owner?.name} | {formatCurrency(w.amount)} | {w.status}
              </p>
              <div className="flex gap-2">
                <button onClick={() => processWithdrawal(w._id, 'paid')} className="px-2 py-1 bg-green-600 text-white rounded">
                  Mark Paid
                </button>
                <button onClick={() => processWithdrawal(w._id, 'rejected')} className="px-2 py-1 bg-red-600 text-white rounded">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {withdrawPage} of {withdrawPages}</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWithdrawPage((prev) => Math.max(prev - 1, 1))}
              disabled={withdrawPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => setWithdrawPage((prev) => (prev < withdrawPages ? prev + 1 : prev))}
              disabled={withdrawPage >= withdrawPages}
              className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTransactions = () => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
        <input
          value={transactionQuery}
          onChange={(e) => setTransactionQuery(e.target.value)}
          placeholder="Search transactions..."
          className="border border-gray-200 rounded-lg px-3 py-2 md:w-72"
        />
      </div>

      {transactionsLoading && <p className="text-gray-500">Loading transactions...</p>}
      {!transactionsLoading && filteredTransactions.length === 0 && <p className="text-gray-500">No transactions found.</p>}

      {!transactionsLoading && filteredTransactions.length > 0 && (
        <div className="space-y-2">
          {filteredTransactions.map((tx) => (
            <div key={tx._id} className="border border-gray-200 rounded-lg p-3 flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-900">{tx.description}</p>
                <p className="text-sm text-gray-500">
                  {tx.type} | {tx.status} | {tx.user?.name || 'N/A'} | {new Date(tx.createdAt).toLocaleString()}
                </p>
              </div>
              <p className={`font-semibold ${tx.amount >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {tx.amount > 0 ? '+' : ''}
                {formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">Page {transactionPage} of {transactionPages}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTransactionPage((prev) => Math.max(prev - 1, 1))}
            disabled={transactionPage <= 1}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setTransactionPage((prev) => (prev < transactionPages ? prev + 1 : prev))}
            disabled={transactionPage >= transactionPages}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-2 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === tab.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'pending' && renderPending()}
        {activeTab === 'transactions' && renderTransactions()}
      </div>
    </MainLayout>
  );
};

export default AdminPanel;
