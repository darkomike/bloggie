import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { db } from './config';

const SHARES_COLLECTION = 'shares';

const checkFirestore = () => {
  if (!db) {
    console.warn('Firestore is not initialized. Returning empty data.');
    return false;
  }
  return true;
};

export const shareService = {
  // Get all shares for a post
  async getSharesByPost(postId) {
    if (!checkFirestore()) return [];
    const constraints = [
      where('postId', '==', postId),
    ];
    const q = query(collection(db, SHARES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
  },

  // Add a share
  async addShare(share) {
    if (!checkFirestore()) return null;
    const docRef = await addDoc(collection(db, SHARES_COLLECTION), {
      ...share,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Remove a share
  async removeShare(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, SHARES_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Get a single share by ID
  async getShareById(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, SHARES_COLLECTION, id);
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
