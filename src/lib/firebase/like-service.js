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

const LIKES_COLLECTION = 'likes';

const checkFirestore = () => {
  if (!db) {
    console.warn('Firestore is not initialized. Returning empty data.');
    return false;
  }
  return true;
};

export const likeService = {
  // Get all likes for a post
  async getLikesByPost(postId) {
    // Check cache first
    const cached = cacheManager.get('LIKES', `post_${postId}`);
    if (cached) {
      console.log(`📦 [LikeService Cache] ✅ Using cached likes for post: ${postId} (HIT)`);
      console.log(`   └─ Saved ${cached.length} likes from cache`);
      return cached;
    }

    console.log(`📦 [LikeService Cache] ❌ Cache miss for likes on post: ${postId}, fetching from Firebase...`);
    
    // Use request coalescing
    const coalescingKey = `LIKES:post_${postId}`;
    return cacheManager.getWithCoalescing(coalescingKey, async () => {
      if (!checkFirestore()) return [];
      const constraints = [
        where('postId', '==', postId),
      ];
      const q = query(collection(db, LIKES_COLLECTION), ...constraints);
      const querySnapshot = await getDocs(q);
      const likes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      
      console.log(`📦 [LikeService Cache] ✅ Fetched ${likes.length} likes, now caching...`);
      // Cache the result
      cacheManager.set('LIKES', `post_${postId}`, likes, CACHE_CONFIG.LIKES.LIKES_BY_POST);
      return likes;
    });
  },

  // Add a like
  async addLike(like) {
    if (!checkFirestore()) return null;
    // Prevent duplicate like: check if user already liked
    if (!like.postId || !like.user?.id) return null;
    const alreadyLiked = await likeService.hasUserLiked(like.postId, like.user.id);
    if (alreadyLiked) return null;
    const docRef = await addDoc(collection(db, LIKES_COLLECTION), {
      ...like,
      userId: like.user.id,
      createdAt: Timestamp.now(),
    });
    
    // Invalidate likes cache for this post
    cacheManager.delete('LIKES', `post_${like.postId}`);
    cacheManager.delete('LIKES', `count_${like.postId}`);
    
    return docRef.id;
  },

  // Remove a like
  async removeLike(postId, userId) {
    if (!checkFirestore() || !postId || !userId) return null;
    const q = query(
      collection(db, LIKES_COLLECTION),
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const likeDoc = snapshot.docs[0];
      await deleteDoc(likeDoc.ref);
      
      // Invalidate likes cache for this post
      cacheManager.delete('LIKES', `post_${postId}`);
      cacheManager.delete('LIKES', `count_${postId}`);
      
      return likeDoc.id;
    }
    return null;
  },

  // Get a single like by ID
  async getLikeById(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, LIKES_COLLECTION, id);
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

  // Check if a user has liked a post
  async hasUserLiked(postId, userId) {
    if (!postId || !userId) return false;
    
    // Check cache first
    const cached = cacheManager.get('LIKES', `is_liked_${postId}_${userId}`);
    if (cached !== null) {
      return cached;
    }

    console.log(`📦 [LikeService Cache] ❌ Cache miss for hasUserLiked: ${postId}_${userId}`);
    
    // Use request coalescing
    const coalescingKey = `LIKES:is_liked_${postId}_${userId}`;
    return cacheManager.getWithCoalescing(coalescingKey, async () => {
      const q = query(
        collection(db, 'likes'),
        where('postId', '==', postId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const hasLiked = !snapshot.empty;
      
      // Cache the result (short TTL for like status)
      cacheManager.set('LIKES', `is_liked_${postId}_${userId}`, hasLiked, CACHE_CONFIG.LIKES.LIKES_BY_POST);
      return hasLiked;
    });
  },

  // Get all posts liked by a user
  async getUserLikedPosts(userId) {
    // Check cache first
    const cached = cacheManager.get('LIKES', `user_${userId}`);
    if (cached) {
      console.log(`📦 [LikeService Cache] ✅ Using cached user likes for: ${userId} (HIT)`);
      console.log(`   └─ Saved ${cached.length} likes from cache`);
      return cached;
    }

    console.log(`📦 [LikeService Cache] ❌ Cache miss for user likes: ${userId}, fetching from Firebase...`);
    
    // Use request coalescing
    const coalescingKey = `LIKES:user_${userId}`;
    return cacheManager.getWithCoalescing(coalescingKey, async () => {
      if (!checkFirestore()) return [];
      const q = query(
        collection(db, LIKES_COLLECTION),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      const likes = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }));
      
      console.log(`📦 [LikeService Cache] ✅ Fetched ${likes.length} likes for user, now caching...`);
      // Cache the result
      cacheManager.set('LIKES', `user_${userId}`, likes, CACHE_CONFIG.LIKES.LIKES_BY_USER);
      return likes;
    });
  },
};
