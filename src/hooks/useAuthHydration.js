/**
 * Auth Hydration Hook
 * Pre-loads cached auth state on mount to prevent header layout shift
 * Keeps header buttons in consistent position during Firebase auth check
 */

import { useState, useEffect, useCallback } from 'react';
import { getCachedAuthState, onAuthStateChange } from '@/lib/authStateStorage';

export function useAuthHydration() {
  const [cachedUser, setCachedUser] = useState(() => {
    // Hydrate from cache synchronously on initial mount
    return getCachedAuthState();
  });

  const [isHydrated] = useState(true); // Always hydrated due to initializer above

  useEffect(() => {
    // Subscribe to auth state changes from other tabs
    const unsubscribe = onAuthStateChange((authState) => {
      setCachedUser(authState);
    });

    return unsubscribe;
  }, []);

  return { cachedUser, isHydrated };
}
