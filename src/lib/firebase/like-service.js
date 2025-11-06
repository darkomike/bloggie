/**
 * Like Service
 * Handles like operations with Firebase
 * Extends BaseFirebaseService following SOLID principles
 */

import {
  where,
  Timestamp,
} from 'firebase/firestore';
import { BaseFirebaseService } from './base-service';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const LIKES_COLLECTION = 'likes';

/**
 * Transform function for like documents
 */
const transformLike = (data) => ({
  id: data.id,
  ...data,
  createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
});

class LikeService extends BaseFirebaseService {
  constructor() {
    super(LIKES_COLLECTION, 'LIKES', CACHE_CONFIG.LIKES);
  }

  /**
   * Get all likes for a post
   */
  async getLikesByPost(postId) {
    const cacheKey = `post_${postId}`;
    const constraints = [where('postId', '==', postId)];

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.LIKES.LIKES_BY_POST,
      transformLike
    );
  }

  /**
   * Check if user has liked a post
   */
  async hasUserLiked(postId, userId) {
    if (!postId || !userId) return false;

    const constraints = [
      where('postId', '==', postId),
      where('userId', '==', userId),
    ];

    const likes = await this.fetchDocuments(constraints);
    return likes.length > 0;
  }

  /**
   * Get like count for a post
   */
  async getLikeCount(postId) {
    const cacheKey = `count_${postId}`;
    const cached = await this.getAll(
      [where('postId', '==', postId)],
      cacheKey,
      CACHE_CONFIG.LIKES.LIKES_COUNT
    );

    return cached.length;
  }

  /**
   * Add a like
   */
  async addLike(likeData) {
    if (!this.checkFirestore()) return null;
    if (!likeData.postId || !likeData.user?.id) return null;

    // Prevent duplicate like
    const alreadyLiked = await this.hasUserLiked(likeData.postId, likeData.user.id);
    if (alreadyLiked) return null;

    const data = {
      ...likeData,
      userId: likeData.user.id,
      createdAt: Timestamp.now(),
    };

    const result = await this.create(data);

    // Invalidate cache
    this.invalidateCache(`post_${likeData.postId}`);
    this.invalidateCache(`count_${likeData.postId}`);

    return result.id;
  }

  /**
   * Remove a like
   */
  async removeLike(postId, userId) {
    if (!this.checkFirestore() || !postId || !userId) return null;

    const constraints = [
      where('postId', '==', postId),
      where('userId', '==', userId),
    ];

    const likes = await this.fetchDocuments(constraints);
    
    if (likes.length > 0) {
      const likeId = likes[0].id;
      await this.delete(likeId);

      // Invalidate cache
      this.invalidateCache(`post_${postId}`);
      this.invalidateCache(`count_${postId}`);

      return likeId;
    }

    return null;
  }

  /**
   * Get like by ID
   */
  async getLikeById(id) {
    const like = await this.getById(id, CACHE_CONFIG.LIKES.BY_ID);
    return like ? transformLike(like) : null;
  }

  /**
   * Get all posts liked by a user
   */
  async getUserLikedPosts(userId) {
    const cacheKey = `user_${userId}`;
    const constraints = [where('userId', '==', userId)];

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.LIKES.LIKES_BY_USER,
      transformLike
    );
  }

  /**
   * Get all likes
   */
  async getAllLikes() {
    return this.getAll([], 'all_likes', CACHE_CONFIG.LIKES.ALL_LIKES, transformLike);
  }
}

// Export singleton instance
export const likeService = new LikeService();
