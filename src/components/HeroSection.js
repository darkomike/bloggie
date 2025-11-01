'use client';

import { useAuth } from '@/components/AuthProvider';
import Link from 'next/link';
import PropTypes from 'prop-types';

export default function HeroSection({ stats }) {
  const { user } = useAuth();

  return (
    <div className="relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/assets/images/home.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32">
        <div className="text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-4 sm:mb-6">
            Welcome to{' '}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-blue-200 to-purple-200">
              Bloggie
            </span>
          </h1>
          <p className="mb-8 sm:mb-10 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto px-4">
            Join thousands of readers exploring articles on technology, design, business, and more. Discover insights from industry experts and passionate writers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/blog"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-blue-600 shadow-lg hover:bg-gray-50 transition-all hover:scale-105"
            >
              Explore Articles
              <svg className="ml-2 h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            {!user && (
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white hover:bg-white/10 transition-all"
              >
                Join Community
              </Link>
            )}
            {user && (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold text-white hover:bg-white/10 transition-all"
              >
                Go to Dashboard
              </Link>
            )}
          </div>

          <div className="mt-12 sm:mt-16 grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/10 backdrop-blur-sm p-4 sm:p-6">
                <div className="mb-2 text-white">{stat.icon}</div>
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

HeroSection.propTypes = {
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      icon: PropTypes.node.isRequired,
    })
  ).isRequired,
};
