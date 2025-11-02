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
import { cacheManager } from '@/lib/cache/cacheManager';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

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
    
    const cached = cacheManager.get('SHARES', `post_${postId}`);
    if (cached) {
      console.log('📦 [Shares Cache] Using cached shares for post:', postId);
      return cached;
    }
    
    const constraints = [
      where('postId', '==', postId),
    ];
    const q = query(collection(db, SHARES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    const shares = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
    
    cacheManager.set('SHARES', `post_${postId}`, shares, CACHE_CONFIG.SHARES.BY_POST);
    return shares;
  },

  // Add a share
  async addShare(share) {
    if (!checkFirestore()) return null;
    const docRef = await addDoc(collection(db, SHARES_COLLECTION), {
      ...share,
      createdAt: Timestamp.now(),
    });
    
    // Invalidate cache
    cacheManager.clearNamespace('SHARES');
    
    return docRef.id;
  },

  // Remove a share
  async removeShare(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, SHARES_COLLECTION, id);
    await deleteDoc(docRef);
    
    // Invalidate cache
    cacheManager.clearNamespace('SHARES');
  },

  // Get a single share by ID
  async getShareById(id) {
    if (!checkFirestore()) return null;
    
    const cached = cacheManager.get('SHARES', `id_${id}`);
    if (cached) {
      console.log('📦 [Shares Cache] Using cached share:', id);
      return cached;
    }
    
    const docRef = doc(db, SHARES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    
    const share = {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
    };
    
    cacheManager.set('SHARES', `id_${id}`, share, CACHE_CONFIG.SHARES.BY_ID);
    return share;
  },
};
