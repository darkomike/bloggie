'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';

const isActiveLink = (href, pathname) => {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();

  const handleSignOut = async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Create auth links with redirect parameter (don't redirect from auth pages themselves)
  const getLoginLink = () => {
    if (pathname === '/login' || pathname === '/signup') {
      return '/login';
    }
    return `/login?redirect=${encodeURIComponent(pathname)}`;
  };

  const getSignupLink = () => {
    if (pathname === '/login' || pathname === '/signup') {
      return '/signup';
    }
    return `/signup?redirect=${encodeURIComponent(pathname)}`;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm dark:border-gray-700 dark:bg-gray-900/95">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 hover:opacity-80 transition-opacity">
              <span className="w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">B</span>
              Bloggie
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            
            <Link
              href="/blog"
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isActiveLink('/blog', pathname)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
              }`}
            >
              Blog
            </Link>
            <Link
              href="/categories"
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                isActiveLink('/categories', pathname)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800'
              }`}
            >
              Categories
            </Link>
          </div>

          {/* Search Bar */}
          <SearchBar />

          {/* Right Side: Theme Toggle & Auth */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />

            {!loading && (
              <>
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    >
                      <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                        {user.displayName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <span className="hidden md:inline text-xs">{user.displayName || user.email}</span>
                      <svg className={`h-4 w-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 dark:bg-gray-800 overflow-hidden">
                        <div className="py-1">
                          <Link
                            href="/profile"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            👤 Profile
                          </Link>
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            📊 Dashboard
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50 dark:text-gray-300 dark:hover:bg-red-900/20 transition-colors border-t border-gray-100 dark:border-gray-700"
                          >
                            🚪 Sign out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden md:flex md:items-center md:gap-2">
                    <Link
                      href={getLoginLink()}
                      className="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                    >
                      Sign in
                    </Link>
                    <Link
                      href={getSignupLink()}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden inline-flex items-center justify-center rounded-lg p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:text-gray-300 dark:hover:bg-gray-800"
              aria-label="Main menu"
            >
              <svg
                className={`h-6 w-6 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="space-y-1">
              
              <Link
                href="/blog"
                className={`block rounded-lg px-4 py-2.5 text-base font-semibold transition-all ${
                  isActiveLink('/blog', pathname)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                📝 Blog
              </Link>
              <Link
                href="/categories"
                className={`block rounded-lg px-4 py-2.5 text-base font-semibold transition-all ${
                  isActiveLink('/categories', pathname)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                🏷️ Categories
              </Link>
              
              {!loading && !user && (
                <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <Link
                    href={getLoginLink()}
                    className="block rounded-lg px-4 py-2.5 text-base font-semibold text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href={getSignupLink()}
                    className="block rounded-lg bg-blue-600 px-4 py-2.5 text-base font-semibold text-white hover:bg-blue-700 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
