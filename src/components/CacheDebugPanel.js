import { useEffect, useState } from 'react';

export default function CacheDebugPanel({ maxEntries = 50 }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const entry = { time: new Date().toISOString(), ...e.detail };
      setEvents(prev => [entry, ...prev].slice(0, maxEntries));
      // Also mirror to console for visibility
      console.log('🧭 [CacheDebugPanel] ', entry);
    };

    window.addEventListener('bloggie-cache', handler);
    return () => window.removeEventListener('bloggie-cache', handler);
  }, [maxEntries]);

  if (!(process.env.NEXT_PUBLIC_CACHE_DEBUG === 'true')) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 w-96 max-h-[60vh] overflow-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs">
      <div className="flex items-center justify-between mb-2">
        <strong className="text-sm">Cache Debug</strong>
        <span className="text-gray-500">live</span>
      </div>
      <ul className="space-y-2">
        {events.length === 0 && <li className="text-gray-500">No events yet</li>}
        {events.map((ev, idx) => (
          <li key={idx} className="break-words">
            <div className="text-gray-600 dark:text-gray-300">{ev.time}</div>
            <div className="text-gray-800 dark:text-gray-100">{ev.action} — {ev.key || ev.namespace || ''} {ev.ttl ? `(TTL ${ev.ttl}ms)` : ''}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
