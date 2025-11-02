'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import AuthRenderer from './AuthRenderer';

const isActiveLink = (href, pathname) => {
  if (href === '/') return pathname === '/';
  return pathname.startsWith(href);
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, signOut, loading } = useAuth();
  const pathname = usePathname();

  // Show loading state only when Firebase auth is checking AND there's no user
  const showLoading = loading && !user;

  // Memoize sign out handler to prevent unnecessary re-renders of child components
  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      setUserMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [signOut]);

  // Memoize redirect links to prevent recalculation on every render
  const getLoginLink = useCallback(() => {
    if (pathname === '/login' || pathname === '/signup') {
      return '/login';
    }
    return `/login?redirect=${encodeURIComponent(pathname)}`;
  }, [pathname]);

  const getSignupLink = useCallback(() => {
    if (pathname === '/login' || pathname === '/signup') {
      return '/signup';
    }
    return `/signup?redirect=${encodeURIComponent(pathname)}`;
  }, [pathname]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm dark:border-gray-700 dark:bg-gray-900/95">
      <nav className="mx-auto max-w-7xl px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between gap-4">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Image
                src="/assets/images/logo.jpg"
                alt="Bloggie Logo"
                width={40}
                height={40}
                className="h-9 sm:h-10 w-9 sm:w-10 rounded-lg object-cover"
              />
              <span className="hidden sm:inline text-lg sm:text-xl font-extrabold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                Bloggie
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:justify-center md:flex-1 md:gap-6 lg:gap-8">
            
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

            {/* New Post Button (visible when logged in) */}
            {user && (
              <Link
                href="/blog/new"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-200 flex items-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Post
              </Link>
            )}
          </div>

          {/* Right Side: Search, Theme Toggle & Auth */}
          <div className="flex items-center justify-end flex-1 gap-8">
            <div className="flex items-center gap-8">
              <SearchBar />
              <ThemeToggle />
            </div>

            {/* Auth Container - Uses AuthRenderer for clean hydration */}
            <AuthRenderer
              getLoginLink={getLoginLink}
              getSignupLink={getSignupLink}
              handleSignOut={handleSignOut}
              userMenuOpen={userMenuOpen}
              setUserMenuOpen={setUserMenuOpen}
              showLoading={showLoading}
            />

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
                className={`block rounded-lg px-4 py-2.5 text-base font-semibold transition-all flex items-center gap-2 ${
                  isActiveLink('/blog', pathname)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.248 6.253 2 10.541 2 15.5s4.248 9.247 10 9.247m0-13c5.752 0 10-4.542 10-9.247m-10 13v-13m0 0C6.248 6.253 2 10.541 2 15.5s4.248 9.247 10 9.247m0-13c5.752 0 10-4.542 10-9.247" />
                </svg>
                Blog
              </Link>
              <Link
                href="/categories"
                className={`block rounded-lg px-4 py-2.5 text-base font-semibold transition-all flex items-center gap-2 ${
                  isActiveLink('/categories', pathname)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7a7 7 0 110 14 7 7 0 010-14zM13 11H7v6h6v-6z" />
                </svg>
                Categories
              </Link>

              {/* Profile & Dashboard links (visible when logged in) */}
              {displayUser && (
                <>
                  <Link
                    href="/blog/new"
                    className="rounded-lg px-4 py-2.5 text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Post
                  </Link>
                </>
              )}
              
              {!displayUser && (
                <div className="space-y-1 border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <Link
                    href={getLoginLink()}
                    className={`block rounded-lg px-4 py-2.5 text-base font-semibold transition-colors ${
                      showLoading
                        ? 'opacity-50 pointer-events-none text-gray-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href={getSignupLink()}
                    className={`block rounded-lg px-4 py-2.5 text-base font-semibold transition-colors ${
                      showLoading
                        ? 'opacity-50 pointer-events-none bg-blue-400'
                        : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign up
                  </Link>
                </div>
              )}

              {displayUser && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left rounded-lg px-4 py-2.5 text-base font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
