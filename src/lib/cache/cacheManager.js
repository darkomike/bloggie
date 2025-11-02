/**
 * Cache Manager
 * Handles in-memory caching with TTL (Time-To-Live) support
 * Prevents redundant data requests and improves app performance
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
    this.pendingRequests = new Map(); // For request coalescing
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      clears: 0,
      startTime: Date.now(),
    };
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

    // Track stats
    this.stats.sets++;

    // Set expiration timer if TTL is specified
    if (ttl > 0) {
      const timer = setTimeout(() => {
        this.delete(namespace, key);
      }, ttl);
      this.timers.set(cacheKey, timer);
    }

    // Logging control: development OR explicit public debug flag
    const shouldLog = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_CACHE_DEBUG === 'true';
    if (shouldLog) {
      console.log(`✅ [Cache] Set: ${cacheKey} (TTL: ${ttl}ms)`);
    }

    // Emit a browser event so client pages (like /blog) can listen and show cache activity
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('bloggie-cache', { detail: { action: 'set', key: cacheKey, ttl } }));
      }
    } catch (e) {
      // ignore - safe fallback for non-browser environments
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
      this.stats.misses++;
      const shouldLog = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_CACHE_DEBUG === 'true';
      if (shouldLog) {
        console.log(`❌ [Cache] Miss: ${cacheKey}`);
      }
      try {
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('bloggie-cache', { detail: { action: 'miss', key: cacheKey } }));
        }
      } catch (e) {}
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
        this.stats.misses++;
        return null;
      }
    }

    this.stats.hits++;
    const shouldLog = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_CACHE_DEBUG === 'true';
    if (shouldLog) {
      console.log(`🎯 [Cache] Hit: ${cacheKey}`);
    }
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('bloggie-cache', { detail: { action: 'hit', key: cacheKey } }));
      }
    } catch (e) {}
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

    this.stats.deletes++;

    const shouldLog = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_CACHE_DEBUG === 'true';
    if (shouldLog) {
      console.log(`🗑️  [Cache] Deleted: ${cacheKey}`);
    }
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('bloggie-cache', { detail: { action: 'delete', key: cacheKey } }));
      }
    } catch (e) {}
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

    this.stats.clears++;

    const shouldLog = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_CACHE_DEBUG === 'true';
    if (shouldLog) {
      console.log(`🗑️  [Cache] Cleared namespace: ${namespace} (${keysToDelete.length} entries)`);
    }
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('bloggie-cache', { detail: { action: 'clearNamespace', namespace, count: keysToDelete.length } }));
      }
    } catch (e) {}
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

    this.stats.clears++;

    const shouldLog = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_CACHE_DEBUG === 'true';
    if (shouldLog) {
      console.log(`🗑️  [Cache] Cleared all cache`);
    }
    try {
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('bloggie-cache', { detail: { action: 'clearAll' } }));
      }
    } catch (e) {}
  }

  /**
   * Get cache statistics
   * @returns {object} Cache statistics
   */
  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRatio = totalRequests > 0 ? ((this.stats.hits / totalRequests) * 100).toFixed(2) : 0;
    const uptime = Date.now() - this.stats.startTime;
    
    return {
      totalEntries: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      totalRequests,
      hitRatio: `${hitRatio}%`,
      sets: this.stats.sets,
      deletes: this.stats.deletes,
      clears: this.stats.clears,
      uptime: `${(uptime / 1000).toFixed(2)}s`,
      entries: Array.from(this.cache.entries()).map(([key, data]) => ({
        key,
        timestamp: new Date(data.timestamp).toISOString(),
        ttl: data.ttl,
        age: Date.now() - data.timestamp,
      })),
    };
  }

  /**
   * Request coalescing: prevents duplicate simultaneous requests for the same cache key
   * If a request is already pending for this key, returns the same promise
   * @param {string} cacheKey - The cache key being requested
   * @param {Function} fetchFn - Async function that returns the data
   * @returns {Promise} Result from cache or pending request
   */
  async getWithCoalescing(cacheKey, fetchFn) {
    // Check if already in cache
    const cached = this.cache.get(cacheKey);
    if (cached && (!cached.ttl || Date.now() - cached.timestamp <= cached.ttl)) {
      return cached.value;
    }

    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    // Create new promise for this request
    const promise = fetchFn();
    this.pendingRequests.set(cacheKey, promise);

    try {
      const result = await promise;
      this.pendingRequests.delete(cacheKey);
      return result;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      throw error;
    }
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();
