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
import { auth, db } from '@/lib/firebase/config';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { generateUniqueUsername } from '@/lib/usernameUtils';
import {
  saveAuthState,
  loadAuthState,
  clearAuthState,
  onAuthStateChange,
  setupCrossTabSync,
} from '@/lib/authStateStorage';

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
    // On initial load, try to restore from cache to prevent layout shift
    if (!auth) return false;
    
    const cachedAuth = loadAuthState();
    if (cachedAuth) {
      // We have cached auth state, so we're not loading
      return false;
    }
    return true;
  });

  // Sync with auth state storage on mount and when auth state changes
  useEffect(() => {
    // Setup cross-tab sync
    setupCrossTabSync();
    
    // If auth is not configured, nothing to subscribe to
    if (!auth) {
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      // Save to persistent storage
      saveAuthState(currentUser);
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Listen to storage events from other tabs
  useEffect(() => {
    const unsubscribe = onAuthStateChange((authState) => {
      // When auth state changes from another tab or from storage event
      // We don't update user here - Firebase will handle that
      // This is just for reactive updates if needed
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
    if (!db) throw new Error('Firebase Firestore is not configured');
    
    try {
      // Generate unique username from email
      const username = await generateUniqueUsername(email);
      
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      if (result.user) {
        // Update display name in Firebase Auth
        if (displayName) {
          await updateProfile(result.user, { displayName });
        }
        
        // Save user data to Firestore
        const userRef = doc(db, 'users', result.user.uid);
        await setDoc(userRef, {
          uid: result.user.uid,
          email: result.user.email,
          username: username,
          displayName: displayName || '',
          bio: '',
          website: '',
          twitter: '',
          github: '',
          linkedin: '',
          photoURL: result.user.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
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
    try {
      await firebaseSignOut(auth);
      // Clear persistent storage on logout
      clearAuthState();
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
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
