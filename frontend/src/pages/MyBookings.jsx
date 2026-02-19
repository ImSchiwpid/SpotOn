import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { MainLayout } from '../components/layout';
import { bookingAPI, reviewAPI } from '../utils/api';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [reviewPayload, setReviewPayload] = useState({ bookingId: '', rating: 5, comment: '' });

  const loadBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getMy();
      setBookings(response.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return bookings;
    return bookings.filter((booking) => booking.status === statusFilter);
  }, [bookings, statusFilter]);

  const cancelBooking = async (bookingId) => {
    try {
      await bookingAPI.cancel(bookingId, { reason: 'Cancelled by customer' });
      toast.success('Booking cancelled');
      await loadBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const downloadInvoice = async (bookingId) => {
    try {
      const response = await bookingAPI.getInvoice(bookingId);
      const invoice = response.data?.data;
      const content = JSON.stringify(invoice, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceNumber || 'invoice'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download invoice');
    }
  };

  const submitReview = async () => {
    try {
      await reviewAPI.create(reviewPayload);
      toast.success('Review submitted');
      setReviewPayload({ bookingId: '', rating: 5, comment: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card">
          {loading && <p className="p-6 text-gray-500">Loading bookings...</p>}
          {!loading && filtered.length === 0 && <p className="p-6 text-gray-500">No bookings found.</p>}
          {!loading &&
            filtered.map((booking) => (
              <div key={booking._id} className="p-6 border-b border-gray-100 last:border-b-0">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {booking.parkingSpot?.title} ({booking.bookingCode})
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.parkingSpot?.address}, {booking.parkingSpot?.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">Rs. {booking.totalAmount}</p>
                    <p className="text-sm text-gray-500">
                      {booking.status} / {booking.paymentStatus}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <button
                      onClick={() => cancelBooking(booking._id)}
                      className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg"
                    >
                      Cancel Booking
                    </button>
                  )}
                  {booking.paymentStatus === 'paid' && (
                    <button
                      onClick={() => downloadInvoice(booking._id)}
                      className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg"
                    >
                      Download Invoice
                    </button>
                  )}
                  {booking.status === 'completed' && (
                    <button
                      onClick={() => setReviewPayload((prev) => ({ ...prev, bookingId: booking._id }))}
                      className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg"
                    >
                      Review
                    </button>
                  )}
                </div>
              </div>
            ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
          <h2 className="text-xl font-semibold text-gray-900">Submit Review</h2>
          <p className="text-sm text-gray-500 mt-1">Select completed booking first using Review button.</p>
          <div className="grid md:grid-cols-3 gap-3 mt-4">
            <input
              value={reviewPayload.bookingId}
              readOnly
              className="border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
              placeholder="Booking ID"
            />
            <input
              type="number"
              min="1"
              max="5"
              value={reviewPayload.rating}
              onChange={(e) =>
                setReviewPayload((prev) => ({ ...prev, rating: Number(e.target.value) }))
              }
              className="border border-gray-200 rounded-lg px-3 py-2"
              placeholder="Rating (1-5)"
            />
            <input
              value={reviewPayload.comment}
              onChange={(e) =>
                setReviewPayload((prev) => ({ ...prev, comment: e.target.value }))
              }
              className="border border-gray-200 rounded-lg px-3 py-2"
              placeholder="Comment"
            />
          </div>
          <button onClick={submitReview} className="mt-3 px-4 py-2 bg-primary-600 text-white rounded-lg">
            Submit Review
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default MyBookings;

