/**
 * Cache Configuration
 * Defines TTL (Time-To-Live) values for different data types
 * and provides cache strategies
 */

export const CACHE_CONFIG = {
  // Blog Posts - Cache for 5 minutes (popular content changes less frequently)
  POSTS: {
    ALL_POSTS: 1000 * 60 * 5,           // 5 minutes
    POST_BY_SLUG: 1000 * 60 * 10,       // 10 minutes
    POST_BY_ID: 1000 * 60 * 10,         // 10 minutes
    POSTS_BY_CATEGORY: 1000 * 60 * 5,  // 5 minutes
    POSTS_BY_AUTHOR: 1000 * 60 * 5,    // 5 minutes
    FEATURED_POSTS: 1000 * 60 * 10,    // 10 minutes
  },

  // Users - Cache for 15 minutes (user data changes less frequently)
  USERS: {
    USER_BY_ID: 1000 * 60 * 15,         // 15 minutes
    USER_BY_EMAIL: 1000 * 60 * 15,      // 15 minutes
    USERS_LIST: 1000 * 60 * 10,         // 10 minutes
    USER_PROFILE: 1000 * 60 * 15,       // 15 minutes
  },

  // Comments - Cache for 3 minutes (can change frequently)
  COMMENTS: {
    COMMENTS_BY_POST: 1000 * 60 * 3,    // 3 minutes
    COMMENT_COUNT: 1000 * 60 * 3,       // 3 minutes
  },

  // Followers/Following - Cache for 5 minutes (relationship data)
  FOLLOWS: {
    FOLLOWERS: 1000 * 60 * 5,           // 5 minutes
    FOLLOWING: 1000 * 60 * 5,           // 5 minutes
    FOLLOWER_COUNT: 1000 * 60 * 5,      // 5 minutes
    FOLLOWING_COUNT: 1000 * 60 * 5,     // 5 minutes
    IS_FOLLOWING: 1000 * 60 * 2,        // 2 minutes (changes frequently)
  },

  // Likes - Cache for 2 minutes (changes very frequently)
  LIKES: {
    LIKES_BY_POST: 1000 * 60 * 2,       // 2 minutes
    LIKE_COUNT: 1000 * 60 * 2,          // 2 minutes
    USER_LIKES: 1000 * 60 * 2,          // 2 minutes
  },

  // Views - Cache for 1 minute (changes very frequently)
  VIEWS: {
    VIEW_COUNT: 1000 * 60 * 1,          // 1 minute
    POST_VIEWS: 1000 * 60 * 1,          // 1 minute
  },

  // Categories - Cache for 30 minutes (rarely changes)
  CATEGORIES: {
    ALL_CATEGORIES: 1000 * 60 * 30,     // 30 minutes
    CATEGORY_POSTS: 1000 * 60 * 10,    // 10 minutes
  },

  // Newsletter - Cache for 15 minutes
  NEWSLETTER: {
    SUBSCRIBERS_COUNT: 1000 * 60 * 15,  // 15 minutes
  },

  // Database Stats - Cache for 30 minutes
  STATS: {
    DB_STATS: 1000 * 60 * 30,           // 30 minutes
  },
};

/**
 * Cache strategies for different scenarios
 */
export const CACHE_STRATEGIES = {
  // No cache - always fetch fresh data
  NO_CACHE: {
    ttl: 0,
    description: 'No caching, always fetch fresh',
  },

  // Short-lived cache - for frequently changing data
  SHORT_LIVED: {
    ttl: CACHE_CONFIG.LIKES.LIKE_COUNT,
    description: 'Short-lived cache (1-2 minutes)',
  },

  // Medium-lived cache - for moderately changing data
  MEDIUM_LIVED: {
    ttl: CACHE_CONFIG.COMMENTS.COMMENTS_BY_POST,
    description: 'Medium-lived cache (3-5 minutes)',
  },

  // Long-lived cache - for stable data
  LONG_LIVED: {
    ttl: CACHE_CONFIG.USERS.USER_BY_ID,
    description: 'Long-lived cache (15+ minutes)',
  },

  // Very long cache - for rarely changing data
  VERY_LONG_LIVED: {
    ttl: CACHE_CONFIG.CATEGORIES.ALL_CATEGORIES,
    description: 'Very long cache (30+ minutes)',
  },
};

/**
 * Cache invalidation events
 * Triggered when data is modified
 */
export const CACHE_INVALIDATION_EVENTS = {
  // Posts
  POST_CREATED: ['posts:all', 'categories:posts'],
  POST_UPDATED: ['posts:all', 'posts:featured'],
  POST_DELETED: ['posts:all', 'categories:posts'],
  POST_PUBLISHED: ['posts:all', 'posts:featured'],

  // Users
  USER_UPDATED: ['users:profile'],
  USER_CREATED: ['users:list'],

  // Comments
  COMMENT_CREATED: ['comments:by_post'],
  COMMENT_DELETED: ['comments:by_post'],

  // Follows
  FOLLOW_ADDED: ['follows:followers', 'follows:follower_count'],
  FOLLOW_REMOVED: ['follows:followers', 'follows:follower_count'],

  // Likes
  LIKE_ADDED: ['likes:by_post', 'likes:count'],
  LIKE_REMOVED: ['likes:by_post', 'likes:count'],

  // Views
  VIEW_TRACKED: ['views:post', 'views:count'],
};

export default CACHE_CONFIG;
