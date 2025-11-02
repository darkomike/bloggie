'use client';

import { useEffect, useState } from 'react';
import { cacheManager } from '@/lib/cache/cacheManager';

export default function CacheStatsPanel() {
  const [stats, setStats] = useState(null);
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('cache-stats') === '1' 
        || localStorage.getItem('cache-stats-enabled') === 'true';
    }
    return false;
  });
  const [updateCount, setUpdateCount] = useState(0);

  useEffect(() => {
    // Update stats periodically
    const interval = setInterval(() => {
      setStats(cacheManager.getStats());
      setUpdateCount(c => c + 1);
    }, 1000);

    // Also listen for cache events to update immediately
    const handleCacheEvent = () => {
      setStats(cacheManager.getStats());
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('bloggie-cache', handleCacheEvent);
    }

    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') {
        window.removeEventListener('bloggie-cache', handleCacheEvent);
      }
    };
  }, []);

  // Separate effect for keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Press Ctrl+Shift+C to toggle cache stats
      if (e.ctrlKey && e.shiftKey && e.code === 'KeyC') {
        setIsVisible(v => {
          const newValue = !v;
          localStorage.setItem('cache-stats-enabled', String(newValue));
          return newValue;
        });
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  if (!stats) return null;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 right-4 z-40 w-12 h-12 rounded-full bg-linear-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all tooltip"
        title="Click to toggle cache stats (Ctrl+Shift+C)"
      >
        💾
      </button>

      {/* Stats Panel */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-40 w-96 bg-gray-900 dark:bg-gray-950 text-white rounded-xl shadow-2xl border border-cyan-500/30 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-cyan-600 to-blue-600 px-4 py-3 flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span>📊 Cache Statistics</span>
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-white hover:text-gray-200 text-xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Stats Grid */}
          <div className="p-4 space-y-4">
            {/* Primary Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Hit Ratio</div>
                <div className="text-2xl font-bold text-green-400 mt-1">{stats.hitRatio}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.hits}H / {stats.misses}M
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Total Entries</div>
                <div className="text-2xl font-bold text-blue-400 mt-1">{stats.totalEntries}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.totalRequests} requests
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Cache Sets</div>
                <div className="text-2xl font-bold text-purple-400 mt-1">{stats.sets}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.deletes} deletes
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Uptime</div>
                <div className="text-2xl font-bold text-orange-400 mt-1">{stats.uptime}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {stats.clears} clear ops
                </div>
              </div>
            </div>

            {/* Cache Entries */}
            {stats.entries && stats.entries.length > 0 && (
              <div className="border-t border-gray-700/50 pt-3">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">
                  Cached Entries ({stats.entries.length})
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {stats.entries.slice(0, 10).map((entry, idx) => (
                    <div key={idx} className="text-xs bg-gray-800/30 rounded px-2 py-1.5 border border-gray-700/30">
                      <div className="font-mono text-gray-300 truncate">{entry.key}</div>
                      <div className="text-gray-500 mt-0.5 flex items-center justify-between">
                        <span>Age: {Math.round(entry.age)}ms</span>
                        <span className="text-cyan-400">TTL: {entry.ttl}ms</span>
                      </div>
                    </div>
                  ))}
                  {stats.entries.length > 10 && (
                    <div className="text-xs text-gray-500 text-center py-2">
                      +{stats.entries.length - 10} more entries
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="text-xs text-gray-500 border-t border-gray-700/50 pt-3">
              💡 Press <kbd className="bg-gray-800 px-1.5 py-0.5 rounded">Ctrl</kbd> + <kbd className="bg-gray-800 px-1.5 py-0.5 rounded">Shift</kbd> + <kbd className="bg-gray-800 px-1.5 py-0.5 rounded">C</kbd> to toggle
            </div>
          </div>
        </div>
      )}
    </>
  );
}
