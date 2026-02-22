import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiHeadphones, FiMapPin, FiShield } from 'react-icons/fi';

const DashboardFooter = () => {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-8 md:px-6 md:pb-10">
      <div className="rounded-3xl border border-gray-200 bg-white/90 p-6 shadow-card backdrop-blur-sm md:p-8">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary-700">
          <FiHeadphones className="h-3.5 w-3.5" />
          Support and Navigation
        </div>

        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_260px] md:items-start">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-4xl">
              SPOT-ON support,
              <br />
              <span className="text-gray-500">built into your workflow.</span>
            </h2>
            <p className="mt-4 text-sm leading-6 text-gray-600 md:text-base">
              SPOT-ON helps drivers and parking owners manage spaces, bookings, and support
              requests from one clean dashboard.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                Find Parking
                <FiArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/help"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:text-gray-900"
              >
                Contact Support
              </Link>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Quick Access</p>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <Link to="/" className="block rounded-lg px-2 py-1 transition-colors hover:bg-gray-50 hover:text-gray-900">
                Home
              </Link>
              <Link to="/dashboard" className="block rounded-lg px-2 py-1 transition-colors hover:bg-gray-50 hover:text-gray-900">
                Dashboard
              </Link>
              <Link to="/explore" className="block rounded-lg px-2 py-1 transition-colors hover:bg-gray-50 hover:text-gray-900">
                Explore Parking
              </Link>
              <Link to="/help" className="block rounded-lg px-2 py-1 transition-colors hover:bg-gray-50 hover:text-gray-900">
                Help Center
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-3 border-t border-gray-200 pt-5 text-xs text-gray-500 sm:grid-cols-3">
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <FiMapPin className="h-3.5 w-3.5 text-gray-500" />
            Real-time location search
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <FiShield className="h-3.5 w-3.5 text-gray-500" />
            Verified parking listings
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-2">
            <FiHeadphones className="h-3.5 w-3.5 text-gray-500" />
            Faster booking support
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardFooter;
