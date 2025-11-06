'use client';

import { useAuth } from '@/components/AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import PropTypes from 'prop-types';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/blog/new',
  '/blog/edit',
];

// Define auth routes (redirect to home if already logged in)
const AUTH_ROUTES = new Set(['/login', '/signup']);

/**
 * Auth Middleware Component
 * Protects routes that require authentication
 * Shows loading UI while checking auth state
 */
export default function AuthMiddleware({ children }) {
  const { user, loading, initializing } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if current route is protected or auth route
  const routeType = useMemo(() => {
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathname.startsWith(route)
    );
    const isAuthRoute = AUTH_ROUTES.has(pathname);

    return { isProtectedRoute, isAuthRoute };
  }, [pathname]);

  useEffect(() => {
    if (initializing || loading) {
      return;
    }

    // Redirect to login if trying to access protected route without auth
    if (routeType.isProtectedRoute && !user) {
      const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
      console.log('AuthMiddleware redirect:', redirectUrl);
      router.push(redirectUrl);
      return;
    }

    if (routeType.isAuthRoute && user) {
      const searchParams = typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : null;
      const redirect = searchParams?.get('redirect');

      if (redirect) {
        console.log('AuthMiddleware redirect after login:', redirect);
        router.push(redirect);
        return;
      }

      router.push('/dashboard');
    }
  }, [user, loading, initializing, pathname, router, routeType]);

  // Show loading screen while the initial auth state is being resolved
  if (initializing) {
    return <LoadingScreen />;
  }

  if (routeType.isProtectedRoute && !user) {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}

AuthMiddleware.propTypes = {
  children: PropTypes.node.isRequired,
};
