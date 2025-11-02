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
  const { user, loading } = useAuth();
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
    if (!loading) {
      // Redirect to login if trying to access protected route without auth
      if (routeType.isProtectedRoute && !user) {
        const redirectUrl = `/login?redirect=${encodeURIComponent(pathname)}`;
        console.log('AuthMiddleware redirect:', redirectUrl);
        router.push(redirectUrl);
        return;
      }

      // Redirect to blog page after user is logged in from a redirect from a blog page
      if (routeType.isAuthRoute && user) {
        const searchParams = new URLSearchParams(window.location.search);
        const redirect = searchParams.get('redirect');
        if (redirect) {
          console.log('AuthMiddleware redirect after login:', redirect);
          router.push(redirect);
          return;
        }
      }

      // Redirect to dashboard if trying to access auth pages while logged in
      if (routeType.isAuthRoute && user) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router, routeType]);

  // Show loading screen while checking auth
  // if (loading) {
  //   return <LoadingScreen />;
  // }

  return <>{children}</>;
}

AuthMiddleware.propTypes = {
  children: PropTypes.node.isRequired,
};
