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

const POSTS_COLLECTION = 'posts';

// Helper to check if Firestore is available
const checkFirestore = () => {
  if (!db) {
    console.warn('Firestore is not initialized. Returning empty data.');
    return false;
  }
  return true;
};

export const blogService = {
  // Get all published posts
  async getAllPosts(limitCount) {
    if (!checkFirestore()) return [];

    const constraints = [
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
    ];

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, POSTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  },

  // Get post by slug
  async getPostBySlug(slug) {
    if (!checkFirestore()) return null;

    const q = query(
      collection(db, POSTS_COLLECTION),
      where('slug', '==', slug),
      where('published', '==', true),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnap = querySnapshot.docs[0];
    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    };
  },

  // Get post by ID
  async getPostById(id) {
    if (!checkFirestore()) return null;

    const docRef = doc(db, POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate(),
      updatedAt: docSnap.data().updatedAt?.toDate(),
    };
  },

  // Get posts by category
  async getPostsByCategory(category, limitCount) {
    const constraints = [
      where('published', '==', true),
      where('category', '==', category),
      orderBy('createdAt', 'desc'),
    ];

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, POSTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  },

  // Get posts by tag
  async getPostsByTag(tag, limitCount) {
    const constraints = [
      where('published', '==', true),
      where('tags', 'array-contains', tag),
      orderBy('createdAt', 'desc'),
    ];

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    const q = query(collection(db, POSTS_COLLECTION), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    }));
  },

  // Create a new post
  async createPost(post) {
    const docRef = await addDoc(collection(db, POSTS_COLLECTION), {
      ...post,
      createdAt: post.createdAt ? Timestamp.fromDate(post.createdAt) : Timestamp.now(),
      updatedAt: post.updatedAt ? Timestamp.fromDate(post.updatedAt) : Timestamp.now(),
    });

    return docRef.id;
  },

  // Update a post
  async updatePost(id, post) {
    const docRef = doc(db, POSTS_COLLECTION, id);
    const updateData = { ...post };

    if (post.createdAt) {
      updateData.createdAt = Timestamp.fromDate(post.createdAt);
    }
    if (post.updatedAt) {
      updateData.updatedAt = Timestamp.fromDate(post.updatedAt);
    }

    await updateDoc(docRef, updateData);
  },

  // Delete a post
  async deletePost(id) {
    const docRef = doc(db, POSTS_COLLECTION, id);
    await deleteDoc(docRef);
  },

  // Increment view count
  async incrementViews(id) {
    const docRef = doc(db, POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const currentViews = docSnap.data().views || 0;
      await updateDoc(docRef, { views: currentViews + 1 });
    }
  },
};
