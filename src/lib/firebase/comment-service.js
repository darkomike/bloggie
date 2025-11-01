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
    const constraints = [
      where('postId', '==', postId),
      orderBy('createdAt', 'desc'),
    ];
    if (limitCount) constraints.push(limit(limitCount));
    const q = query(collection(db, COMMENTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => Comment.fromFirestore(doc));
  },

  // Add a new comment
  async addComment(comment) {
    if (!checkFirestore()) return null;
    const commentModel = new Comment(comment);
    const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentModel.toFirestore());
    const addedDoc = await getDoc(docRef);
    return Comment.fromFirestore(addedDoc);
  },

  // Update a comment
  async updateComment(id, comment) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    const updateData = new Comment(comment).toFirestore();
    await updateDoc(docRef, updateData);
    const updatedDoc = await getDoc(docRef);
    return Comment.fromFirestore(updatedDoc);
  },

  // Delete a comment
  async deleteComment(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Get a single comment by ID
  async getCommentById(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, COMMENTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
    return Comment.fromFirestore(docSnap);
  },
};

