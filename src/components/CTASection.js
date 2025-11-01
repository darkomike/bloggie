'use client';

import Link from 'next/link';
import { useAuth } from './AuthProvider';

export default function CTASection() {
  const { user } = useAuth();

  // Don't show CTA if user is logged in
  if (user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-900 dark:to-purple-900 px-6 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>
        <div className="relative z-10 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
            Join Our Community
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Subscribe to our newsletter and be the first to know about new insights, exclusive content, and opportunities to grow with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Get Started Today
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
