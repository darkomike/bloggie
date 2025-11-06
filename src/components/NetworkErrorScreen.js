'use client';

import PropTypes from 'prop-types';
import Link from 'next/link';

export default function NetworkErrorScreen({
  title = 'You appear to be offline',
  message = 'We could not connect to our content service. Check your network and try again.',
  details,
  onRetry,
}) {
  return (
    <div className="relative min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center px-6 py-16">
      <div className="absolute inset-0 bg-linear-to-br from-blue-100/40 via-white to-purple-100/40 dark:from-blue-950 dark:via-gray-950 dark:to-purple-950 pointer-events-none" aria-hidden />
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 shadow-2xl backdrop-blur">
        <div className="px-10 py-12 sm:px-14 sm:py-16 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-300">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8v4" />
              <path d="M12 16h.01" />
              <path d="M21 10v4a1.5 1.5 0 01-1.5 1.5l-1-.004" />
              <path d="M3 10v4c0 .828.672 1.5 1.5 1.5h.5" />
              <path d="M7 4h10l4 6H3z" />
              <path d="M7 20h10" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {title}
          </h1>

          <p className="mt-4 text-base text-gray-600 dark:text-gray-400 sm:text-lg">
            {message}
          </p>

          {details && (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-500">
              {details}
            </p>
          )}

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-purple-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
              >
                Try Again
              </button>
            )}

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-gray-300/80 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:border-gray-400 hover:text-gray-900 dark:border-gray-700 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:text-white"
            >
              Go Home
            </Link>
          </div>

          <div className="mt-10 rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 px-6 py-5 text-left dark:border-gray-800 dark:bg-gray-900/60">
            <p className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Quick Tip
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Verify that you are connected to the internet.</li>
              <li>• If you are on a VPN or corporate network, ensure Firestore traffic is allowed.</li>
              <li>• Refresh the page after the connection is stable.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

NetworkErrorScreen.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  details: PropTypes.string,
  onRetry: PropTypes.func,
};
