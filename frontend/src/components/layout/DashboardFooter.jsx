import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiGithub, FiLinkedin, FiMap, FiMapPin, FiShield } from 'react-icons/fi';
import { AuthContext } from '../../App';
import { normalizeRole } from '../../utils/roles';

const DashboardFooter = () => {
  const { user } = React.useContext(AuthContext);
  const role = normalizeRole(user?.role);
  const findParkingTarget = user && role !== 'admin' ? '/explore' : '/login';

  return (
    <footer className="mt-8 border-t border-gray-200 bg-gradient-to-b from-white/95 via-primary-50/35 to-indigo-50/45 backdrop-blur-sm">
      <div className="h-[2px] w-full bg-gradient-to-r from-primary-500/90 via-violet-500/90 to-primary-500/90" />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 md:py-12">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold tracking-wide text-primary-700">
          <FiMap className="h-3.5 w-3.5" />
          Support and Navigation
        </div>

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
              to={findParkingTarget}
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Find Parking
              <FiArrowUpRight className="h-4 w-4" />
            </Link>
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
            <FiMap className="h-3.5 w-3.5 text-gray-500" />
            Faster booking support
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-200/80 pt-4 text-xs font-medium text-gray-500">
          <span>Copyright © 2026 SPOT-ON. All rights reserved. SPOT-ON is a trademark of Aush.</span>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/ImSchiwpid"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-900"
            >
              <FiGithub className="h-4 w-4" />
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/ayush-vartak"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-gray-900"
            >
              <FiLinkedin className="h-4 w-4" />
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
