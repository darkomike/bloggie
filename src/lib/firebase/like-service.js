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
    if (!checkFirestore()) return [];
    const constraints = [
      where('postId', '==', postId),
    ];
    const q = query(collection(db, LIKES_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    }));
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
    const q = query(
      collection(db, 'likes'),
      where('postId', '==', postId),
      where('userId', '==', userId)
    );
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  },
};
