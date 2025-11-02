/**
 * Cache Manager
 * Handles in-memory caching with TTL (Time-To-Live) support
 * Prevents redundant data requests and improves app performance
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }

  /**
   * Generate a cache key from parameters
   * @param {string} namespace - Cache namespace (e.g., 'posts', 'users')
   * @param {string} key - Unique key
   * @returns {string} Complete cache key
   */
  generateKey(namespace, key) {
    return `${namespace}:${key}`;
  }

  /**
   * Set a value in cache with optional TTL
   * @param {string} namespace - Cache namespace
   * @param {string} key - Unique key
   * @param {any} value - Value to cache
   * @param {number} ttl - Time-to-live in milliseconds (0 = no expiration)
   */
  set(namespace, key, value, ttl = 0) {
    const cacheKey = this.generateKey(namespace, key);
    
    // Clear existing timer if any
    if (this.timers.has(cacheKey)) {
      clearTimeout(this.timers.get(cacheKey));
      this.timers.delete(cacheKey);
    }

    // Store value
    this.cache.set(cacheKey, {
      value,
      timestamp: Date.now(),
      ttl,
    });

    // Set expiration timer if TTL is specified
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(namespace, key);
      }, ttl);
      this.timers.set(cacheKey, timer);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ [Cache] Set: ${cacheKey} (TTL: ${ttl}ms)`);
    }
  }

  /**
   * Get a value from cache
   * @param {string} namespace - Cache namespace
   * @param {string} key - Unique key
   * @returns {any|null} Cached value or null if not found/expired
   */
  get(namespace, key) {
    const cacheKey = this.generateKey(namespace, key);
    const cached = this.cache.get(cacheKey);

    if (!cached) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`❌ [Cache] Miss: ${cacheKey}`);
      }
      return null;
    }

    // Check if expired
    if (cached.ttl > 0) {
      const age = Date.now() - cached.timestamp;
      if (age > cached.ttl) {
        this.delete(namespace, key);
        if (process.env.NODE_ENV === 'development') {
          console.log(`⏰ [Cache] Expired: ${cacheKey}`);
        }
        return null;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🎯 [Cache] Hit: ${cacheKey}`);
    }
    return cached.value;
  }

  /**
   * Check if a key exists and is valid
   * @param {string} namespace - Cache namespace
   * @param {string} key - Unique key
   * @returns {boolean} True if key exists and is not expired
   */
  has(namespace, key) {
    return this.get(namespace, key) !== null;
  }

  /**
   * Delete a specific cache entry
   * @param {string} namespace - Cache namespace
   * @param {string} key - Unique key
   */
  delete(namespace, key) {
    const cacheKey = this.generateKey(namespace, key);
    this.cache.delete(cacheKey);
    
    if (this.timers.has(cacheKey)) {
      clearTimeout(this.timers.get(cacheKey));
      this.timers.delete(cacheKey);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`🗑️  [Cache] Deleted: ${cacheKey}`);
    }
  }

  /**
   * Clear all cache entries for a namespace
   * @param {string} namespace - Cache namespace to clear
   */
  clearNamespace(namespace) {
    const prefix = `${namespace}:`;
    const keysToDelete = Array.from(this.cache.keys()).filter(key => key.startsWith(prefix));
    
    keysToDelete.forEach(key => {
      this.cache.delete(key);
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
        this.timers.delete(key);
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`🗑️  [Cache] Cleared namespace: ${namespace} (${keysToDelete.length} entries)`);
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.cache.forEach((_, key) => {
      if (this.timers.has(key)) {
        clearTimeout(this.timers.get(key));
      }
    });
    this.cache.clear();
    this.timers.clear();

    if (process.env.NODE_ENV === 'development') {
      console.log(`🗑️  [Cache] Cleared all cache`);
    }
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    return {
      totalEntries: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, data]) => ({
        key,
        timestamp: new Date(data.timestamp).toISOString(),
        ttl: data.ttl,
        age: Date.now() - data.timestamp,
      })),
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
