'use client';

/**
 * AuthRenderer Component
 * Handles rendering of auth UI after client hydration completes
 * Prevents hydration mismatches by delaying auth rendering until client-side
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './AuthProvider';
import { useAuthHydration } from '@/hooks/useAuthHydration';

export default function AuthRenderer({
  getLoginLink,
  getSignupLink,
  handleSignOut,
  userMenuOpen,
  setUserMenuOpen,
  showLoading,
}) {
  const { user } = useAuth();
  const { cachedUser } = useAuthHydration();
  const [isHydrated, setIsHydrated] = useState(false);

  // Only render after hydration completes
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // During hydration, render empty placeholder with fixed width
  if (!isHydrated) {
    return <div className="w-10 md:w-[220px]" />;
  }

  const displayUser = user || cachedUser;

  return (
    <div className="w-10 md:w-auto" suppressHydrationWarning={true}>
      {displayUser ? (
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center justify-center rounded-full hover:opacity-80 transition-opacity"
            aria-label="User menu"
          >
            {displayUser.photoURL ? (
              <Image
                src={displayUser.photoURL}
                alt={displayUser.displayName || 'User'}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover shadow-md shrink-0"
              />
            ) : (
              <div className="h-10 w-10 shrink-0 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {displayUser.displayName?.[0]?.toUpperCase() ||
                  displayUser.email?.[0]?.toUpperCase() ||
                  'U'}
              </div>
            )}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 dark:bg-gray-800 overflow-hidden z-50">
              <div className="py-1">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Profile
                </Link>
                <Link
                  href="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors font-medium flex items-center gap-2"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 16l4-6m-9-3l7-4 7 4"
                    />
                  </svg>
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 dark:text-gray-300 dark:hover:bg-red-900/20 transition-colors font-medium flex items-center gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden md:flex md:items-center md:gap-2">
          <Link
            href={getLoginLink()}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              showLoading
                ? 'opacity-50 pointer-events-none text-gray-400 dark:text-gray-500'
                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
            }`}
          >
            Sign in
          </Link>
          <Link
            href={getSignupLink()}
            className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-md transition-all ${
              showLoading
                ? 'opacity-50 pointer-events-none bg-blue-400 dark:bg-blue-600'
                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600'
            }`}
          >
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}
