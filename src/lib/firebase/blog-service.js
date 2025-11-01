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
import PostModel from '@/models/postModel';
import { TimeUtil } from '@/utils/timeUtils';

const POSTS_COLLECTION = 'posts';
 
// Helper to check if Firestore is available
const checkFirestore = () => {
  if (!db) {
    console.warn('Firestore is not initialized. Returning empty data.');
    return false;
  }
  return true;
};

// Helper to fetch posts with constraints
const fetchPosts = async (constraints) => {
  if (!checkFirestore()) return [];
  const q = query(collection(db, POSTS_COLLECTION), ...constraints);
  const querySnapshot = await getDocs(q);
  const posts = querySnapshot.docs.map((doc) => {
    const post = PostModel.fromFirestore(doc);
    post.createdAt = TimeUtil.parseFirebaseTime(post.createdAt);
    post.updatedAt = TimeUtil.parseFirebaseTime(post.updatedAt);
    return post;
  });
  // Debug: Log fetched posts in production
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    console.log('📊 [BlogService] Fetched posts:', {
      count: posts.length,
      posts: posts.map(p => ({ id: p.id, title: p.title, slug: p.slug, published: p.published, category: p.category }))
    });
  }
  return posts;
};

export const blogService = {
  // Get all published posts
  async getAllPosts(limitCount) {
    const constraints = [
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
    ];
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
  return await fetchPosts(constraints);
  },

  // Get post by slug
  async getPostBySlug(slug) {
    const constraints = [
      where('slug', '==', slug),
      where('published', '==', true),
      limit(1),
    ];
    const posts = await fetchPosts(constraints);
  return posts.length > 0 ? posts[0] : null;
  },

  // Get post by ID
  async getPostById(id) {
    if (!checkFirestore()) return null;
    const docRef = doc(db, POSTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return null;
    }
  const post = PostModel.fromFirestore({ id: docSnap.id, ...docSnap.data() });
  post.createdAt = TimeUtil.parseFirebaseTime(post.createdAt);
  post.updatedAt = TimeUtil.parseFirebaseTime(post.updatedAt);
  return post;
  },

  // Helper to get posts by field
  async getPostsByField(field, value, limitCount, arrayContains = false) {
    const constraints = [
      where('published', '==', true),
      arrayContains
        ? where(field, 'array-contains', value)
        : where(field, '==', value),
      orderBy('createdAt', 'desc'),
    ];
    if (limitCount) {
      constraints.push(limit(limitCount));
    }
  return await fetchPosts(constraints);
  },

  // Get posts by category
  async getPostsByCategory(category, limitCount) {
    return await this.getPostsByField('category', category, limitCount);
  },

  // Get posts by tag
  async getPostsByTag(tag, limitCount) {
  return await this.getPostsByField('tags', tag, limitCount, true);
  },

  // Get draft posts (unpublished) by author
  async getDraftPostsByAuthor(authorUid) {
    if (!checkFirestore()) return [];
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('author.uid', '==', authorUid),
      where('published', '==', false),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const post = PostModel.fromFirestore({ id: doc.id, ...doc.data() });
      post.createdAt = TimeUtil.parseFirebaseTime(post.createdAt);
      post.updatedAt = TimeUtil.parseFirebaseTime(post.updatedAt);
      return post;
    });
  },

  // Get all posts by author (published and unpublished)
  async getPostsByAuthor(authorUid) {
    if (!checkFirestore()) return [];
    const q = query(
      collection(db, POSTS_COLLECTION),
      where('author.uid', '==', authorUid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const post = PostModel.fromFirestore({ id: doc.id, ...doc.data() });
      post.createdAt = TimeUtil.parseFirebaseTime(post.createdAt);
      post.updatedAt = TimeUtil.parseFirebaseTime(post.updatedAt);
      return post;
    });
  },

  // Create a new post
  async createPost(post) {
    const postData = post instanceof PostModel ? post.toFirestore() : post;
    if (postData.createdAt && typeof postData.createdAt === 'string') {
      postData.createdAt = Timestamp.fromDate(new Date(postData.createdAt));
    } else if (postData.createdAt) {
      postData.createdAt = Timestamp.fromDate(postData.createdAt);
    } else {
      postData.createdAt = Timestamp.now();
    }
    if (postData.updatedAt && typeof postData.updatedAt === 'string') {
      postData.updatedAt = Timestamp.fromDate(new Date(postData.updatedAt));
    } else if (postData.updatedAt) {
      postData.updatedAt = Timestamp.fromDate(postData.updatedAt);
    } else {
      postData.updatedAt = Timestamp.now();
    }
  const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData);
  // Fetch the newly created post document
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return PostModel.fromFirestore({ id: docSnap.id, ...docSnap.data() });
  },

  // Update a post
  async updatePost(id, post) {
    const docRef = doc(db, POSTS_COLLECTION, id);
    const updateData = post instanceof PostModel ? post.toFirestore() : post;
    if (updateData.createdAt) {
      // Convert to Date if it's a string
      const createdAt = typeof updateData.createdAt === 'string' ? new Date(updateData.createdAt) : updateData.createdAt;
      updateData.createdAt = Timestamp.fromDate(createdAt);
    }
    if (updateData.updatedAt) {
      // Convert to Date if it's a string
      const updatedAt = typeof updateData.updatedAt === 'string' ? new Date(updateData.updatedAt) : updateData.updatedAt;
      updateData.updatedAt = Timestamp.fromDate(updatedAt);
    }
    await updateDoc(docRef, updateData);
    // Fetch the updated post document
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return PostModel.fromFirestore({ id: docSnap.id, ...docSnap.data() });
  },

  // Delete a post
  async deletePost(id) {
    const docRef = doc(db, POSTS_COLLECTION, id);
    try {
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  },

  // Removed incrementViews, incrementLikes, incrementComments (handled by separate collections)
};
