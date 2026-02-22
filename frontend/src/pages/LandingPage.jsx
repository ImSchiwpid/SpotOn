import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMapPin,
  FiShield,
  FiStar
} from 'react-icons/fi';
import BrandLogo from '../components/ui/BrandLogo';
import { DashboardFooter } from '../components/layout';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const features = [
  {
    icon: FiMapPin,
    title: 'Live Spot Discovery',
    description: 'Find nearby parking spaces with clear pricing and availability.'
  },
  {
    icon: FiShield,
    title: 'Secure Bookings',
    description: 'Book confidently with verified listings and payment protection.'
  },
  {
    icon: FiClock,
    title: 'Quick Check-In',
    description: 'Reserve in seconds and get instant booking confirmation.'
  }
];

const steps = [
  {
    title: 'Search',
    description: 'Enter your location and compare nearby spots.'
  },
  {
    title: 'Book',
    description: 'Choose a slot, time range, and confirm your reservation.'
  },
  {
    title: 'Park',
    description: 'Arrive and park stress-free using your booking details.'
  }
];

const stats = [
  { label: 'Cities Covered', value: '30+' },
  { label: 'Bookings Completed', value: '50K+' },
  { label: 'Average Rating', value: '4.8/5' }
];

const LandingPage = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrollProgress(clamp(window.scrollY / 120, 0, 1));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const headerHeight = 84 - 18 * scrollProgress;
  const headerShift = -10 * scrollProgress;
  const headerBgAlpha = 0.82 + 0.12 * scrollProgress;
  const headerBorderAlpha = 0.45 + 0.25 * scrollProgress;
  const headerBlur = 10 + 10 * scrollProgress;
  const headerShadowAlpha = 0.03 + 0.06 * scrollProgress;
  const brandTextOpacity = 1 - scrollProgress;
  const brandTextWidth = `${Math.max(0, 112 - 112 * scrollProgress)}px`;
  const brandIconScale = 1 + 0.16 * scrollProgress;

  return (
    <div className="min-h-screen text-gray-900">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className="sticky top-0 z-20"
        style={{
          height: `${headerHeight}px`,
          transform: `translateY(${headerShift}px)`,
          backgroundColor: `rgba(255,255,255,${headerBgAlpha})`,
          borderBottom: `1px solid rgba(229,231,235,${headerBorderAlpha})`,
          backdropFilter: `blur(${headerBlur}px)`,
          boxShadow: `0 8px 24px rgba(15,23,42,${headerShadowAlpha})`
        }}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-between px-5 md:px-8">
          <Link to="/" aria-label="SPOT-ON home">
            <BrandLogo
              iconClassName="origin-left transition-transform duration-300"
              iconStyle={{ transform: `scale(${brandIconScale})` }}
              textClassName="transition-all duration-300"
              textStyle={{ opacity: brandTextOpacity, width: brandTextWidth }}
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </motion.header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-20 top-8 h-72 w-72 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 top-24 h-72 w-72 rounded-full bg-primary-300/30 blur-3xl" />

          <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-16 md:px-8 md:py-20 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="relative z-10"
            >
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-4 py-2 text-sm font-medium text-primary-700">
                <FiCheckCircle className="h-4 w-4" />
                Smarter parking for everyday drives
              </p>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-5xl">
                Book reliable parking spaces before you arrive.
              </h1>
              <p className="mt-5 max-w-xl text-base text-gray-600 md:text-lg">
                SPOT-ON helps drivers find, compare, and reserve parking in minutes while helping owners earn from unused spaces.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/register" className="btn-primary inline-flex items-center gap-2">
                  Start Booking
                  <FiArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/login" className="btn-secondary inline-flex items-center gap-2">
                  I already have an account
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="card relative z-10 p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900">How it works</h2>
              <div className="mt-6 space-y-4">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex gap-4 rounded-xl border border-gray-100 p-4">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{step.title}</p>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl bg-primary-50 p-4">
                <p className="text-sm text-primary-800">
                  Owners can also list private parking spaces and manage bookings from a dedicated dashboard.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-8 md:px-8 md:py-12">
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.35, delay: index * 0.08 }}
                  className="card p-6"
                >
                  <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-gray-600">{feature.description}</p>
                </motion.article>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <div className="card overflow-hidden bg-gradient-to-r from-primary-700 to-primary-600 p-8 text-white md:p-10">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-extrabold leading-tight">Own a parking space?</h2>
                <p className="mt-3 text-primary-50">
                  Publish your listing, set your rates, and accept bookings from verified users.
                </p>
                <Link
                  to="/register"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-primary-700 hover:bg-primary-50"
                >
                  List Your Spot
                  <span className="text-base font-bold">₹</span>
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-white/10 p-4">
                  <FiCalendar className="h-5 w-5" />
                  <p className="mt-2 text-sm text-primary-50">Flexible availability controls</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4">
                  <FiStar className="h-5 w-5" />
                  <p className="mt-2 text-sm text-primary-50">Build trust with ratings</p>
                </div>
                <div className="rounded-xl bg-white/10 p-4 sm:col-span-2">
                  <p className="text-sm text-primary-50">
                    Manage listings, revenue, and booking approvals from your owner dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <DashboardFooter />
    </div>
  );
};

export default LandingPage;
