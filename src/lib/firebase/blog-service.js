/**
 * Blog Service
 * Handles blog post operations with Firebase
 * Extends BaseFirebaseService following SOLID principles
 */

import {
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from 'firebase/firestore';
import { BaseFirebaseService } from './base-service';
import PostModel from '@/models/postModel';
import { TimeUtil } from '@/utils/timeUtils';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const POSTS_COLLECTION = 'posts';

/**
 * Serialize post for client consumption
 * Single Responsibility: Only handles post serialization
 */
const serializePost = (post) => {
  if (!post) return null;
  
  return {
    id: post.id || '',
    title: post.title || '',
    slug: post.slug || '',
    content: post.content || '',
    category: post.category || '',
    author: post.author ? { ...post.author } : null,
    createdAt: post.createdAt instanceof Date 
      ? post.createdAt.toISOString() 
      : (typeof post.createdAt === 'string' ? post.createdAt : null),
    updatedAt: post.updatedAt instanceof Date 
      ? post.updatedAt.toISOString() 
      : (typeof post.updatedAt === 'string' ? post.updatedAt : null),
    tags: Array.isArray(post.tags) ? [...post.tags] : [],
    coverImage: post.coverImage || '',
    status: post.status || 'published',
    readingTime: post.readingTime || 0,
    published: post.published !== undefined ? post.published : true,
    excerpt: post.excerpt || '',
  };
};

/**
 * Transform function for post documents
 * Parses Firebase timestamps and serializes
 */
const transformPost = (data, doc) => {
  const post = PostModel.fromFirestore(doc || data);
  post.createdAt = TimeUtil.parseFirebaseTime(post.createdAt);
  post.updatedAt = TimeUtil.parseFirebaseTime(post.updatedAt);
  return serializePost(post);
};

class BlogService extends BaseFirebaseService {
  constructor() {
    super(POSTS_COLLECTION, 'POSTS', CACHE_CONFIG.POSTS);
  }

  /**
   * Get all published posts
   */
  async getAllPosts(limitCount) {
    const cacheKey = `all_${limitCount || 'unlimited'}`;
    const constraints = [
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
    ];
    
    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.POSTS.ALL_POSTS,
      transformPost
    );
  }

  /**
   * Get post by slug
   */
  async getPostBySlug(slug) {
    const cacheKey = `slug_${slug}`;
    const constraints = [
      where('slug', '==', slug),
      where('published', '==', true),
      limit(1),
    ];

    const posts = await this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.POSTS.POST_BY_SLUG,
      transformPost
    );

    return posts.length > 0 ? posts[0] : null;
  }

  /**
   * Get post by ID
   */
  async getPostById(id) {
    const cacheKey = `id_${id}`;
    const post = await this.getById(id, CACHE_CONFIG.POSTS.POST_BY_ID);
    
    if (!post) return null;
    
    return transformPost(post);
  }

  /**
   * Get posts by field (generic helper)
   */
  async getPostsByField(field, value, limitCount, arrayContains = false) {
    const cacheKey = `${field}_${value}_${limitCount || 'unlimited'}`;
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

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.POSTS.POSTS_BY_CATEGORY,
      transformPost
    );
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(category, limitCount) {
    return this.getPostsByField('category', category, limitCount);
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(tag, limitCount) {
    return this.getPostsByField('tags', tag, limitCount, true);
  }

  /**
   * Get draft posts by author
   */
  async getDraftPostsByAuthor(authorUid) {
    const constraints = [
      where('author.uid', '==', authorUid),
      where('published', '==', false),
      orderBy('createdAt', 'desc'),
    ];

    return this.fetchDocuments(constraints, transformPost);
  }

  /**
   * Get all posts by author (published and unpublished)
   */
  async getPostsByAuthor(authorUid) {
    const cacheKey = `author_${authorUid}`;
    const constraints = [
      where('author.uid', '==', authorUid),
      orderBy('createdAt', 'desc'),
    ];

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.POSTS.POSTS_BY_AUTHOR,
      transformPost
    );
  }

  /**
   * Get published posts by author only
   */
  async getPublishedPostsByAuthor(authorUid) {
    const cacheKey = `published_author_${authorUid}`;
    const constraints = [
      where('author.uid', '==', authorUid),
      orderBy('createdAt', 'desc'),
    ];

    // Fetch all and filter client-side to avoid composite index
    const allPosts = await this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.POSTS.POSTS_BY_AUTHOR,
      transformPost
    );

    return allPosts.filter(post => post.published === true);
  }

  /**
   * Create a new post
   */
  async createPost(postData) {
    const data = postData instanceof PostModel ? postData.toFirestore() : postData;
    
    // Normalize timestamps
    data.createdAt = this.normalizeTimestamp(data.createdAt);
    data.updatedAt = this.normalizeTimestamp(data.updatedAt);

    const result = await this.create(data, transformPost);
    return result;
  }

  /**
   * Update a post
   */
  async updatePost(id, postData) {
    const data = postData instanceof PostModel ? postData.toFirestore() : postData;
    
    // Normalize timestamps if provided
    if (data.createdAt) {
      data.createdAt = this.normalizeTimestamp(data.createdAt);
    }
    if (data.updatedAt) {
      data.updatedAt = this.normalizeTimestamp(data.updatedAt);
    }

    await this.update(id, data);
    
    // Fetch updated post
    return this.getPostById(id);
  }

  /**
   * Delete a post
   */
  async deletePost(id) {
    return this.delete(id);
  }
}

// Export singleton instance
export const blogService = new BlogService();
