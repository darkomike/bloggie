'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { blogService } from '@/lib/firebase/blog-service';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch and filter posts based on search query
  const handleSearch = async (value) => {
    setSearchQuery(value);

    if (value.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const allPosts = await blogService.getAllPosts();
      const query = value.toLowerCase();
      
      const filtered = allPosts.filter(post =>
        post.title.toLowerCase().includes(query) ||
        post.description?.toLowerCase().includes(query) ||
        post.content?.toLowerCase().includes(query) ||
        post.category?.toLowerCase().includes(query)
      );

      // Limit to 8 results
      setSearchResults(filtered.slice(0, 8));
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResultClick = () => {
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div ref={searchRef} className="relative hidden md:block">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full sm:w-64 px-4 py-2 pl-10 pr-10 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 border border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
        />
        
        {/* Search Icon */}
        <svg
          className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 dark:text-gray-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* Keyboard Shortcut Hint */}
        {searchQuery === '' && (
          <div className="absolute right-3 top-2.5 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
            <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 font-mono">
              ⌘K
            </kbd>
          </div>
        )}

        {/* Clear Button */}
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (searchQuery.length > 0 || searchResults.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="px-4 py-8 text-center">
              <div className="inline-block">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  onClick={handleResultClick}
                  className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
                        {post.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                        {post.description || 'No description'}
                      </p>
                    </div>
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300 whitespace-nowrap">
                      {post.category}
                    </span>
                  </div>
                </Link>
              ))}
              {searchQuery && searchResults.length > 0 && searchResults.length < 8 && (
                <div className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400">
                  Showing {searchResults.length} results
                </div>
              )}
            </div>
          ) : searchQuery ? (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">No posts found for "{searchQuery}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
