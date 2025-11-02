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
} from 'firebase/firestore';
import { db } from './config';
import { Comment } from '@/models/commentModel';
import { cacheManager } from '@/lib/cache/cacheManager';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const COMMENTS_COLLECTION = 'comments';

const checkFirestore = () => {
  if (!db) {
    console.warn('Firestore is not initialized. Returning empty data.');
    return false;
  }
  return true;
};

export const commentService = {
  // Get all comments for a post
  async getCommentsByPost(postId, limitCount) {
    if (!checkFirestore()) return [];
    if (!postId) {
      console.error('Invalid postId: undefined');
      return [];
    }

    const cacheKey = `post_${postId}${limitCount ? `_limit_${limitCount}` : ''}`;
    const cached = cacheManager.get('COMMENTS', cacheKey);
    if (cached) {
      console.log('📦 [Comments Cache] Using cached comments for post:', postId);
      return cached;
    }

    const constraints = [
      where('postId', '==', postId),
      orderBy('createdAt', 'desc'),
    ];
    if (limitCount) constraints.push(limit(limitCount));
    const q = query(collection(db, COMMENTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    const comments = querySnapshot.docs.map((doc) => Comment.fromFirestore(doc));
    
    cacheManager.set('COMMENTS', cacheKey, comments, CACHE_CONFIG.COMMENTS.BY_POST);
    return comments;
  },

  // Add a new comment
  async addComment(comment) {
    if (!checkFirestore()) return null;
    const commentModel = new Comment(comment);
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentModel.toFirestore());
    const addedDoc = await getDoc(docRef);
    
    // Invalidate cache for this post's comments
    cacheManager.clearNamespace('COMMENTS');
    
    return Comment.fromFirestore(addedDoc);
  },

  // Update a comment
  async updateComment(id, comment) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    const updateData = new Comment(comment).toFirestore();
    await updateDoc(docRef, updateData);
    const updatedDoc = await getDoc(docRef);
    
    // Invalidate cache
    cacheManager.clearNamespace('COMMENTS');
    
    return Comment.fromFirestore(updatedDoc);
  },

  // Delete a comment
  async deleteComment(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    await deleteDoc(docRef);
    
    // Invalidate cache
    cacheManager.clearNamespace('COMMENTS');
  },

  // Get a single comment by ID
  async getCommentById(id) {
    if (!checkFirestore()) return null;
    
    const cached = cacheManager.get('COMMENTS', `id_${id}`);
    if (cached) {
      console.log('📦 [Comments Cache] Using cached comment:', id);
      return cached;
    }
    
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    
    const comment = Comment.fromFirestore(docSnap);
    cacheManager.set('COMMENTS', `id_${id}`, comment, CACHE_CONFIG.COMMENTS.BY_ID);
    return comment;
  },
};

