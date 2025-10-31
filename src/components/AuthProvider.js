'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

const AuthContext = createContext({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => {
    // If auth is not available, we're not loading
    return !!auth;
  });

  useEffect(() => {
    // If auth is not configured, nothing to subscribe to
    if (!auth) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    if (!auth) throw new Error('Firebase Auth is not configured');
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password authentication is not enabled. Please enable it in Firebase Console > Authentication > Sign-in method.');
      }
      throw error;
    }
  };

  const signUp = async (email, password, displayName) => {
    if (!auth) throw new Error('Firebase Auth is not configured');
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
      return result;
    } catch (error) {
      if (error.code === 'auth/operation-not-allowed') {
        throw new Error('Email/Password authentication is not enabled. Please enable it in Firebase Console > Authentication > Sign-in method.');
      }
      throw error;
    }
  };

  const signOut = async () => {
    if (!auth) throw new Error('Firebase Auth is not configured');
    return firebaseSignOut(auth);
  };

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
