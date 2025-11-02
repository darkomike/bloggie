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
import { cacheManager } from '@/lib/cache/cacheManager';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

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
    
    const cached = cacheManager.get('VIEWS', 'all_views');
    if (cached) {
      console.log('📦 [Views Cache] Using cached all views');
      return cached;
    }
    
    const q = collection(db, VIEWS_COLLECTION);
    const querySnapshot = await getDocs(q);
    const views = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
    
    cacheManager.set('VIEWS', 'all_views', views, CACHE_CONFIG.VIEWS.ALL_VIEWS);
    return views;
  },
  
  // Get all views for a post
  async getViewsByPost(postId) {
    if (!checkFirestore()) return [];
    
    const cached = cacheManager.get('VIEWS', `post_${postId}`);
    if (cached) {
      console.log('📦 [Views Cache] Using cached views for post:', postId);
      return cached;
    }
    
    const constraints = [
      where('postId', '==', postId),
    ];
    const q = query(collection(db, VIEWS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    const views = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
    
    cacheManager.set('VIEWS', `post_${postId}`, views, CACHE_CONFIG.VIEWS.BY_POST);
    return views;
  },

  // Add a view
  async addView(view) {
    if (!checkFirestore()) return null;
    const docRef = await addDoc(collection(db, VIEWS_COLLECTION), {
      ...view,
      createdAt: Timestamp.now(),
    });
    
    // Invalidate cache
    cacheManager.clearNamespace('VIEWS');
    
    return docRef.id;
  },

  // Remove a view (rare, but for completeness)
  async removeView(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, VIEWS_COLLECTION, id);
    await deleteDoc(docRef);
    
    // Invalidate cache
    cacheManager.clearNamespace('VIEWS');
  },

  // Get a single view by ID
  async getViewById(id) {
    if (!checkFirestore()) return null;
    
    const cached = cacheManager.get('VIEWS', `id_${id}`);
    if (cached) {
      console.log('📦 [Views Cache] Using cached view:', id);
      return cached;
    }
    
    const docRef = doc(db, VIEWS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    
    const view = {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
    };
    
    cacheManager.set('VIEWS', `id_${id}`, view, CACHE_CONFIG.VIEWS.BY_ID);
    return view;
  },
};
