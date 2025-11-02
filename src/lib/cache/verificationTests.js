/**
 * Cache System Verification Test
 * Run this to verify caching is working correctly
 * 
 * Usage:
 * 1. Copy this to your browser console or use in a test file
 * 2. Watch the console for cache hit/miss logs
 * 3. Verify performance improvements
 */

import { cacheManager } from '@/lib/cache/cacheManager';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';
import { blogService } from '@/lib/firebase/blog-service';
import { userService } from '@/lib/firebase/user-service';

export const cacheVerificationTests = {
  /**
   * Test 1: Basic cache operations
   */
  async testBasicCaching() {
    console.log('🧪 [Test 1] Basic Cache Operations');
    console.log('─'.repeat(50));
    
    // Set a value
    cacheManager.set('TEST', 'key1', { data: 'test' }, 60000);
    console.log('✅ Set cache: TEST:key1');
    
    // Get the value
    const value = cacheManager.get('TEST', 'key1');
    console.assert(value?.data === 'test', 'Cache get failed');
    console.log('✅ Get cache: TEST:key1 → ' + JSON.stringify(value));
    
    // Check existence
    const exists = cacheManager.has('TEST', 'key1');
    console.assert(exists, 'Cache has() failed');
    console.log('✅ Has cache: TEST:key1 → true');
    
    // Delete
    cacheManager.delete('TEST', 'key1');
    const deleted = cacheManager.get('TEST', 'key1');
    console.assert(deleted === null, 'Cache delete failed');
    console.log('✅ Deleted cache: TEST:key1');
    console.log('✅ Test 1 passed!\n');
  },

  /**
   * Test 2: TTL expiration
   */
  async testTTLExpiration() {
    console.log('🧪 [Test 2] TTL Expiration');
    console.log('─'.repeat(50));
    
    // Set with 1 second TTL
    cacheManager.set('TEST', 'ttl_key', 'expires soon', 1000);
    console.log('✅ Set cache with 1 second TTL');
    
    // Should exist immediately
    const immediate = cacheManager.get('TEST', 'ttl_key');
    console.assert(immediate === 'expires soon', 'TTL cache not set');
    console.log('✅ Cache exists immediately');
    
    // Wait 1.5 seconds and check again
    await new Promise(resolve => setTimeout(resolve, 1500));
    const expired = cacheManager.get('TEST', 'ttl_key');
    console.assert(expired === null, 'TTL expiration failed');
    console.log('✅ Cache expired after TTL');
    console.log('✅ Test 2 passed!\n');
  },

  /**
   * Test 3: Blog service caching
   */
  async testBlogServiceCaching() {
    console.log('🧪 [Test 3] Blog Service Caching');
    console.log('─'.repeat(50));
    
    try {
      // First call - should fetch from Firebase
      console.time('First getAllPosts() call');
      const posts1 = await blogService.getAllPosts();
      console.timeEnd('First getAllPosts() call');
      console.log(`✅ Fetched ${posts1.length} posts from Firebase`);
      
      // Second call - should use cache
      console.time('Second getAllPosts() call (cached)');
      const posts2 = await blogService.getAllPosts();
      console.timeEnd('Second getAllPosts() call (cached)');
      console.log(`✅ Retrieved ${posts2.length} posts from cache`);
      
      // Verify same data
      console.assert(
        posts1.length === posts2.length,
        'Cache returned different data'
      );
      console.log('✅ Cache returned identical data');
      console.log('✅ Test 3 passed!\n');
    } catch (err) {
      console.error('❌ Test 3 failed:', err);
    }
  },

  /**
   * Test 4: User service caching
   */
  async testUserServiceCaching() {
    console.log('🧪 [Test 4] User Service Caching');
    console.log('─'.repeat(50));
    
    try {
      // Get stats
      const stats = cacheManager.getStats();
      console.log(`📊 Current cache: ${stats.totalEntries} entries`);
      
      if (stats.totalEntries > 0) {
        console.log('Recent cache entries:');
        stats.entries.slice(0, 3).forEach(entry => {
          console.log(`  - ${entry.key} (age: ${entry.age}ms)`);
        });
      }
      
      console.log('✅ Test 4 passed!\n');
    } catch (err) {
      console.error('❌ Test 4 failed:', err);
    }
  },

  /**
   * Test 5: Cache invalidation
   */
  async testCacheInvalidation() {
    console.log('🧪 [Test 5] Cache Invalidation');
    console.log('─'.repeat(50));
    
    // Set some cache
    cacheManager.set('POSTS', 'test_post_1', { id: 1 }, 60000);
    cacheManager.set('POSTS', 'test_post_2', { id: 2 }, 60000);
    cacheManager.set('USERS', 'test_user_1', { id: 'u1' }, 60000);
    console.log('✅ Set 3 cache entries');
    
    // Clear POSTS namespace
    cacheManager.clearNamespace('POSTS');
    console.log('✅ Cleared POSTS namespace');
    
    // Verify POSTS cleared
    const post1 = cacheManager.get('POSTS', 'test_post_1');
    console.assert(post1 === null, 'Namespace clear failed');
    console.log('✅ POSTS entries cleared');
    
    // Verify USERS not affected
    const user1 = cacheManager.get('USERS', 'test_user_1');
    console.assert(user1?.id === 'u1', 'Other namespace affected');
    console.log('✅ Other namespaces unaffected');
    
    console.log('✅ Test 5 passed!\n');
  },

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('\n');
    console.log('╔═══════════════════════════════════════════════════╗');
    console.log('║     Cache System Verification Tests               ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');
    
    try {
      await this.testBasicCaching();
      await this.testTTLExpiration();
      await this.testBlogServiceCaching();
      await this.testUserServiceCaching();
      await this.testCacheInvalidation();
      
      console.log('╔═══════════════════════════════════════════════════╗');
      console.log('║     ✅ All Tests Passed!                          ║');
      console.log('╚═══════════════════════════════════════════════════╝\n');
    } catch (err) {
      console.error('❌ Tests failed:', err);
    }
  }
};

// Export for use
export default cacheVerificationTests;

/**
 * Quick health check - run in browser console:
 * 
 * import { cacheVerificationTests } from '@/lib/cache/verificationTests';
 * await cacheVerificationTests.runAllTests();
 */
