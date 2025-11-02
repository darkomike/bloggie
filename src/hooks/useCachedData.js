/**
 * useCachedData Hook
 * Provides easy access to cached data fetching with automatic invalidation
 * Usage: const data = useCachedData('posts', 'all', fetchFunction, ttl)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { cacheManager } from '@/lib/cache/cacheManager';
import { CACHE_CONFIG } from '@/lib/cache/cacheConfig';

export function useCachedData(namespace, key, fetchFunction, ttlMs = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // Determine TTL from CACHE_CONFIG if not provided
  const ttl = ttlMs !== null ? ttlMs : (CACHE_CONFIG[namespace]?.[key] || 0);

  // Get full cache key
  const cacheKey = cacheManager.generateKey(namespace, key);

  // Fetch data with cache support
  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!mountedRef.current) return null;

    try {
      if (mountedRef.current) setLoading(true);

      // Check cache first (unless force refresh)
      if (!forceRefresh) {
        const cachedData = cacheManager.get(namespace, key);
        if (cachedData !== null && mountedRef.current) {
          setData(cachedData);
          setLoading(false);
          return cachedData;
        }
      }

      // Fetch fresh data
      const freshData = await fetchFunction();
      
      if (mountedRef.current) {
        // Cache the result
        cacheManager.set(namespace, key, freshData, ttl);
        setData(freshData);
        setError(null);
        setLoading(false);
      }
      
      return freshData;
    } catch (err) {
      if (mountedRef.current) {
        console.error(`[useCachedData] Error fetching ${cacheKey}:`, err);
        setError(err);
        setLoading(false);
      }
      throw err;
    }
  }, [namespace, key, fetchFunction, ttl, cacheKey]);

  // Initial fetch on mount
  useEffect(() => {
    let isMounted = true;
    
    const doFetch = async () => {
      if (isMounted) {
        try {
          await fetchData();
        } catch (err) {
          if (isMounted) {
            console.error('Initial fetch failed:', err);
          }
        }
      }
    };

    doFetch();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Function to manually invalidate cache
  const invalidateCache = useCallback(() => {
    cacheManager.delete(namespace, key);
  }, [namespace, key]);

  // Function to manually refresh data
  const refresh = useCallback(async () => {
    return await fetchData(true);
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    invalidateCache,
    refresh,
    cacheKey,
  };
}

export default useCachedData;
