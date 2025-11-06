'use client';

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { cacheManager } from '@/lib/cache/cacheManager';

const AuthContext = createContext({
  user: null,
  loading: true,
  initializing: true,
  initialized: false,
  error: null,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  // Local state management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Fetch session on mount
  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      setInitializing(true);

      try {
        const response = await fetch('/api/auth/session');
        
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }

        const data = await response.json();
        setUser(data.user);
        setInitialized(true);
        setInitializing(false);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setInitialized(true);
        setInitializing(false);
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  // Login action
  const signIn = useCallback(async (emailOrUsername, password) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setUser(data.user);
      setInitialized(true);
      setInitializing(false);
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Signup action
  const signUp = useCallback(async (email, password, displayName, username) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, username }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Signup failed');
      }

      const data = await response.json();
      setUser(data.user);
      setInitialized(true);
      setInitializing(false);
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  // Logout action
  const signOut = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Clear all cache data
      cacheManager.clear();

      // Clear auth state
      setUser(null);
      setError(null);
      setInitialized(true);
      setInitializing(false);
      setLoading(false);

      // Clear browser storage
      if (typeof window !== 'undefined') {
        try {
          const keysToRemove = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && (key.startsWith('user_') || key.startsWith('auth_') || key.includes('profile'))) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
          sessionStorage.clear();
          window.history.replaceState(null, '', '/');
        } catch (err) {
          console.warn('Error clearing storage:', err);
        }
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
      // Even on error, clear user data for security
      setUser(null);
      throw err;
    }
  }, []);

  // Refresh session (refetch user data)
  const refreshSession = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/auth/session');
      
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }

      const data = await response.json();
      setUser(data.user);
      setLoading(false);
      return data.user;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  // Memoize value object to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    initializing,
    initialized,
    error,
    signIn,
    signUp,
    signOut,
    refreshSession,
  }), [user, loading, initializing, initialized, error, signIn, signUp, signOut, refreshSession]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Re-export useAuth for backward compatibility
export const useAuth = useAuthContext;
