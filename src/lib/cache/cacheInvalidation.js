/**
 * Cache Invalidation Utilities
 * Handles cache invalidation when data is created, updated, or deleted
 */

import { cacheManager } from '@/lib/cache/cacheManager';
import { CACHE_INVALIDATION_EVENTS } from '@/lib/cache/cacheConfig';

/**
 * Invalidate cache based on event type
 * @param {string} eventType - Type of event (e.g., 'POST_CREATED', 'USER_UPDATED')
 */
export const invalidateCacheByEvent = (eventType) => {
  const keysToInvalidate = CACHE_INVALIDATION_EVENTS[eventType] || [];
  
  keysToInvalidate.forEach(cacheKey => {
    // Parse namespace and key from cache key format: "namespace:key"
    const [namespace, key] = cacheKey.split(':');
    if (namespace && key) {
      cacheManager.delete(namespace, key);
      console.log(`🔄 [Cache] Invalidated: ${cacheKey}`);
    }
  });
};

/**
 * Clear specific namespace cache
 * @param {string} namespace - Cache namespace to clear (e.g., 'POSTS', 'USERS')
 */
export const clearNamespaceCache = (namespace) => {
  cacheManager.clearNamespace(namespace);
  console.log(`🔄 [Cache] Cleared namespace: ${namespace}`);
};

/**
 * Clear all application cache
 */
export const clearAllCache = () => {
  cacheManager.clear();
  console.log('🔄 [Cache] Cleared all application cache');
};

/**
 * Invalidate specific post cache entries
 * @param {string} postId - Post ID
 * @param {string} slug - Post slug
 */
export const invalidatePostCache = (postId, slug) => {
  if (postId) {
    cacheManager.delete('POSTS', `id_${postId}`);
  }
  if (slug) {
    cacheManager.delete('POSTS', `slug_${slug}`);
  }
  // Clear all posts lists
  cacheManager.clearNamespace('POSTS');
  console.log('🔄 [Cache] Invalidated post cache');
};

/**
 * Invalidate specific user cache entries
 * @param {string} userId - User ID
 */
export const invalidateUserCache = (userId) => {
  if (userId) {
    cacheManager.delete('USERS', userId);
  }
  // Clear all users lists
  cacheManager.clearNamespace('USERS');
  console.log('🔄 [Cache] Invalidated user cache');
};

/**
 * Invalidate followers/following cache
 * @param {string} userId - User ID
 */
export const invalidateFollowCache = (userId) => {
  if (userId) {
    cacheManager.delete('FOLLOWS', `followers_${userId}`);
    cacheManager.delete('FOLLOWS', `following_${userId}`);
    cacheManager.delete('FOLLOWS', `follower_count_${userId}`);
    cacheManager.delete('FOLLOWS', `following_count_${userId}`);
  }
  console.log('🔄 [Cache] Invalidated follow cache');
};

/**
 * Invalidate comments cache
 * @param {string} postId - Post ID
 */
export const invalidateCommentsCache = (postId) => {
  if (postId) {
    cacheManager.delete('COMMENTS', `post_${postId}`);
    cacheManager.delete('COMMENTS', `count_${postId}`);
  }
  console.log('🔄 [Cache] Invalidated comments cache');
};

/**
 * Invalidate likes cache
 * @param {string} postId - Post ID
 */
export const invalidateLikesCache = (postId) => {
  if (postId) {
    cacheManager.delete('LIKES', `post_${postId}`);
    cacheManager.delete('LIKES', `count_${postId}`);
  }
  console.log('🔄 [Cache] Invalidated likes cache');
};

const cacheInvalidation = {
  invalidateCacheByEvent,
  clearNamespaceCache,
  clearAllCache,
  invalidatePostCache,
  invalidateUserCache,
  invalidateFollowCache,
  invalidateCommentsCache,
  invalidateLikesCache,
};

export default cacheInvalidation;
