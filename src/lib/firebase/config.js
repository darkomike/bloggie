/**
 * Firebase Configuration
 * Only using Firestore - NO Firebase Auth or Storage
 * Auth is handled by custom server-side JWT system
 * File storage is handled by Vercel Blob
 */

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Check if Firebase credentials are configured
const isFirebaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
};

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase only if configured
let app = null;
let db = null;

if (isFirebaseConfigured()) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  db = getFirestore(app);
} else {
  console.warn(
    '⚠️  Firebase is not configured. Please add your Firebase credentials to .env.local\n' +
    'Copy .env.example to .env.local and add your Firebase project details.'
  );
}

// Export only Firestore - NO auth or storage
export { db };
export default app;

