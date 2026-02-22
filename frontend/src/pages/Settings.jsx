import React, { useContext, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { MainLayout } from '../components/layout';
import { AuthContext } from '../App';
import { authAPI, complaintAPI } from '../utils/api';

const SETTINGS_STORAGE_KEY = 'spoton_settings_v1';

const defaultSettings = {
  parkingPreferences: {
    defaultCity: '',
    preferredVehicleType: 'car',
    maxDistanceKm: 5
  },
  paymentPreferences: {
    preferredMethod: 'upi',
    upiId: '',
    autoPayEnabled: false
  }
};

const loadSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return {
      parkingPreferences: {
        ...defaultSettings.parkingPreferences,
        ...(parsed.parkingPreferences || {})
      },
      paymentPreferences: {
        ...defaultSettings.paymentPreferences,
        ...(parsed.paymentPreferences || {})
      }
    };
  } catch (error) {
    return defaultSettings;
  }
};

const Settings = () => {
  const { user, login } = useContext(AuthContext);
  const [settings, setSettings] = useState(loadSettings);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [savingParking, setSavingParking] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [privacyBusy, setPrivacyBusy] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    next: false,
    confirm: false
  });

  const hasUnsavedParking = useMemo(
    () => Boolean(settings.parkingPreferences.defaultCity || settings.parkingPreferences.maxDistanceKm),
    [settings.parkingPreferences]
  );

  const persistSettings = (nextSettings) => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(nextSettings));
  };

  const saveParkingPreferences = async () => {
    setSavingParking(true);
    try {
      persistSettings(settings);
      toast.success('Parking preferences saved');
    } finally {
      setSavingParking(false);
    }
  };

  const savePaymentPreferences = async () => {
    if (settings.paymentPreferences.preferredMethod === 'upi' && !settings.paymentPreferences.upiId.trim()) {
      toast.error('UPI ID is required for UPI preference');
      return;
    }
    setSavingPayment(true);
    try {
      persistSettings(settings);
      toast.success('Payment preferences saved');
    } finally {
      setSavingPayment(false);
    }
  };

  const updatePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match');
      return;
    }

    setSavingPassword(true);
    try {
      const response = await authAPI.updatePassword({
        currentPassword,
        newPassword
      });
      const token = response?.data?.token;
      const nextUser = response?.data?.user;
      if (token && nextUser) {
        login(nextUser, token);
      }
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const exportMyData = async () => {
    setPrivacyBusy(true);
    try {
      const meResponse = await authAPI.getMe();
      const payload = {
        exportedAt: new Date().toISOString(),
        account: meResponse?.data?.data || user || {},
        preferences: settings
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'spoton-account-export.json';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success('Data export generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to export data');
    } finally {
      setPrivacyBusy(false);
    }
  };

  const requestAccountDeletion = async () => {
    setPrivacyBusy(true);
    try {
      await complaintAPI.create({
        subject: 'Account deletion request',
        category: 'other',
        description: `User ${user?.email || 'unknown'} requested permanent account deletion on ${new Date().toLocaleString()}.`
      });
      toast.success('Deletion request submitted to support team');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit deletion request');
    } finally {
      setPrivacyBusy(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Parking Preferences</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <input
              value={settings.parkingPreferences.defaultCity}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  parkingPreferences: {
                    ...prev.parkingPreferences,
                    defaultCity: e.target.value
                  }
                }))
              }
              placeholder="Default city"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
            <select
              value={settings.parkingPreferences.preferredVehicleType}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  parkingPreferences: {
                    ...prev.parkingPreferences,
                    preferredVehicleType: e.target.value
                  }
                }))
              }
              className="border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
              <option value="van">Van</option>
            </select>
            <input
              type="number"
              min="1"
              max="100"
              value={settings.parkingPreferences.maxDistanceKm}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  parkingPreferences: {
                    ...prev.parkingPreferences,
                    maxDistanceKm: Number(e.target.value || 0)
                  }
                }))
              }
              placeholder="Max distance (km)"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {hasUnsavedParking
                ? 'Preferences are saved locally and used for your next sessions.'
                : 'Set your parking defaults to speed up booking.'}
            </p>
            <button
              type="button"
              onClick={saveParkingPreferences}
              disabled={savingParking}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-60"
            >
              {savingParking ? 'Saving...' : 'Save Parking Preferences'}
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Payment Preferences</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <select
              value={settings.paymentPreferences.preferredMethod}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  paymentPreferences: {
                    ...prev.paymentPreferences,
                    preferredMethod: e.target.value
                  }
                }))
              }
              className="border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value="upi">UPI</option>
              <option value="card">Card</option>
              <option value="netbanking">Net Banking</option>
            </select>
            <input
              value={settings.paymentPreferences.upiId}
              onChange={(e) =>
                setSettings((prev) => ({
                  ...prev,
                  paymentPreferences: {
                    ...prev.paymentPreferences,
                    upiId: e.target.value
                  }
                }))
              }
              placeholder="UPI ID (example@bank)"
              className="border border-gray-200 rounded-lg px-3 py-2"
            />
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2">
              <input
                type="checkbox"
                checked={settings.paymentPreferences.autoPayEnabled}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    paymentPreferences: {
                      ...prev.paymentPreferences,
                      autoPayEnabled: e.target.checked
                    }
                  }))
                }
              />
              Enable Auto-Pay
            </label>
          </div>
          <button
            type="button"
            onClick={savePaymentPreferences}
            disabled={savingPayment}
            className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg disabled:opacity-60"
          >
            {savingPayment ? 'Saving...' : 'Save Payment Preferences'}
          </button>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Security</h2>
          <div className="grid md:grid-cols-3 gap-3">
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Current password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPasswords.current ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPasswords.next ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                placeholder="New password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => ({ ...prev, next: !prev.next }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPasswords.next ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPasswords.confirm ? <FiEyeOff className="h-4 w-4" /> : <FiEye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={updatePassword}
            disabled={savingPassword}
            className="mt-3 px-4 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-60"
          >
            {savingPassword ? 'Updating...' : 'Update Password'}
          </button>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy</h2>
          <p className="text-sm text-gray-600 mb-3">
            Export your account data or submit an account deletion request.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={exportMyData}
              disabled={privacyBusy}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white disabled:opacity-60"
            >
              Export My Data
            </button>
            <button
              type="button"
              onClick={requestAccountDeletion}
              disabled={privacyBusy}
              className="px-4 py-2 bg-red-600 text-white rounded-lg disabled:opacity-60"
            >
              Request Account Deletion
            </button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Settings;
