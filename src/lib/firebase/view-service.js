import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

const VIEWS_COLLECTION = 'views';

const checkFirestore = () => {
  if (!db) {
    console.warn('Firestore is not initialized. Returning empty data.');
    return false;
  }
  return true;
};

export const viewService = {
  // Get all views (for homepage stats)
  async getAllViews() {
    if (!checkFirestore()) return [];
    const q = collection(db, VIEWS_COLLECTION);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  },
  // Get all views for a post
  async getViewsByPost(postId) {
    if (!checkFirestore()) return [];
    const constraints = [
      where('postId', '==', postId),
    ];
    const q = query(collection(db, VIEWS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  },

  // Add a view
  async addView(view) {
    if (!checkFirestore()) return null;
    const docRef = await addDoc(collection(db, VIEWS_COLLECTION), {
      ...view,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Remove a view (rare, but for completeness)
  async removeView(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, VIEWS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Get a single view by ID
  async getViewById(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, VIEWS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
    };
  },
};
