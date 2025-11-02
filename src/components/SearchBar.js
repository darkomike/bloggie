'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { blogService } from '@/lib/firebase/blog-service';
import { userService } from '@/lib/firebase/user-service';

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [authorResults, setAuthorResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch and filter posts and authors based on search query
  const handleSearch = async (value) => {
    setSearchQuery(value);

    if (value.trim().length === 0) {
      setSearchResults([]);
      setAuthorResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const allPosts = await blogService.getAllPosts();
      const allUsers = await userService.getAllUsers();
      const query = value.toLowerCase();
      
      // Filter posts
      const filtered = allPosts.filter(post => {
        // Search in title, description, content, and category
        const titleMatch = post.title.toLowerCase().includes(query);
        const descriptionMatch = post.description?.toLowerCase().includes(query);
        const contentMatch = post.content?.toLowerCase().includes(query);
        const categoryMatch = post.category?.toLowerCase().includes(query);
        
        // Search in author name and email
        const authorMatch = 
          post.author?.name?.toLowerCase().includes(query) ||
          post.author?.username?.toLowerCase().includes(query) ||
          post.author?.email?.toLowerCase().includes(query);
        
        // Search in tags
        const tagsMatch = post.tags?.some(tag => tag.toLowerCase().includes(query));
        
        return titleMatch || descriptionMatch || contentMatch || categoryMatch || authorMatch || tagsMatch;
      });

      // Filter authors
      const authors = allUsers.filter(user => {
        const nameMatch = user.displayName?.toLowerCase().includes(query);
        const usernameMatch = user.username?.toLowerCase().includes(query);
        const emailMatch = user.email?.toLowerCase().includes(query);
        return nameMatch || usernameMatch || emailMatch;
      }).slice(0, 5); // Limit to 5 authors

      setSearchResults(filtered.slice(0, 8));
      setAuthorResults(authors);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setAuthorResults([]);
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

    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleResultClick = () => {
    setIsOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    setAuthorResults([]);
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
      {(() => {
        let dropdownContent = null;
        if (isLoading) {
          dropdownContent = (
            <div className="px-4 py-8 text-center">
              <div className="inline-block">
                <svg className="h-6 w-6 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          );
        } else if (authorResults.length > 0 || searchResults.length > 0) {
          dropdownContent = (
            <div className="py-2">
              {/* Authors Section */}
              {authorResults.length > 0 && (
                <>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                    👤 Authors
                  </div>
                  {authorResults.map((author) => (
                    <Link
                      key={author.id}
                      href={`/user/${author.id}`}
                      onClick={handleResultClick}
                      className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {author.photoURL && (
                          <Image 
                            src={author.photoURL} 
                            alt={author.displayName}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {author.displayName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            @{author.username}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </>
              )}
              
              {/* Posts Section */}
              {searchResults.length > 0 && (
                <>
                  {authorResults.length > 0 && (
                    <div className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50">
                      📝 Posts
                    </div>
                  )}
                  {searchResults.map((post) => {
                    // Use description if available, otherwise create a snippet from content
                    const description = post.description || 
                      (post.content ? post.content.substring(0, 100).replaceAll(/[*#`\-_]/g, '') + '...' : 'No description available');
                    
                    return (
                      <Link
                        key={post.id}
                        href={`/blog/${post.slug}`}
                        onClick={handleResultClick}
                        className="block px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                      >
                        <div className="space-y-2">
                          {/* Title and Category */}
                          <div className="flex items-start justify-between gap-3">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 flex-1">
                              {post.title}
                            </h4>
                            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300 whitespace-nowrap shrink-0">
                              {post.category}
                            </span>
                          </div>
                          
                          {/* Description */}
                          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                            {description}
                          </p>
                          
                          {/* Author and Tags */}
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Author */}
                            {post.author?.name && (
                              <span className="text-xs text-gray-500 dark:text-gray-500">
                                By <span className="font-medium text-gray-700 dark:text-gray-300">{post.author.name}</span>
                              </span>
                            )}
                            
                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <span key={tag} className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2 py-0.5 text-xs text-gray-600 dark:text-gray-300">
                                    #{tag}
                                  </span>
                                ))}
                                {post.tags.length > 2 && (
                                  <span className="text-xs text-gray-500 dark:text-gray-500">+{post.tags.length - 2}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </>
              )}
              
              {searchQuery && (searchResults.length > 0 || authorResults.length > 0) && (
                <div className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
                  Showing {authorResults.length} {authorResults.length === 1 ? 'author' : 'authors'} • {searchResults.length} {searchResults.length === 1 ? 'post' : 'posts'}
                </div>
              )}
            </div>
          );
        } else if (searchQuery) {
          dropdownContent = (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-600 dark:text-gray-400">{`No posts or authors found for "${searchQuery}"`}</p>
            </div>
          );
        }

        return (
          isOpen && (searchQuery.length > 0 || searchResults.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
              {dropdownContent}
            </div>
          )
        );
      })()}
    </div>
  );
}
