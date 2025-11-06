/**
 * Follow Service
 * Handles follow/unfollow operations with Firebase
 * Extends BaseFirebaseService following SOLID principles
 */

import {
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './config';
import { Follow } from '@/models/followModel';
import { BaseFirebaseService } from './base-service';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

const FOLLOWS_COLLECTION = 'follows';
const USERS_COLLECTION = 'users';

/**
 * Transform function for follow documents
 */
const transformFollow = (data, id) => {
  if (data instanceof Follow) return data;
  return Follow.fromFirestore(data, id);
};

/**
 * Utility functions for user lookups
 */
export async function getUserIdByUsername(username) {
  if (!db || !username) return null;

  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('username', '==', username.toLowerCase())
    );
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : snapshot.docs[0].id;
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

export async function getUserByUsername(username) {
  if (!db || !username) return null;

  try {
    const q = query(
      collection(db, USERS_COLLECTION),
      where('username', '==', username.toLowerCase())
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    return {
      uid: snapshot.docs[0].id,
      ...snapshot.docs[0].data(),
    };
  } catch (error) {
    console.error('Error fetching user by username:', error);
    return null;
  }
}

class FollowService extends BaseFirebaseService {
  constructor() {
    super(FOLLOWS_COLLECTION, 'FOLLOWS', CACHE_CONFIG.FOLLOWS);
  }

  /**
   * Follow a user
   */
  async followUser(followerId, followingId, followerData = {}, followingData = {}) {
    if (!this.checkFirestore() || !followerId || !followingId) return null;

    // Don't allow users to follow themselves
    if (followerId === followingId) {
      console.warn('Users cannot follow themselves');
      return null;
    }

    try {
      const data = {
        followerId,
        followingId,
        createdAt: serverTimestamp(),
        followerName: followerData.displayName || '',
        followerPhotoURL: followerData.photoURL || '',
        followingName: followingData.displayName || '',
        followingPhotoURL: followingData.photoURL || '',
      };

      const result = await this.create(data);

      // Invalidate cache
      this.invalidateCache(`following_${followerId}`);
      this.invalidateCache(`followers_${followingId}`);
      this.invalidateCache(`follower_count_${followingId}`);
      this.invalidateCache(`following_count_${followerId}`);

      return Follow.fromFirestore(
        {
          ...data,
          createdAt: new Date(),
        },
        result.id
      );
    } catch (error) {
      console.error('Error following user:', error);
      return null;
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(followerId, followingId) {
    if (!this.checkFirestore() || !followerId || !followingId) return false;

    try {
      const constraints = [
        where('followerId', '==', followerId),
        where('followingId', '==', followingId),
      ];

      const follows = await this.fetchDocuments(constraints);

      if (follows.length === 0) {
        console.warn('Follow relationship not found');
        return false;
      }

      await this.delete(follows[0].id);

      // Invalidate cache
      this.invalidateCache(`following_${followerId}`);
      this.invalidateCache(`followers_${followingId}`);
      this.invalidateCache(`follower_count_${followingId}`);
      this.invalidateCache(`following_count_${followerId}`);

      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  }

  /**
   * Check if a user is following another user
   */
  async isFollowing(followerId, followingId) {
    if (!this.checkFirestore() || !followerId || !followingId) return false;

    try {
      const constraints = [
        where('followerId', '==', followerId),
        where('followingId', '==', followingId),
      ];

      const follows = await this.fetchDocuments(constraints);
      return follows.length > 0;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  /**
   * Get all users that a user is following
   */
  async getFollowing(userId) {
    const cacheKey = `following_${userId}`;
    const constraints = [where('followerId', '==', userId)];

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.FOLLOWS.FOLLOWING,
      transformFollow
    );
  }

  /**
   * Get all followers of a user
   */
  async getFollowers(userId) {
    const cacheKey = `followers_${userId}`;
    const constraints = [where('followingId', '==', userId)];

    return this.getAll(
      constraints,
      cacheKey,
      CACHE_CONFIG.FOLLOWS.FOLLOWERS,
      transformFollow
    );
  }

  /**
   * Get follower count for a user
   */
  async getFollowerCount(userId) {
    const cacheKey = `follower_count_${userId}`;
    const cached = await this.getAll(
      [where('followingId', '==', userId)],
      cacheKey,
      CACHE_CONFIG.FOLLOWS.FOLLOWER_COUNT
    );

    return cached.length;
  }

  /**
   * Get following count for a user
   */
  async getFollowingCount(userId) {
    const cacheKey = `following_count_${userId}`;
    const cached = await this.getAll(
      [where('followerId', '==', userId)],
      cacheKey,
      CACHE_CONFIG.FOLLOWS.FOLLOWING_COUNT
    );

    return cached.length;
  }

  /**
   * Get all follows (admin use)
   */
  async getAllFollows() {
    return this.getAll([], 'all_follows', CACHE_CONFIG.FOLLOWS.ALL_FOLLOWS, transformFollow);
  }

  /**
   * Delete all follows (admin use - careful!)
   */
  async deleteAllFollows() {
    if (!this.checkFirestore()) return false;

    try {
      const follows = await this.getAllFollows();
      for (const follow of follows) {
        await this.delete(follow.id);
      }

      // Clear all cache
      this.invalidateCache();

      return true;
    } catch (error) {
      console.error('Error deleting all follows:', error);
      return false;
    }
  }
}

// Create singleton instance
const followServiceInstance = new FollowService();

// Export individual functions for backward compatibility
export const followUser = (...args) => followServiceInstance.followUser(...args);
export const unfollowUser = (...args) => followServiceInstance.unfollowUser(...args);
export const isFollowing = (...args) => followServiceInstance.isFollowing(...args);
export const getFollowing = (...args) => followServiceInstance.getFollowing(...args);
export const getFollowers = (...args) => followServiceInstance.getFollowers(...args);
export const getFollowerCount = (...args) => followServiceInstance.getFollowerCount(...args);
export const getFollowingCount = (...args) => followServiceInstance.getFollowingCount(...args);
export const getAllFollows = (...args) => followServiceInstance.getAllFollows(...args);
export const deleteAllFollows = (...args) => followServiceInstance.deleteAllFollows(...args);

// Export service object
export const followService = {
  followUser,
  unfollowUser,
  isFollowing,
  getFollowing,
  getFollowers,
  getFollowerCount,
  getFollowingCount,
  getAllFollows,
  deleteAllFollows,
  getUserIdByUsername,
  getUserByUsername,
};
