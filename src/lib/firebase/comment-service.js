/**
 * Comment Service
 * Handles comment operations with Firebase
 * Extends BaseFirebaseService following SOLID principles
 */

import {
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { BaseFirebaseService } from './base-service';
import { Comment } from '@/models/commentModel';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const COMMENTS_COLLECTION = 'comments';

/**
 * Transform function for comment documents
 */
const transformComment = (data) => {
  // Check if it's a Firestore document with .data() method
  if (data && typeof data.data === 'function') {
    return Comment.fromFirestore(data);
  }
  
  // Otherwise, it's already plain data from base-service
  return new Comment({
    id: data.id,
    postId: data.postId,
    user: data.user,
    text: data.text,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  });
};

class CommentService extends BaseFirebaseService {
  constructor() {
    super(COMMENTS_COLLECTION, 'COMMENTS', CACHE_CONFIG.COMMENTS);
  }

  /**
   * Get all comments for a post
   */
  async getCommentsByPost(postId, limitCount) {
    if (!postId) {
      console.error('Invalid postId: undefined');
      return [];
    }

    const limitSuffix = limitCount ? `_limit_${limitCount}` : '';
    const cacheKey = `post_${postId}${limitSuffix}`;
    const constraints = [
      where('postId', '==', postId),
      orderBy('createdAt', 'desc'),
    ];

    if (limitCount) {
      constraints.push(limit(limitCount));
    }

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.COMMENTS.BY_POST,
      transformComment
    );
  }

  /**
   * Get a single comment by ID
   */
  async getCommentById(id) {
    const comment = await this.getById(id, CACHE_CONFIG.COMMENTS.BY_ID);
    return comment ? transformComment(comment) : null;
  }

  /**
   * Add a new comment
   */
  async addComment(commentData) {
    const commentModel = new Comment(commentData);
    const data = commentModel.toFirestore();

    const result = await this.create(data, transformComment);
    
    // Invalidate all comment caches to refresh lists
    this.invalidateCache();
    
    return result;
  }

  /**
   * Update a comment
   */
  async updateComment(id, commentData) {
    const commentModel = new Comment(commentData);
    const data = commentModel.toFirestore();

    await this.update(id, data);
    
    // Invalidate cache
    this.invalidateCache();
    
    // Fetch and return updated comment
    return this.getCommentById(id);
  }

  /**
   * Delete a comment
   */
  async deleteComment(id) {
    const result = await this.delete(id);
    
    // Invalidate cache
    this.invalidateCache();
    
    return result;
  }
}

// Export singleton instance
export const commentService = new CommentService();


